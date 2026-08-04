<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use App\Models\Follow;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use App\Models\UserAddress;
use App\Services\GHNService;

/**
 * Shop Controller
 * 
 * Xử lý trang shop của sellers và quản lý đơn hàng bán.
 * 
 * @package App\Controllers
 */
class ShopController extends BaseController
{
    /**
     * Trang shop của seller
     */
    public function index(): void
    {
        $userId = $this->query('id');
        $currentUserId = $this->getUserId();

        // Nếu không có ID, hiển thị shop của user hiện tại
        if ($userId === null) {
            if ($currentUserId === null) {
                $this->redirect('/login');
            }
            $userId = $currentUserId;
        } else {
            $userId = (int) $userId;
        }

        $userModel = new User();
        $seller = $userModel->find($userId);

        if ($seller === null) {
            $this->view('errors/404', ['message' => 'Không tìm thấy cửa hàng']);
            return;
        }

        $productModel = new Product();
        $reviewModel = new Review();
        $followModel = new Follow();

        $isFollowing = false;
        if ($currentUserId !== null && $currentUserId !== $userId) {
            $isFollowing = $followModel->isFollowing($currentUserId, $userId);
        }

        $productCount = $productModel->countActiveByUserId($userId);

        $products = $productModel->getByUserId($userId);
        $stats = $reviewModel->getSellerStats($userId);
        $followerCount = $followModel->getFollowerCount($userId);

        $this->view('shop/index', [
            'seller' => $seller,
            'products' => $products,
            'productCount' => $productCount,
            'stats' => $stats,
            'isOwner' => ($currentUserId === $userId),
            'followerCount' => $followerCount,
            'isFollowing' => $isFollowing,
        ]);
    }

    /**
     * API: Toggle follow shop
     */
    public function toggleFollow(): never
    {
        if (!$this->isAuthenticated()) {
            $this->jsonError('Bạn cần đăng nhập để theo dõi');
        }

        $followerId = $this->getUserId();
        $input = $this->getJsonInput();
        $followingId = (int) ($input['shop_id'] ?? 0);

        if ($followingId === 0) {
            $this->jsonError('Shop ID is required');
        }

        if ($followerId === $followingId) {
            $this->jsonError('Bạn không thể tự theo dõi chính mình');
        }

        $followModel = new Follow();
        $isFollowing = $followModel->isFollowing($followerId, $followingId);

        if ($isFollowing) {
            $followModel->unfollow($followerId, $followingId);
            $newStatus = 'unfollowed';
        } else {
            $followModel->follow($followerId, $followingId);
            $newStatus = 'followed';

            // Notify seller
            $notifModel = new Notification();
            $notifModel->create($followingId, 'Có người mới theo dõi cửa hàng của bạn.');
        }

        $this->jsonSuccess('OK', [
            'status' => $newStatus,
            'new_count' => $followModel->getFollowerCount($followingId),
        ]);
    }

    /**
     * Trang quản lý đơn bán hàng
     */
    public function orders(): void
    {
        $user = $this->requireAuth();
        $userId = (int) $user['id'];
        $status = $this->query('status', 'all');

        $orderModel = new Order();
        $allOrders = $orderModel->getBySellerId($userId);

        // Count by status
        // Note: "pending" tab = pending + paid (đơn chờ seller xác nhận)
        $counts = [
            'all' => count($allOrders),
            'pending' => 0,  // Gộp cả pending + paid
            'shipping' => 0,
            'completed' => 0,
            'cancelled' => 0,
        ];

        $orders = [];
        foreach ($allOrders as $order) {
            $orderStatus = $order['status'];

            // Gộp pending và paid vào nhóm "pending" (Chờ xác nhận)
            if ($orderStatus === 'pending' || $orderStatus === 'paid') {
                $counts['pending']++;
            } elseif (isset($counts[$orderStatus])) {
                $counts[$orderStatus]++;
            }

            // Filter logic: "pending" tab hiển thị cả pending và paid
            if ($status === 'all') {
                $orders[] = $order;
            } elseif ($status === 'pending' && ($orderStatus === 'pending' || $orderStatus === 'paid')) {
                $orders[] = $order;
            } elseif ($orderStatus === $status) {
                $orders[] = $order;
            }
        }

        // Enrich with items
        $orderItemModel = new OrderItem();
        foreach ($orders as &$order) {
            $order['items'] = $orderItemModel->getByOrderId((int) $order['id']);
        }

        // Lấy thống kê cho profile card
        $reviewModel = new Review();
        $profileStats = [
            'orderCount' => $orderModel->countByBuyerId($userId),
            'reviewCount' => $reviewModel->countByUserId($userId),
        ];

        $this->view('shop/orders', array_merge([
            'pageTitle' => 'Đơn bán hàng',
            'orders' => $orders,
            'currentStatus' => $status,
            'counts' => $counts,
        ], $profileStats));
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * 
     * Khi chuyển sang "shipping", sẽ tự động tạo đơn trên GHN
     */
    public function updateOrderStatus(): void
    {
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        $orderId = (int) $this->input('order_id', 0);
        $status = $this->input('status', '');

        if ($orderId > 0 && !empty($status)) {
            $orderModel = new Order();

            // Security check: ensure order belongs to seller
            $order = $orderModel->findWithDetails($orderId);
            if ($order !== null && (int) $order['seller_id'] === $userId) {

                // Nếu chuyển sang shipping, tạo đơn GHN
                if ($status === 'shipping') {
                    if (GHNService::isEnabled()) {
                        $this->createGHNOrder($order, $orderModel);
                    } else {
                        $_SESSION['warning'] = 'GHN đang tạm tắt, không tạo vận đơn.';
                    }
                }

                $orderModel->updateStatus($orderId, $status);
            }
        }

        $this->redirect('/shop/orders');
    }

    /**
     * Tạo đơn vận chuyển trên GHN
     * 
     * @param array $order Thông tin đơn hàng
     * @param Order $orderModel
     */
    private function createGHNOrder(array $order, Order $orderModel): void
    {
        try {
            if (!GHNService::isEnabled()) {
                return;
            }

            $ghnService = new GHNService();
            $addressModel = new UserAddress();

            // Lấy địa chỉ mặc định của SELLER (địa chỉ lấy hàng)
            $sellerId = (int) $order['seller_id'];
            $sellerAddress = $addressModel->getDefaultAddress($sellerId);

            if (!$sellerAddress || empty($sellerAddress['ghn_district_id']) || empty($sellerAddress['ghn_ward_code'])) {
                throw new \Exception("Seller chưa cập nhật địa chỉ GHN. Vui lòng cập nhật địa chỉ với thông tin Tỉnh/Quận/Phường.");
            }

            // Lấy địa chỉ shipping của BUYER (địa chỉ giao hàng)
            // Nếu có shipping_address_id trong order thì lấy theo id đó
            // Nếu không thì lấy default address của buyer
            $buyerId = (int) $order['buyer_id'];
            $buyerAddress = null;

            if (!empty($order['shipping_address_id'])) {
                $buyerAddress = $addressModel->findById((int) $order['shipping_address_id'], $buyerId);
            }

            if (!$buyerAddress) {
                $buyerAddress = $addressModel->getDefaultAddress($buyerId);
            }

            // Nếu buyer chưa có địa chỉ GHN, dùng thông tin từ order với fallback values
            $toDistrictId = (int) ($buyerAddress['ghn_district_id'] ?? 0);
            $toWardCode = $buyerAddress['ghn_ward_code'] ?? '';

            // Fallback nếu buyer chưa có GHN codes
            if (!$toDistrictId || !$toWardCode) {
                error_log("Buyer chưa có địa chỉ GHN, dùng sandbox defaults");
                $toDistrictId = 1444;  // Quận 10 - Sandbox
                $toWardCode = '20308'; // Phường 1 - Sandbox
            }

            // Lấy items để tính tổng weight
            $orderItemModel = new OrderItem();
            $items = $orderItemModel->getByOrderId((int) $order['id']);

            // Tính tổng weight (500g mỗi item nếu không có thông tin)
            $totalWeight = 0;
            $ghnItems = [];
            foreach ($items as $item) {
                $weight = (int) ($item['weight'] ?? 500);
                $totalWeight += $weight * (int) $item['quantity'];

                $ghnItems[] = [
                    'name' => $item['product_name'] ?? 'Sản phẩm',
                    'quantity' => (int) $item['quantity'],
                    'price' => (int) $item['price'],
                ];
            }

            // Đảm bảo weight tối thiểu 200g
            $totalWeight = max($totalWeight, 200);

            // Xác định COD amount
            $codAmount = 0;
            if (($order['payment_status'] ?? 'pending') !== 'paid') {
                $codAmount = (int) $order['total_amount'];
            }

            // Tạo đơn GHN với địa chỉ seller (from) và buyer (to)
            $ghnData = [
                // Địa chỉ lấy hàng (Seller)
                'from_name' => $sellerAddress['recipient_name'] ?? 'Shop',
                'from_phone' => $sellerAddress['phone_number'] ?? '',
                'from_address' => $sellerAddress['street_address'] ?? '',
                'from_district_id' => (int) $sellerAddress['ghn_district_id'],
                'from_ward_code' => $sellerAddress['ghn_ward_code'],
                // Địa chỉ giao hàng (Buyer)
                'to_name' => $order['shipping_name'] ?? $buyerAddress['recipient_name'] ?? 'Khách hàng',
                'to_phone' => $order['shipping_phone'] ?? $buyerAddress['phone_number'] ?? '',
                'to_address' => $order['shipping_address'] ?? $buyerAddress['street_address'] ?? '',
                'to_district_id' => $toDistrictId,
                'to_ward_code' => $toWardCode,
                // Thông tin hàng hóa
                'weight' => $totalWeight,
                'cod_amount' => $codAmount,
                'content' => 'Đơn hàng #' . $order['id'],
                'client_order_code' => 'ZOLD-' . $order['id'],
                'note' => $order['note'] ?? '',
                'items' => $ghnItems,
            ];

            $result = $ghnService->createOrder($ghnData);

            // Lưu thông tin GHN vào database
            if (!empty($result['order_code'])) {
                $orderModel->updateGHNInfo((int) $order['id'], [
                    'ghn_order_code' => $result['order_code'],
                    'ghn_sort_code' => $result['sort_code'] ?? null,
                    'ghn_expected_delivery' => $result['expected_delivery_time'] ?? null,
                    'ghn_shipping_fee' => $result['total_fee'] ?? 0,
                    'ghn_status' => 'ready_to_pick',
                ]);

                // Thông báo cho buyer
                $notifModel = new Notification();
                $notifModel->create(
                    (int) $order['buyer_id'],
                    "Đơn hàng #{$order['id']} đã được gửi đi. Mã vận đơn: {$result['order_code']}"
                );
            }

        } catch (\Exception $e) {
            // Log lỗi nhưng không block việc update status
            error_log("GHN Create Order Error: " . $e->getMessage());

            // Set session flash message để báo lỗi
            $_SESSION['warning'] = "Không thể tạo đơn GHN: " . $e->getMessage();
        }
    }
    /**
     * Chi tiết đơn hàng (Dành cho shop)
     */
    public function orderDetail(): void
    {
        $user = $this->requireAuth();
        $userId = (int) $user['id'];
        $orderId = (int) $this->query('id', 0);

        if ($orderId <= 0) {
            $this->redirect('/shop/orders');
        }

        $orderModel = new Order();
        $order = $orderModel->find($orderId);

        // Security check: ensure order belongs to seller
        if ($order === null || (int) $order['seller_id'] !== $userId) {
            $this->redirect('/shop/orders'); // Or show error
        }

        // Get Details
        $orderItemModel = new OrderItem();
        $order['items'] = $orderItemModel->getByOrderId($orderId);

        // Get Buyer info
        $userModel = new User();
        // Buyer ID might be in 'buyer_id'
        $buyerId = (int) $order['buyer_id'];
        $buyer = $userModel->find($buyerId);

        // If buyer has shipping address in order, use that
        // But for now we just use buyer profile + order specific info if available
        
        $this->view('shop/order_detail', [
            'pageTitle' => 'Chi tiết đơn hàng #' . $orderId,
            'order' => $order,
            'buyer' => $buyer
        ]);
    }
}

