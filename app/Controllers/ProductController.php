<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Models\Category;
use App\Models\Follow;
use App\Models\Notification;
use App\Models\Report;
use App\Models\UserAddress;
use App\Middleware\PhoneVerificationMiddleware;
use App\Helpers\SeoHelper;
use App\Helpers\ImageHelper;


/**
 * Product Controller
 * Handles product listing, viewing, creation and deletion
 * 
 * @package App\Controllers
 */
class ProductController extends BaseController
{
    private const ITEMS_PER_PAGE = 20;

    /**
     * Debug log to file (for staging debugging)
     */
    private function debugLog(string $message): void
    {
        $logDir = __DIR__ . '/../../storage/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logFile = $logDir . '/upload.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($logFile, "[{$timestamp}] {$message}\n", FILE_APPEND);
    }

    /**
     * List all products with filtering and pagination
     * 
     * Nếu có category_id, redirect sang SEO URL /dm/slug.cX
     */
    public function index(): void
    {
        // Redirect sang Category SEO URL nếu có category_id
        $categoryId = (int) $this->query('category_id', 0);
        if ($categoryId > 0) {
            $categoryModel = new Category();
            $category = $categoryModel->find($categoryId);

            if ($category) {
                $seoUrl = \App\Helpers\SlugHelper::categoryUrl($category['name'], $categoryId);
                // Preserve other query params (except category_id and page)
                $preserveParams = $_GET;
                unset($preserveParams['category_id']);
                unset($preserveParams['page']);

                if (!empty($preserveParams)) {
                    $seoUrl .= '?' . http_build_query($preserveParams);
                }

                header("Location: {$seoUrl}", true, 301);
                exit;
            }
        }

        $page = max(1, (int) $this->query('page', 1));
        $offset = ($page - 1) * self::ITEMS_PER_PAGE;

        $filters = [
            'category_id' => 0, // No category filter on /products
            'keyword' => $this->query('keyword', ''),
            'price_min' => $this->getNumericQuery('price_min'),
            'price_max' => $this->getNumericQuery('price_max'),
            'product_condition' => $this->query('product_condition'),
            'sort' => $this->query('sort', 'newest')
        ];

        $productModel = new Product();
        $categoryModel = new Category();

        $products = $productModel->getFiltered($filters, self::ITEMS_PER_PAGE, $offset);
        $totalProducts = $productModel->countFiltered($filters);
        $totalPages = (int) ceil($totalProducts / self::ITEMS_PER_PAGE);

        // SEO cho trang danh sách sản phẩm
        SeoHelper::setTitle('Tất cả sản phẩm');
        SeoHelper::setDescription('Khám phá hàng ngàn sản phẩm secondhand chất lượng với giá tốt nhất tại Zoldify');

        $this->view('products/index', [
            'products' => $products,
            'currentPage' => $page,
            'totalPages' => $totalPages,
            'categories' => $categoryModel->getTree(),
            'keyword' => $filters['keyword'],
            'categoryId' => 0,
            'sort' => $filters['sort'],
            'priceMin' => $filters['price_min'],
            'priceMax' => $filters['price_max'],
            'currentCondition' => $filters['product_condition'] ?? ''
        ]);
    }

    /**
     * Show product với SEO URL (Zoldify style)
     * 
     * URL: /z/ten-san-pham.p123
     */
    public function showBySlug(string $slug, int $productId): void
    {
        // Gọi show() với flag fromSeoUrl=true để không redirect lại
        $this->show($productId, true);
    }

    /**
     * Show single product detail
     * 
     * Nếu truy cập bằng URL cũ /products/{id}, redirect sang SEO URL mới
     */
    public function show(int|string $id, bool $fromSeoUrl = false): void
    {
        $productModel = new Product();
        $product = $productModel->find((int) $id);

        if (!$product) {
            $this->handleNotFound('Sản phẩm không tồn tại');
            return;
        }

        // Redirect sang SEO URL nếu truy cập bằng URL cũ
        if (!$fromSeoUrl) {
            $seoUrl = \App\Helpers\SlugHelper::productUrl(
                $product['name'],
                (int) $product['user_id'],
                (int) $product['id']
            );
            header("Location: {$seoUrl}", true, 301);
            exit;
        }

        // Tăng lượt xem
        $productModel->incrementViews((int) $id);

        $userModel = new User();
        $seller = $userModel->find($product['user_id']);

        // Lấy địa chỉ mặc định của seller từ user_addresses
        $addressModel = new UserAddress();
        $sellerAddress = $addressModel->getDefaultAddress((int) $product['user_id']);

        // Gắn province vào seller để hiển thị vận chuyển
        if ($seller) {
            $seller['address'] = $sellerAddress['province'] ?? null;
        }

        $productImages = $this->getProductImages((int) $id, $product['image'] ?? null);
        $relatedProducts = $productModel->getByCategory($product['category_id'], 4, $product['id']);

        // Stats
        $activeProductCount = $productModel->countActiveByUserId($product['user_id']);

        $reviewModel = new \App\Models\Review();
        $stats = $reviewModel->getSellerStats($product['user_id']);

        // ========== SEO: Set meta tags cho trang sản phẩm ==========
        $mainImageUrl = !empty($productImages[0]['image_path'])
            ? ImageHelper::url('uploads/' . $productImages[0]['image_path'])
            : null;

        SeoHelper::setProduct($product, $mainImageUrl);
        // ===========================================================

        $this->view('products/detail', [
            'product' => $product,
            'seller' => $seller,
            'productImages' => $productImages,
            'relatedProducts' => $relatedProducts,
            'activeProductCount' => $activeProductCount,
            'stats' => $stats
        ]);
    }

    /**
     * Show product creation form
     */
    public function create(): void
    {
        PhoneVerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $categoryModel = new Category();
        $addressModel = new UserAddress();

        // Lấy danh sách địa chỉ của seller
        $addresses = $addressModel->getByUserId((int) $user['id']);

        // Kiểm tra có địa chỉ với GHN codes không
        $hasValidGHNAddress = false;
        foreach ($addresses as $addr) {
            if (!empty($addr['ghn_district_id']) && !empty($addr['ghn_ward_code'])) {
                $hasValidGHNAddress = true;
                break;
            }
        }

        $this->view('products/create', [
            'categories' => $categoryModel->getTree(),
            'addresses' => $addresses,
            'hasValidGHNAddress' => $hasValidGHNAddress
        ]);
    }

    /**
     * Store new product
     */
    public function store(): void
    {
        PhoneVerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->redirect('/products/create');
        }

        $data = $_POST;

        // DEBUG: Write to file
        file_put_contents(__DIR__ . '/../../storage/logs/debug_post.txt', print_r($_POST, true));

        $errors = $this->validateProductData($data);

        if (!empty($errors)) {
            $categoryModel = new Category();
            $this->view('products/create', [
                'errors' => $errors,
                'old' => $data,
                'categories' => $categoryModel->getTree()
            ]);
            return;
        }

        // Debug: Log $_FILES data
        $this->debugLog("=== START UPLOAD DEBUG ===");
        $this->debugLog("FILES data: " . json_encode($_FILES['images'] ?? 'NO FILES'));

        $uploadedImages = $this->handleImageUpload();

        $this->debugLog("Upload result: " . json_encode($uploadedImages));
        $this->debugLog("=== END UPLOAD DEBUG ===");

        $mainImage = $uploadedImages[0] ?? 'default_product.png';

        // Debug: Log condition received
        error_log("[ProductController] Condition from POST: " . ($data['product_condition'] ?? 'NOT SET'));

        $productData = [
            'name' => htmlspecialchars($data['name']),
            'price' => (int) $data['price'],
            'description' => $this->buildDescription($data),
            'user_id' => $user['id'],
            'category_id' => (int) $data['category_id'],
            'quantity' => max(1, (int) ($data['quantity'] ?? 1)),
            'image' => $mainImage,
            'product_condition' => $data['product_condition'] ?? 'good',
            'is_freeship' => (int) ($data['is_freeship'] ?? \App\Models\Product::SHIP_PAYER_BUYER)
        ];

        // DEBUG: Write productData to file
        file_put_contents(__DIR__ . '/../../storage/logs/debug_productdata.txt', print_r($productData, true));

        try {
            $productModel = new Product();
            $newId = $productModel->create($productData);

            if ($newId) {
                // DEBUG: Check what was actually saved in database
                $savedProduct = $productModel->find($newId);
                error_log("[ProductController] SAVED condition in DB: " . ($savedProduct['product_condition'] ?? 'NULL'));
                file_put_contents(
                    __DIR__ . '/../../storage/logs/debug_saved.txt',
                    "Product ID: $newId\n" .
                    "Expected condition: " . $productData['product_condition'] . "\n" .
                    "Actual condition in DB: " . ($savedProduct['product_condition'] ?? 'NULL') . "\n" .
                    print_r($savedProduct, true)
                );

                $this->saveProductImages($newId, $uploadedImages);
                $this->notifyFollowers($user, $productData['name']);
                $this->redirect('/shop?id=' . $user['id']);
            } else {
                throw new \Exception('Không thể tạo sản phẩm');
            }
        } catch (\Exception $e) {
            $categoryModel = new Category();
            $this->view('products/create', [
                'errors' => ['db' => 'Lỗi: ' . $e->getMessage()],
                'old' => $data,
                'categories' => $categoryModel->getTree()
            ]);
        }
    }

    /**
     * Cancel product sale (delete or hide)
     */
    public function cancelSale(int|string $id): void
    {
        if (!$this->isAuthenticated()) {
            $this->jsonError('Bạn chưa đăng nhập', 401);
        }

        $productId = (int) $id;
        $productModel = new Product();
        $product = $productModel->find($productId);

        if (!$product) {
            $this->jsonError('Sản phẩm không tồn tại', 404);
        }

        if ($product['user_id'] !== $this->getUserId()) {
            $this->jsonError('Bạn không có quyền xoá sản phẩm này', 403);
        }

        // Check if product has any orders
        if ($productModel->hasAnyOrder($productId)) {
            $this->jsonError(
                'Sản phẩm đã phát sinh đơn hàng nên không thể xoá vĩnh viễn. Bạn chỉ có thể ẩn sản phẩm.',
                400
            );
        }

        if ($productModel->delete($productId)) {
            $this->jsonSuccess('Đã xoá sản phẩm thành công');
        } else {
            $this->jsonError('Lỗi hệ thống, không thể xoá', 500);
        }
    }

    // ==================== PRIVATE HELPERS ====================

    /**
     * Get numeric query parameter
     */
    private function getNumericQuery(string $key): ?int
    {
        $value = $this->query($key);
        return ($value !== null && is_numeric($value)) ? (int) $value : null;
    }

    /**
     * Validate product data
     * 
     * @return array<string, string> Errors
     */
    private function validateProductData(array $data): array
    {
        $errors = [];

        if (empty($data['name'])) {
            $errors['name'] = 'Tên sản phẩm không được để trống';
        }

        if (empty($data['price']) || !is_numeric($data['price']) || $data['price'] <= 0) {
            $errors['price'] = 'Giá bán không hợp lệ';
        }

        if (empty($data['category_id'])) {
            $errors['category_id'] = 'Vui lòng chọn danh mục';
        }

        if (!isset($_FILES['images']) || $_FILES['images']['error'][0] !== UPLOAD_ERR_OK) {
            $errors['images'] = 'Vui lòng chọn ít nhất 1 ảnh sản phẩm';
        }

        return $errors;
    }

    /**
     * Handle image upload
     * 
     * @return array<string> Uploaded image paths
     * @throws \RuntimeException Nếu upload thất bại
     */
    private function handleImageUpload(): array
    {
        $uploadedImages = [];

        if (!isset($_FILES['images']) || empty($_FILES['images']['name'][0])) {
            return $uploadedImages;
        }

        $rootDir = __DIR__ . '/../../public/';
        $uploadDir = 'uploads/products/';
        $fullUploadPath = $rootDir . $uploadDir;

        // Tạo thư mục nếu chưa có
        if (!is_dir($fullUploadPath)) {
            if (!mkdir($fullUploadPath, 0755, true)) {
                error_log("[ProductController] FAILED to create upload directory: {$fullUploadPath}");
                throw new \RuntimeException('Không thể tạo thư mục upload. Vui lòng liên hệ admin.');
            }
        }

        // Kiểm tra quyền ghi
        if (!is_writable($fullUploadPath)) {
            error_log("[ProductController] Upload directory NOT WRITABLE: {$fullUploadPath}");
            throw new \RuntimeException('Thư mục upload không có quyền ghi. Vui lòng liên hệ admin.');
        }

        $fileCount = count($_FILES['images']['name']);
        $uploadErrors = [];

        for ($i = 0; $i < $fileCount; $i++) {
            $errorCode = $_FILES['images']['error'][$i];

            if ($errorCode === UPLOAD_ERR_OK) {
                $fileTmp = $_FILES['images']['tmp_name'][$i];
                $originalName = basename($_FILES['images']['name'][$i]);
                $fileName = time() . '_' . $i . '_' . $this->sanitizeFileName($originalName);
                $targetPath = $fullUploadPath . $fileName;

                if (move_uploaded_file($fileTmp, $targetPath)) {
                    $uploadedImages[] = 'products/' . $fileName;
                    error_log("[ProductController] Successfully uploaded: {$fileName}");
                } else {
                    $uploadErrors[] = "Không thể lưu file: {$originalName}";
                    error_log("[ProductController] FAILED move_uploaded_file: {$originalName} -> {$targetPath}");
                }
            } else {
                $errorMessage = $this->getUploadErrorMessage($errorCode);
                $uploadErrors[] = $errorMessage;
                error_log("[ProductController] Upload error code {$errorCode}: {$errorMessage}");
            }
        }

        // Log kết quả
        error_log("[ProductController] Upload completed: " . count($uploadedImages) . " files, " . count($uploadErrors) . " errors");

        return $uploadedImages;
    }

    /**
     * Sanitize filename để tránh lỗi ký tự đặc biệt
     */
    private function sanitizeFileName(string $filename): string
    {
        // Remove dấu tiếng Việt
        $filename = preg_replace('/[áàảãạăắằẳẵặâấầẩẫậ]/u', 'a', $filename);
        $filename = preg_replace('/[éèẻẽẹêếềểễệ]/u', 'e', $filename);
        $filename = preg_replace('/[íìỉĩị]/u', 'i', $filename);
        $filename = preg_replace('/[óòỏõọôốồổỗộơớờởỡợ]/u', 'o', $filename);
        $filename = preg_replace('/[úùủũụưứừửữự]/u', 'u', $filename);
        $filename = preg_replace('/[ýỳỷỹỵ]/u', 'y', $filename);
        $filename = preg_replace('/[đ]/u', 'd', $filename);

        // Remove ký tự đặc biệt, chỉ giữ alphanumeric, -, _, .
        $filename = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $filename);

        return strtolower($filename);
    }

    /**
     * Get human-readable error message for upload error codes
     */
    private function getUploadErrorMessage(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE => 'File quá lớn (vượt quá giới hạn server)',
            UPLOAD_ERR_FORM_SIZE => 'File quá lớn (vượt quá giới hạn form)',
            UPLOAD_ERR_PARTIAL => 'File chỉ được upload một phần',
            UPLOAD_ERR_NO_FILE => 'Không có file nào được upload',
            UPLOAD_ERR_NO_TMP_DIR => 'Thiếu thư mục tạm (lỗi server)',
            UPLOAD_ERR_CANT_WRITE => 'Không thể ghi file (lỗi permission)',
            UPLOAD_ERR_EXTENSION => 'Upload bị chặn bởi PHP extension',
            default => 'Lỗi upload không xác định (code: ' . $errorCode . ')',
        };
    }

    /**
     * Build product description with condition
     */
    private function buildDescription(array $data): string
    {
        $description = htmlspecialchars($data['description'] ?? '');

        if (!empty($data['product_condition'])) {
            $conditions = Product::getConditions();
            $conditionLabel = $conditions[$data['product_condition']]['label'] ?? $data['product_condition'];
            $description .= "\n\nTình trạng: " . $conditionLabel;
        }

        return $description;
    }

    /**
     * Get product images with fallback
     * 
     * @return array<int, array<string, mixed>>
     */
    private function getProductImages(int $productId, ?string $fallbackImage): array
    {
        try {
            $productImageModel = new ProductImage();
            $images = $productImageModel->getByProductId($productId);

            if (!empty($images)) {
                return $images;
            }
        } catch (\Exception $e) {
            // Table might not exist
        }

        // Fallback to main image
        if (!empty($fallbackImage)) {
            return [['image_path' => $fallbackImage, 'is_primary' => 1]];
        }

        return [];
    }

    /**
     * Save product images to database
     */
    private function saveProductImages(int $productId, array $images): void
    {
        if (empty($images)) {
            return;
        }

        try {
            $productImageModel = new ProductImage();
            $productImageModel->addMultiple($productId, $images);
        } catch (\Exception $e) {
            // Table might not exist, ignore
        }
    }

    /**
     * Notify followers about new product
     */
    private function notifyFollowers(array $user, string $productName): void
    {
        try {
            $followModel = new Follow();
            $notifModel = new Notification();

            $followers = $followModel->getFollowers($user['id']);
            $content = "Shop {$user['full_name']} vừa đăng bán sản phẩm mới: {$productName}";

            foreach ($followers as $follower) {
                $notifModel->create($follower['id'], $content);
            }
        } catch (\Exception $e) {
            // Ignore notification errors
        }
    }

    /**
     * Handle not found response
     */
    private function handleNotFound(string $message): void
    {
        http_response_code(404);
        $this->view('errors/404', ['message' => $message]);
    }

    /**
     * Handle report product
     */
    public function report(): void
    {
        // Check login
        if (empty($_SESSION['user'])) {
            $this->redirect('/login');
            return;
        }

        $productId = isset($_POST['product_id']) ? (int) $_POST['product_id'] : 0;
        $reason = $_POST['reason'] ?? '';
        $description = $_POST['description'] ?? '';
        $reporterId = $_SESSION['user']['id'];

        if (!$productId || !$reason) {
            $this->redirectWithParams($_SERVER['HTTP_REFERER'] ?? '/', ['error' => 'missing_data']);
            return;
        }

        try {
            $reportModel = new Report();

            // Combine reason and description since DB doesn't have description column
            $fullReason = $reason;
            if (!empty($description)) {
                $fullReason .= " (" . $description . ")";
            }

            $reportModel->create([
                'product_id' => $productId,
                'reporter_id' => $reporterId,
                'reason' => $fullReason,
                'status' => Report::STATUS_PENDING
            ]);

            $this->redirectWithParams($_SERVER['HTTP_REFERER'] ?? "/products/$productId", ['success' => 'report_sent']);

        } catch (\Exception $e) {
            $this->redirectWithParams($_SERVER['HTTP_REFERER'] ?? "/products/$productId", ['error' => 'server_error']);
        }
    }

    private function redirectWithParams(string $url, array $params): void
    {
        $sep = (strpos($url, '?') !== false) ? '&' : '?';
        $query = http_build_query($params);
        header("Location: " . $url . $sep . $query);
        exit;
    }
}