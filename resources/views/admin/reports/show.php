<!-- Page Header -->
<div class="mb-6">
    <a href="/admin/reports" class="text-blue-500 hover:text-blue-600 text-sm font-medium inline-flex items-center gap-1 mb-4">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Quay lại danh sách</span>
    </a>
    <h1 class="text-2xl font-bold text-gray-800">Chi Tiết Báo Cáo Vi Phạm</h1>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column: Product Details -->
    <div class="lg:col-span-2">
        <!-- Product Information -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-box text-blue-500"></i>
                Thông Tin Sản Phẩm Bị Báo Cáo
            </h2>
            
            <div class="flex gap-6">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                    <img src="/uploads/<?= htmlspecialchars($report['product_image'] ?: 'default.png') ?>" 
                         alt="<?= htmlspecialchars($report['product_name']) ?>"
                         class="w-48 h-48 object-cover rounded-lg border-2 border-gray-200">
                </div>
                
                <!-- Product Info -->
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-3"><?= htmlspecialchars($report['product_name']) ?></h3>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Giá</p>
                            <p class="text-lg font-bold text-red-500"><?= number_format($report['product_price'], 0, ',', '.') ?>đ</p>
                        </div>
                        
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Số Lượng</p>
                            <p class="text-gray-800 font-medium"><?= $report['product_quantity'] ?></p>
                        </div>
                        
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Tình Trạng</p>
                            <p class="text-gray-800 font-medium"><?= ucfirst($report['product_condition'] ?? 'N/A') ?></p>
                        </div>
                        
                        <div>
                            <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Danh Mục</p>
                            <p class="text-gray-800 font-medium"><?= htmlspecialchars($report['category_name'] ?? 'N/A') ?></p>
                        </div>
                    </div>
                    
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Người Bán</p>
                        <p class="text-gray-800 font-medium"><?= htmlspecialchars($report['seller_name'] ?? 'N/A') ?></p>
                    </div>
                </div>
            </div>
            
            <!-- Product Description -->
            <div class="mt-6 pt-6 border-t">
                <p class="text-xs text-gray-500 uppercase font-semibold mb-2">Mô Tả Sản Phẩm</p>
                <div class="text-gray-700 leading-relaxed">
                    <?= nl2br(htmlspecialchars($report['product_description'])) ?>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Right Column: Report Info & Actions -->
    <div class="lg:col-span-1">
        <!-- Report Details -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-flag text-orange-500"></i>
                Thông Tin Báo Cáo
            </h2>
            
            <div class="space-y-4">
                <div class="border-l-4 border-orange-500 pl-4 bg-orange-50 p-3 rounded">
                    <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Lý Do Báo Cáo</p>
                    <p class="text-gray-800"><?= htmlspecialchars($report['reason']) ?></p>
                </div>
                
                <div class="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded">
                    <p class="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng Thái Sản Phẩm</p>
                    <?php if ($report['product_status'] === 'hidden'): ?>
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <i class="fa-solid fa-eye-slash"></i> Đã Ẩn
                        </span>
                    <?php else: ?>
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <i class="fa-solid fa-eye"></i> Đang Hiển Thị
                        </span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-gavel text-red-500"></i>
                Hành Động
            </h2>
            
            <?php if ($report['product_status'] !== 'hidden'): ?>
                <form method="POST" action="/admin/reports/hide-product" onsubmit="return confirm('Bạn có chắc chắn muốn ẩn sản phẩm này khỏi danh sách công khai?')">
                    <input type="hidden" name="report_id" value="<?= $report['id'] ?>">
                    <input type="hidden" name="product_id" value="<?= $report['product_id'] ?>">
                    
                    <button type="submit" 
                        class="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-semibold">
                        <i class="fa-solid fa-eye-slash"></i>
                        <span>Ẩn Sản Phẩm Này</span>
                    </button>
                    
                    <div class="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                        <p class="text-xs text-yellow-800">
                            <i class="fa-solid fa-exclamation-triangle mr-1"></i>
                            <strong>Lưu ý:</strong> Hành động này sẽ ẩn sản phẩm khỏi tất cả người dùng. Sản phẩm sẽ không còn hiển thị trong danh sách và kết quả tìm kiếm.
                        </p>
                    </div>
                </form>
            <?php else: ?>
                <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                    <div class="flex items-center gap-2 mb-2">
                        <i class="fa-solid fa-check-circle text-xl"></i>
                        <span class="font-semibold">Đã Xử Lý</span>
                    </div>
                    <p class="text-sm">Sản phẩm này đã được ẩn khỏi danh sách công khai.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
