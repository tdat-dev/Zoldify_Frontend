<?php

namespace App\Controllers;

use App\Models\Product;
use App\Models\Cart;
use App\Middleware\VerificationMiddleware;

class CartController extends BaseController
{
    private $cartModel;

    public function __construct()
    {
        $this->cartModel = new Cart();
    }

    /**
     * Kiểm tra user đã đăng nhập chưa
     */
    private function getUserId()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        return $_SESSION['user']['id'] ?? null;
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    public function add()
    {
        VerificationMiddleware::requireVerified();
        $userId = $this->getUserId();
        $productId = $_POST['product_id'] ?? null;
        $quantity = (int) ($_POST['quantity'] ?? 1);
        $action = $_POST['action'] ?? 'add';

        if (!$productId) {
            header('Location: /products');
            exit;
        }

        if ($userId) {
            // Đã đăng nhập -> Lưu vào Database
            $this->cartModel->addItem($userId, $productId, $quantity);
        } else {
            // Chưa đăng nhập -> Lưu vào Session (tạm thời)
            if (!isset($_SESSION['cart'])) {
                $_SESSION['cart'] = [];
            }
            if (isset($_SESSION['cart'][$productId])) {
                $_SESSION['cart'][$productId]['quantity'] += $quantity;
            } else {
                $_SESSION['cart'][$productId] = ['quantity' => $quantity];
            }
        }

        // Redirect based on action
        if ($action === 'buy') {
            header('Location: /cart');
        } else {
            header("Location: /product-detail?id=$productId");
        }
        exit;
    }

    /**
     * Hiển thị giỏ hàng
     */
    public function index()
    {
        VerificationMiddleware::requireVerified();
        $userId = $this->getUserId();
        $products = [];
        $total = 0;

        if ($userId) {
            // Đã đăng nhập -> Lấy từ Database
            $cartItems = $this->cartModel->getByUserId($userId);
            foreach ($cartItems as $item) {
                $item['cart_quantity'] = $item['quantity'];
                $products[] = $item;
                $total += $item['price'] * $item['quantity'];
            }
        } else {
            // Chưa đăng nhập -> Lấy từ Session
            $cart = $_SESSION['cart'] ?? [];
            if (!empty($cart)) {
                $productModel = new Product();
                foreach ($cart as $id => $item) {
                    $p = $productModel->find($id);
                    if ($p) {
                        $qty = is_array($item) ? ($item['quantity'] ?? 1) : $item;
                        $p['cart_quantity'] = $qty;
                        $products[] = $p;
                        $total += $p['price'] * $qty;
                    }
                }
            }
        }

        $this->view('cart/index', [
            'products' => $products,
            'total' => $total
        ]);
    }

    /**
     * Cập nhật số lượng sản phẩm
     */
    public function update()
    {
        $userId = $this->getUserId();

        // Get raw POST data for JSON
        $input = json_decode(file_get_contents('php://input'), true);

        $productId = $input['product_id'] ?? $_POST['product_id'] ?? null;
        $quantity = isset($input['quantity']) ? (int) $input['quantity'] : (isset($_POST['quantity']) ? (int) $_POST['quantity'] : null);

        if (!$productId || $quantity === null) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            exit;
        }

        if ($userId) {
            // Đã đăng nhập -> Cập nhật Database
            $this->cartModel->updateQuantity($userId, $productId, $quantity);
        } else {
            // Chưa đăng nhập -> Cập nhật Session
            if (!isset($_SESSION['cart'])) {
                $_SESSION['cart'] = [];
            }

            if ($quantity <= 0) {
                unset($_SESSION['cart'][$productId]);
            } else {
                $_SESSION['cart'][$productId] = ['quantity' => $quantity];
            }
        }

        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    /**
     * Xóa sản phẩm khỏi giỏ
     */
    public function remove()
    {
        $userId = $this->getUserId();
        $productId = $_POST['product_id'] ?? $_GET['product_id'] ?? null;

        if ($productId) {
            if ($userId) {
                $this->cartModel->removeItem($userId, $productId);
            } else {
                unset($_SESSION['cart'][$productId]);
            }
        }

        header('Location: /cart');
        exit;
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    public function clear()
    {
        $userId = $this->getUserId();

        if ($userId) {
            $this->cartModel->clearCart($userId);
        } else {
            $_SESSION['cart'] = [];
        }

        header('Location: /cart');
        exit;
    }

    /**
     * Đếm số lượng sản phẩm trong giỏ (cho header badge)
     */
    public function count()
    {
        $userId = $this->getUserId();
        $count = 0;

        if ($userId) {
            $count = $this->cartModel->countItems($userId);
        } else {
            $cart = $_SESSION['cart'] ?? [];
            foreach ($cart as $item) {
                $count += is_array($item) ? ($item['quantity'] ?? 1) : $item;
            }
        }

        header('Content-Type: application/json');
        echo json_encode(['count' => $count]);
        exit;
    }
}
