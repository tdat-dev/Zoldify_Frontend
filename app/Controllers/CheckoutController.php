<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\VerificationMiddleware;
use App\Middleware\PhoneVerificationMiddleware;
use App\Models\Product;
use App\Models\Cart;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserAddress;
use App\Services\EscrowService;
use App\Services\GHNService;

/**
 * Checkout Controller
 * 
 * Xử lý quy trình checkout và tạo đơn hàng.
 * 
 * @package App\Controllers
 */
class CheckoutController extends BaseController
{
    /**
     * Hiển thị trang checkout
     */
    public function process(): void
    {
        VerificationMiddleware::requireVerified();
        PhoneVerificationMiddleware::requireVerified();
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        $allCart = $this->getCartItems($userId);

        // PRG Pattern: Handle POST -> Session -> GET
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $selectedIds = $_POST['selected_products'] ?? [];
            $postQuantities = $_POST['quantities'] ?? [];

            if (!empty($selectedIds)) {
                $_SESSION['checkout_data'] = [
                    'selected_products' => $selectedIds,
                    'quantities' => $postQuantities
                ];
                header('Location: /checkout');
                exit;
            }
        }

        // Handle GET: Retrieve from session
        $checkoutData = $_SESSION['checkout_data'] ?? [];
        $selectedIds = $checkoutData['selected_products'] ?? [];
        $postQuantities = $checkoutData['quantities'] ?? [];

        // If no products selected (neither in POST nor Session), redirect back to cart
        if (empty($selectedIds)) {
            $this->redirect('/cart');
        }

        $productModel = new Product();
        $products = [];

        foreach ($selectedIds as $id) {
            $qty = 0;

            // 1. Check in Database/Session Cart
            if (isset($allCart[$id])) {
                $cartItem = $allCart[$id];
                $qty = is_array($cartItem) ? ($cartItem['quantity'] ?? $cartItem['cart_quantity'] ?? 1) : $cartItem;
            }
            // 2. Check in POST/Session data (Buy Now flow)
            elseif (isset($postQuantities[$id])) {
                $qty = (int) $postQuantities[$id];
            }

            // If we have a valid quantity, fetch product details
            if ($qty > 0) {
                $product = $productModel->find((int) $id);

                if ($product !== null) {
                    // Không cho phép mua sản phẩm của chính mình
                    if ((int) $product['user_id'] === $userId) {
                        $_SESSION['error'] = 'Bạn không thể mua sản phẩm "' . $product['name'] . '" của chính mình!';
                        $this->redirect('/cart');
                    }

                    $product['cart_quantity'] = $qty;
                    $products[] = $product;
                }
            }
        }

        $addressModel = new UserAddress();

        $errors = [];
        if (!empty($_SESSION['error'])) {
            $errors[] = (string) $_SESSION['error'];
            unset($_SESSION['error']);
        }

        $this->view('cart/checkout', [
            'products' => $products,
            'selected_ids' => $selectedIds,
            'user' => (new User())->find($userId),
            'addresses' => $addressModel->getByUserId($userId),
            'defaultAddress' => $addressModel->getDefaultAddress($userId),
            'errors' => $errors,
        ]);
    }

    /**
     * Xác nhận đặt hàng
     */
    public function confirm(): void
    {
        VerificationMiddleware::requireVerified();
        PhoneVerificationMiddleware::requireVerified();
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        $allCart = $this->getCartItems($userId);
        $selectedIds = $_POST['selected_products'] ?? [];
        $paymentMethod = $this->input('payment_method', 'cod');

        // Build cart items to process
        $cartToProcess = $this->buildCartToProcess($selectedIds, $allCart);

        if (empty($cartToProcess)) {
            $this->redirect('/cart');
        }

        // Validate products
        $productModel = new Product();
        $result = $this->validateAndPrepareProducts($cartToProcess, $productModel, $userId);

        if (!empty($result['errors'])) {
            $_SESSION['error'] = implode('<br>', $result['errors']);
            $this->redirect('/cart');
        }

        // Validate shipping address
        $shippingAddress = $this->getShippingAddress($userId);
        if ($shippingAddress === null) {
            $_SESSION['error'] = 'Vui lòng chọn địa chỉ nhận hàng trước khi đặt hàng.';
            $this->redirect('/addresses/create?redirect_to=' . urlencode('/checkout'));
        }

        // Group by seller and create orders
        $ordersBySeller = $this->groupBySeller($result['products']);
        try {
            $createdOrderIds = $this->createOrders($ordersBySeller, $userId, $paymentMethod, $productModel, $shippingAddress);
        } catch (\Exception $e) {
            $_SESSION['error'] = $e->getMessage();
            $this->redirect('/checkout');
        }

        // Handle PayOS payment
        if ($paymentMethod === 'payos' && !empty($createdOrderIds)) {
            $_POST['order_id'] = $createdOrderIds[0];
            $paymentController = new PaymentController();
            $paymentController->create();
            exit;
        }

        // COD: Show success page
        $this->view('cart/success', [
            'order_ids' => $createdOrderIds,
            'payment_method' => $paymentMethod,
        ]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Lấy cart items từ DB hoặc session
     * 
     * @return array<int|string, array<string, mixed>|int>
     */
    private function getCartItems(int $userId): array
    {
        $cartModel = new Cart();
        $dbItems = $cartModel->getByUserId($userId);

        $cart = [];
        foreach ($dbItems as $item) {
            $item['cart_quantity'] = $item['quantity'];
            $cart[$item['product_id']] = $item;
        }

        return $cart;
    }

    /**
     * Lấy quantity cho product từ cart hoặc POST
     */
    private function getQuantityForProduct(int $productId, array $cart): int
    {
        // Check in cart
        if (isset($cart[$productId])) {
            $item = $cart[$productId];
            return is_array($item)
                ? (int) ($item['quantity'] ?? $item['cart_quantity'] ?? 1)
                : (int) $item;
        }

        // Check in POST (Buy Now flow)
        if (isset($_POST['quantities'][$productId])) {
            return (int) $_POST['quantities'][$productId];
        }

        return 0;
    }

    /**
     * Build cart items to process
     * 
     * @return array<int, int> [product_id => quantity]
     */
    private function buildCartToProcess(array $selectedIds, array $cart): array
    {
        $result = [];
        $postQuantities = $_POST['quantities'] ?? [];

        foreach ($selectedIds as $id) {
            $id = (int) $id;

            if (isset($postQuantities[$id])) {
                $qty = (int) $postQuantities[$id];
                if ($qty > 0) {
                    $result[$id] = $qty;
                }
            } elseif (isset($cart[$id])) {
                $result[$id] = $this->getQuantityForProduct($id, $cart);
            }
        }

        return $result;
    }

    /**
     * Validate products and prepare for order
     * 
     * @return array{errors: array<string>, products: array<array{product: array, quantity: int}>}
     */
    private function validateAndPrepareProducts(array $cartToProcess, Product $productModel, int $userId): array
    {
        $errors = [];
        $products = [];

        foreach ($cartToProcess as $id => $qty) {
            $product = $productModel->find($id);

            if ($product === null || (int) $product['quantity'] < $qty) {
                $errors[] = "Sản phẩm " . ($product['name'] ?? 'Unknown') . " không đủ hàng.";
                continue;
            }

            if ((int) $product['user_id'] === $userId) {
                $errors[] = "Bạn không thể mua sản phẩm '" . $product['name'] . "' của chính mình.";
                continue;
            }

            $products[] = [
                'product' => $product,
                'quantity' => $qty,
            ];
        }

        return ['errors' => $errors, 'products' => $products];
    }

    /**
     * Get shipping address
     */
    private function getShippingAddress(int $userId): ?array
    {
        $addressModel = new UserAddress();
        $addressId = $this->input('shipping_address_id');

        if ($addressId !== null) {
            return $addressModel->findById((int) $addressId, $userId);
        }

        return $addressModel->getDefaultAddress($userId);
    }

    /**
     * Group products by seller
     * 
     * @return array<int, array{seller_id: int, total: float, items: array}>
     */
    private function groupBySeller(array $products): array
    {
        $ordersBySeller = [];

        foreach ($products as $item) {
            $sellerId = (int) $item['product']['user_id'];

            if (!isset($ordersBySeller[$sellerId])) {
                $ordersBySeller[$sellerId] = [
                    'seller_id' => $sellerId,
                    'total' => 0.0,
                    'items' => [],
                ];
            }

            $itemTotal = (float) $item['product']['price'] * (int) $item['quantity'];
            $ordersBySeller[$sellerId]['total'] += $itemTotal;
            $ordersBySeller[$sellerId]['items'][] = $item;
        }

        return $ordersBySeller;
    }

    /**
     * Create orders grouped by seller
     * 
     * @return array<int> Order IDs
     */
    private function createOrders(
        array $ordersBySeller,
        int $buyerId,
        string $paymentMethod,
        Product $productModel,
        array $shippingAddress
    ): array
    {
        $orderModel = new Order();
        $orderItemModel = new OrderItem();
        $cartModel = new Cart();
        $escrowService = new EscrowService();
        $addressModel = new UserAddress();
        $ghnService = null;

        $createdOrderIds = [];

        foreach ($ordersBySeller as $orderData) {
            // COD: Chờ seller xác nhận | PayOS: Chờ thanh toán online
            $orderStatus = ($paymentMethod === 'cod') ? Order::STATUS_PENDING : 'pending_payment';

            // Tính phí sàn và số tiền seller nhận
            $fees = $escrowService->calculateFees($orderData['total']);

            // Tính phí vận chuyển (freeship nếu tất cả sản phẩm có badge)
            $allFreeShip = true;
            $totalWeight = 0;
            foreach ($orderData['items'] as $item) {
                $product = $item['product'];
                $qty = (int) $item['quantity'];
                $totalWeight += 500 * max(1, $qty);

                if ((int) ($product['is_freeship'] ?? Product::SHIP_PAYER_BUYER) !== Product::SHIP_PAYER_SELLER) {
                    $allFreeShip = false;
                }
            }

            $shippingFee = 0;
            if (!$allFreeShip) {
                if (!GHNService::isEnabled()) {
                    $shippingFee = 0;
                } else {
                    if ($ghnService === null) {
                        $ghnService = new GHNService();
                    }

                    $sellerAddress = $addressModel->getDefaultAddress((int) $orderData['seller_id']);
                    if (!$sellerAddress || empty($sellerAddress['ghn_district_id']) || empty($sellerAddress['ghn_ward_code'])) {
                        throw new \Exception('Shop chưa cập nhật địa chỉ GHN. Vui lòng chọn sản phẩm khác hoặc báo shop cập nhật.');
                    }

                    if (empty($shippingAddress['ghn_district_id']) || empty($shippingAddress['ghn_ward_code'])) {
                        throw new \Exception('Địa chỉ nhận hàng chưa có mã GHN. Vui lòng cập nhật địa chỉ nhận hàng.');
                    }

                    $feeData = $ghnService->calculateFee([
                        'from_district_id' => (int) $sellerAddress['ghn_district_id'],
                        'from_ward_code' => $sellerAddress['ghn_ward_code'],
                        'to_district_id' => (int) $shippingAddress['ghn_district_id'],
                        'to_ward_code' => (string) $shippingAddress['ghn_ward_code'],
                        'weight' => max(200, $totalWeight),
                        'insurance_value' => (int) $orderData['total'],
                    ]);

                    $shippingFee = (int) ($feeData['total'] ?? $feeData['total_fee'] ?? $feeData['service_fee'] ?? 0);
                }
            }

            $totalAmount = (float) $orderData['total'] + (float) $shippingFee;

            // Create order với platform_fee và seller_amount
            $orderId = $orderModel->createOrder([
                'buyer_id' => $buyerId,
                'seller_id' => $orderData['seller_id'],
                'total_amount' => $totalAmount,
                'platform_fee' => $fees['platform_fee'],
                'seller_amount' => $fees['seller_amount'],
                'status' => $orderStatus,
                'payment_method' => $paymentMethod,
                'payment_status' => Order::PAYMENT_PENDING,
                'shipping_fee' => $shippingFee,
                'shipping_address_id' => $shippingAddress['id'] ?? null,
            ]);

            $createdOrderIds[] = $orderId;

            // Set trial days based on product condition
            $firstProduct = $orderData['items'][0]['product'] ?? null;
            $condition = $firstProduct['product_condition'] ?? 'new';
            $trialDays = $escrowService->getTrialDays($condition);
            $orderModel->update($orderId, ['trial_days' => $trialDays]);

            // Create order items and update stock
            foreach ($orderData['items'] as $item) {
                $product = $item['product'];
                $qty = (int) $item['quantity'];

                $orderItemModel->addItem(
                    $orderId,
                    (int) $product['id'],
                    $qty,
                    (float) $product['price']
                );

                // Decrease stock
                $productModel->decreaseQuantity((int) $product['id'], $qty);

                // Remove from cart
                $cartModel->removeItem($buyerId, (int) $product['id']);
            }
        }

        return $createdOrderIds;
    }
}
