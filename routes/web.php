<?php

use App\Controllers\AuthController;
use App\Controllers\HomeController;
use App\Controllers\ProductController;
use App\Controllers\SearchController;
use App\Controllers\CategoryController;
use App\Controllers\FirebaseAuthController;
use App\Controllers\VerificationController;
use App\Controllers\PaymentController;
use App\Controllers\PasswordResetController;
use App\Controllers\CartController;
use App\Controllers\CheckoutController;
use App\Controllers\ProfileController;
use App\Controllers\ShopController;
use App\Controllers\ChatController;
use App\Controllers\AddressController;
use App\Controllers\PhoneVerificationController;
use App\Controllers\SitemapController;

/** @var \App\Core\Router $router */

// ======================= SEO =======================
$router->get('sitemap.xml', [SitemapController::class, 'index']);

// ======================= HOME & SUPPORT =======================
$router->get('/', [HomeController::class, 'index']);
$router->get('support', [HomeController::class, 'support']);
$router->get('privacy', [HomeController::class, 'privacy']);
$router->get('terms', [HomeController::class, 'terms']);

// ======================= AUTHENTICATION =======================
$router->get('login', [AuthController::class, 'login']);
$router->post('login', [AuthController::class, 'processLogin']);
$router->get('register', [AuthController::class, 'register']);
$router->post('register', [AuthController::class, 'processRegister']);
$router->post('logout', [AuthController::class, 'logout']);

// Firebase Auth (Google Sign-In)
$router->post('auth/firebase', [FirebaseAuthController::class, 'handleFirebaseLogin']);
$router->get('api/firebase/config', [FirebaseAuthController::class, 'getConfig']);

// Password & Email Verification
$router->get('forgot-password', [PasswordResetController::class, 'showForgotForm']);
$router->post('forgot-password', [PasswordResetController::class, 'sendResetOtp']);
$router->post('verify-otp', [PasswordResetController::class, 'verifyOtp']);
$router->get('reset-password', [PasswordResetController::class, 'showResetForm']);
$router->post('reset-password', [PasswordResetController::class, 'resetPassword']);

$router->get('verify-email', [VerificationController::class, 'showVerifyForm']);
$router->post('verify-email', [VerificationController::class, 'verifyByOtp']);
$router->get('verify-email/token', [VerificationController::class, 'verifyByToken']);
$router->post('verify-email/resend', [VerificationController::class, 'resendVerification']);

// Phone Verification (Firebase Phone Auth)
$router->get('verify-phone', [PhoneVerificationController::class, 'show']);
$router->post('verify-phone/confirm', [PhoneVerificationController::class, 'confirm']);

// ======================= CATEGORIES (Zoldify SEO URLs) =======================
// Format: /dm/ten-danh-muc.c123
$router->get('category/{id}', [CategoryController::class, 'show']);           // Fallback
$router->get('dm/{slug}.c{id}', [CategoryController::class, 'showBySlug']);   // SEO: /dm/dien-thoai.c123
$router->get('api/category/products', [CategoryController::class, 'getProducts']);

// ======================= PRODUCTS & SEARCH =======================
// Product SEO URLs: /z/ten-san-pham.p123
$router->get('products', [ProductController::class, 'index']);
$router->get('products/create', [ProductController::class, 'create']);
$router->get('products/{id}', [ProductController::class, 'show']);            // Fallback
$router->get('z/{slug}.p{productId}', [ProductController::class, 'showBySlug']); // SEO: /z/iphone-14.p123

// Product Management (User đăng sản phẩm)
$router->post('products', [ProductController::class, 'store']);
$router->post('products/store', [ProductController::class, 'store']);  // Alias for form action
$router->post('products/{id}/cancel-sale', [ProductController::class, 'cancelSale']);
$router->post('report/product', [ProductController::class, 'report']);

// Search (Public)
$router->get('search', [SearchController::class, 'index']);
$router->get('api/search-suggest', [SearchController::class, 'suggest']);

// ======================= CART & CHECKOUT =======================
$router->get('cart', [CartController::class, 'index']);
$router->post('cart/add', [CartController::class, 'add']);
$router->post('cart/update', [CartController::class, 'update']);

$router->get('checkout', [CheckoutController::class, 'process']);  // GET: Hiển thị trang checkout (sau redirect)
$router->post('checkout', [CheckoutController::class, 'process']); // POST: Nhận data từ cart/buy-now
$router->post('checkout/confirm', [CheckoutController::class, 'confirm']); // Xử lý đặt hàng thực sự

// ======================= PAYMENT =======================
$router->post('payment/create', [PaymentController::class, 'create']);
$router->post('payment/webhook', [PaymentController::class, 'webhook']);
$router->get('payment/return', [PaymentController::class, 'returnUrl']);
$router->get('payment/cancel', [PaymentController::class, 'cancelUrl']);
$router->get('payment/qr', [PaymentController::class, 'showQR']);
$router->get('payment/check-status', [PaymentController::class, 'checkStatus']);

// ======================= SHOP & CHAT =======================
$router->get('shop', [ShopController::class, 'index']);
$router->post('shop/follow', [ShopController::class, 'toggleFollow']);

// Shop management (Đơn hàng người khác mua của shop mình)
$router->get('shop/orders', [ShopController::class, 'orders']);
$router->post('shop/orders/update', [ShopController::class, 'updateOrderStatus']);
$router->get('shop/orders/detail', [ShopController::class, 'orderDetail']);

$router->get('chat', [ChatController::class, 'index']);
$router->post('chat/send', [ChatController::class, 'send']);

// ======================= USER PROFILE =======================
$router->get('profile', [ProfileController::class, 'index']);
$router->post('profile/update', [ProfileController::class, 'update']);
$router->post('profile/avatar', [ProfileController::class, 'updateAvatar']);
$router->get('profile/change-password', [ProfileController::class, 'changePassword']);
$router->post('profile/change-password', [ProfileController::class, 'updatePassword']);

// Wallet
$router->get('wallet', [ProfileController::class, 'wallet']);
$router->post('wallet/process', [ProfileController::class, 'processWallet']);

// Reviews
$router->get('reviews', [ProfileController::class, 'reviews']);
$router->post('reviews/store', [ProfileController::class, 'storeReview']);

// My Orders (Đơn hàng mình mua)
$router->get('profile/orders', [ProfileController::class, 'orders']);
$router->get('profile/orders/detail', [ProfileController::class, 'orderDetail']);
$router->post('profile/orders/cancel', [ProfileController::class, 'cancelOrder']);
$router->post('profile/orders/rebuy', [ProfileController::class, 'rebuyOrder']);
$router->post('profile/orders/confirm-received', [ProfileController::class, 'confirmReceived']);

// ======================= ADDRESSES =======================
$router->get('addresses', [AddressController::class, 'index']);
$router->get('addresses/create', [AddressController::class, 'create']);
$router->post('addresses/store', [AddressController::class, 'store']);
$router->get('addresses/edit', [AddressController::class, 'edit']);
$router->post('addresses/update', [AddressController::class, 'update']);
$router->post('addresses/delete', [AddressController::class, 'delete']);
$router->post('addresses/set-default', [AddressController::class, 'setDefault']);

// GHN Address Lookup API
$router->get('api/ghn/provinces', [AddressController::class, 'getProvinces']);
$router->get('api/ghn/districts', [AddressController::class, 'getDistricts']);
$router->get('api/ghn/wards', [AddressController::class, 'getWards']);

