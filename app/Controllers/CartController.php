<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\Cart;
use App\Middleware\VerificationMiddleware;
use App\Helpers\SlugHelper;

/**
 * Cart Controller
 * 
 * Quản lý giỏ hàng của users.
 * 
 * @package App\Controllers
 */
class CartController extends BaseController
{
    private Cart $cartModel;

    public function __construct()
    {
        parent::__construct();
        $this->cartModel = new Cart();
    }

    /**
     * Thêm sản phẩm vào giỏ hàng hoặc Mua ngay
     */
    public function add(): void
    {
        $userId = $this->getUserId();

        if ($userId === null) {
            $_SESSION['error'] = 'Vui lòng đăng nhập để mua hàng.';
            $_SESSION['redirect_after_login'] = $_SERVER['HTTP_REFERER'] ?? '/products';
            $this->redirect('/login');
        }

        VerificationMiddleware::requireVerified();

        $action = $this->input('action', 'add');
        $productId = (int) $this->input('product_id', 0);
        $quantity = max(1, (int) $this->input('quantity', 1));

        if ($productId === 0) {
            $this->redirect('/products');
        }

        // Không cho phép mua sản phẩm của chính mình
        $productModel = new Product();
        $product = $productModel->find($productId);

        if ($product !== null && (int) $product['user_id'] === $userId) {
            $_SESSION['error'] = 'Bạn không thể mua sản phẩm của chính mình!';
            $this->redirect($_SERVER['HTTP_REFERER'] ?? '/products');
        }

        // "Buy Now" flow - redirect thẳng tới checkout
        if ($action === 'buy') {
            $this->redirectToBuyNow($productId, $quantity);
        }

        // "Add to Cart" flow
        $this->cartModel->addItem($userId, $productId, $quantity);

        // Redirect về trang product với thông báo đã thêm vào giỏ
        $productUrl = SlugHelper::productUrl($product['name'] ?? '', $productId);
        $this->redirect($productUrl . '?added=1');
    }

    /**
     * Hiển thị giỏ hàng
     */
    public function index(): void
    {
        $userId = $this->getUserId();

        if ($userId === null) {
            $_SESSION['error'] = 'Vui lòng đăng nhập để xem giỏ hàng.';
            $this->redirect('/login');
        }

        VerificationMiddleware::requireVerified();

        $cartItems = $this->cartModel->getByUserId($userId);
        $total = 0;

        $products = [];
        foreach ($cartItems as $item) {
            $item['cart_quantity'] = $item['quantity'];
            $products[] = $item;
            $total += (float) $item['price'] * (int) $item['quantity'];
        }

        $this->view('cart/index', [
            'products' => $products,
            'total' => $total,
        ]);
    }

    /**
     * Cập nhật số lượng sản phẩm (AJAX)
     */
    public function update(): never
    {
        $userId = $this->getUserId();

        // Support both JSON and form POST
        $input = $this->getJsonInput();
        $productId = (int) ($input['product_id'] ?? $this->input('product_id', 0));
        $quantity = (int) ($input['quantity'] ?? $this->input('quantity', 0));

        if ($productId === 0) {
            $this->jsonError('Invalid data');
        }

        if ($userId !== null) {
            $this->cartModel->updateQuantity($userId, $productId, $quantity);
        } else {
            // Fallback: session cart cho guest (legacy)
            if ($quantity <= 0) {
                unset($_SESSION['cart'][$productId]);
            } else {
                $_SESSION['cart'][$productId] = ['quantity' => $quantity];
            }
        }

        $this->jsonSuccess('Updated');
    }

    /**
     * Xóa sản phẩm khỏi giỏ
     */
    public function remove(): void
    {
        $userId = $this->getUserId();
        $productId = (int) ($this->input('product_id') ?? $this->query('product_id', 0));

        if ($productId > 0 && $userId !== null) {
            $this->cartModel->removeItem($userId, $productId);
        }

        $this->redirect('/cart');
    }

    /**
     * Xóa toàn bộ giỏ hàng
     */
    public function clear(): void
    {
        $userId = $this->getUserId();

        if ($userId !== null) {
            $this->cartModel->clearCart($userId);
        }

        $this->redirect('/cart');
    }

    /**
     * API: Đếm số lượng trong giỏ (cho header badge)
     */
    public function count(): never
    {
        $count = $this->getCartCount();
        $this->json(['count' => $count]);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Redirect tới checkout với "Buy Now" flow
     */
    private function redirectToBuyNow(int $productId, int $quantity): never
    {
        echo '<form id="buy_now_form" action="/checkout" method="POST">';
        echo '<input type="hidden" name="selected_products[]" value="' . $productId . '">';
        echo '<input type="hidden" name="quantities[' . $productId . ']" value="' . $quantity . '">';
        echo '</form>';
        echo '<script>document.getElementById("buy_now_form").submit();</script>';
        exit;
    }
}
