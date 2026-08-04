<!-- Page Header -->
<div class="flex items-center gap-4 mb-6">
    <a href="/admin/products" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <i class="fa-solid fa-arrow-left text-gray-500"></i>
    </a>
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Sửa sản phẩm</h1>
        <p class="text-gray-500 text-sm mt-1">ID: #
            <?= $product['id'] ?>
        </p>
    </div>
</div>

<!-- Edit Form -->
<div class="bg-white rounded-xl shadow-sm p-6 max-w-3xl">
    <form action="/admin/products/update" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="id" value="<?= $product['id'] ?>">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                <input type="text" name="name" value="<?= htmlspecialchars($product['name']) ?>"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required>
            </div>

            <!-- Price -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                <input type="number" name="price" min="0" step="1000" value="<?= $product['price'] ?>"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required>
            </div>

            <!-- Quantity -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                <input type="number" name="quantity" min="0" value="<?= $product['quantity'] ?>"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required>
            </div>

            <!-- Category -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select name="category_id"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= $cat['id'] ?>" <?= $cat['id'] == $product['category_id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($cat['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Status -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select name="status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active" <?= ($product['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Đang bán
                    </option>
                    <option value="inactive" <?= ($product['status'] ?? '') === 'inactive' ? 'selected' : '' ?>>Ẩn
                    </option>
                </select>
            </div>

            <!-- Current Image -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh hiện tại</label>
                <?php if (!empty($product['image'])): ?>
                    <img src="/uploads/<?= $product['image'] ?>" alt="Current"
                        class="w-32 h-32 object-cover rounded-lg border mb-3">
                <?php else: ?>
                    <p class="text-gray-500 text-sm mb-3">Chưa có hình ảnh</p>
                <?php endif; ?>

                <input type="file" name="image" accept="image/*"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <p class="text-xs text-gray-500 mt-1">Để trống nếu không muốn thay đổi</p>
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea name="description" rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><?= htmlspecialchars($product['description'] ?? '') ?></textarea>
            </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 mt-6">
            <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
            </button>
            <a href="/admin/products"
                class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Hủy
            </a>
        </div>
    </form>
</div>