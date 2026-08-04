<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
        <p class="text-gray-500 text-sm mt-1">Tổng cộng <?= $totalCategories ?> danh mục</p>
    </div>
</div>

<!-- Alert Messages -->
<?php if (isset($_SESSION['success'])): ?>
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
        <?= $_SESSION['success'];
        unset($_SESSION['success']); ?>
    </div>
<?php endif; ?>

<?php if (isset($_SESSION['error'])): ?>
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        <?= $_SESSION['error'];
        unset($_SESSION['error']); ?>
    </div>
<?php endif; ?>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Form Add/Edit Category (Bên trái) -->
    <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">
                <?= $editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới' ?>
            </h2>

            <form action="<?= $editingCategory ? '/admin/categories/update' : '/admin/categories/store' ?>"
                method="POST" enctype="multipart/form-data">
                <?php if ($editingCategory): ?>
                    <input type="hidden" name="id" value="<?= $editingCategory['id'] ?>">
                <?php endif; ?>

                <!-- Name -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tên danh mục</label>
                    <input type="text" name="name" value="<?= htmlspecialchars($editingCategory['name'] ?? '') ?>"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Điện tử" required>
                </div>

                <!-- Icon Upload -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Icon danh mục</label>

                    <?php if (!empty($editingCategory['icon'])): ?>
                        <div class="mb-2 flex items-center gap-2">
                            <img src="<?= $editingCategory['icon'] ?>" alt="Current icon"
                                class="w-12 h-12 object-contain border rounded">
                            <span class="text-xs text-gray-500">Icon hiện tại</span>
                        </div>
                    <?php endif; ?>

                    <input type="file" name="icon" accept="image/*"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                    <p class="text-xs text-gray-500 mt-1">
                        <?= $editingCategory ? 'Để trống nếu không muốn thay đổi' : 'Hỗ trợ: JPG, PNG, GIF, SVG' ?>
                    </p>
                </div>

                <!-- Description -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea name="description" rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mô tả ngắn về danh mục..."><?= htmlspecialchars($editingCategory['description'] ?? '') ?></textarea>
                </div>

                <!-- Buttons -->
                <div class="flex gap-2">
                    <button type="submit"
                        class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        <i class="fa-solid fa-save mr-2"></i>
                        <?= $editingCategory ? 'Cập nhật' : 'Thêm mới' ?>
                    </button>

                    <?php if ($editingCategory): ?>
                        <a href="/admin/categories"
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                            Hủy
                        </a>
                    <?php endif; ?>
                </div>
            </form>
        </div>
    </div>

    <!-- Categories List (Bên phải) -->
    <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Icon</th>
                        <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Tên danh mục</th>
                        <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Số SP</th>
                        <th class="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <?php foreach ($categories as $cat): ?>
                        <tr
                            class="hover:bg-gray-50 transition <?= ($editingCategory && $editingCategory['id'] == $cat['id']) ? 'bg-blue-50' : '' ?>">
                            <td class="py-4 px-6">
                                <?php
                                // Ưu tiên hiển thị 'image' nếu có
                                if (!empty($cat['image'])): ?>
                                    <img src="<?= $cat['image'] ?>" alt="<?= $cat['name'] ?>" class="w-10 h-10 object-contain">
                                <?php elseif (!empty($cat['icon'])):
                                    // Kiểm tra xem icon là class FontAwesome hay đường dẫn ảnh
                                    $isPathIcon = (strpos($cat['icon'], '/') === 0 || strpos($cat['icon'], 'http') === 0);
                                    if ($isPathIcon): ?>
                                        <img src="<?= $cat['icon'] ?>" alt="<?= $cat['name'] ?>" class="w-10 h-10 object-contain">
                                    <?php else: ?>
                                        <i class="fa-solid <?= $cat['icon'] ?> text-2xl text-slate-500"></i>
                                    <?php endif; ?>
                                <?php else: ?>
                                    <span class="text-2xl">📦</span>
                                <?php endif; ?>
                            </td>
                            <td class="py-4 px-6">
                                <div class="font-medium text-gray-800"><?= htmlspecialchars($cat['name']) ?></div>
                                <div class="text-xs text-gray-500">ID: #<?= $cat['id'] ?></div>
                            </td>
                            <td class="py-4 px-6">
                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    <?= $cat['product_count'] ?> sản phẩm
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex items-center justify-center gap-2">
                                    <!-- Edit -->
                                    <a href="/admin/categories?edit=<?= $cat['id'] ?>"
                                        class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Sửa">
                                        <i class="fa-solid fa-edit"></i>
                                    </a>

                                    <!-- Delete -->
                                    <form action="/admin/categories/delete" method="POST" class="inline"
                                        onsubmit="return confirm('Bạn có chắc muốn xóa danh mục này?')">
                                        <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                                        <button type="submit" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Xóa" <?= $cat['product_count'] > 0 ? 'disabled' : '' ?>>
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>

                    <?php if (empty($categories)): ?>
                        <tr>
                            <td colspan="4" class="py-8 text-center text-gray-500">
                                <i class="fa-solid fa-folder-open text-4xl text-gray-300 mb-3"></i>
                                <p>Chưa có danh mục nào</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>