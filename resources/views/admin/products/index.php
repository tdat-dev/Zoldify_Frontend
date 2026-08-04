<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <p class="text-gray-500 text-sm mt-1">Tổng cộng
            <?= $totalProducts ?> sản phẩm
        </p>
    </div>
    <a href="/admin/products/create"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>Thêm sản phẩm</span>
    </a>
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

<!-- Products Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Sản phẩm</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Danh mục</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Giá</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Số lượng</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Người bán</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th class="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            <?php foreach ($products as $product): ?>
                <tr class="hover:bg-gray-50 transition">
                    <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                            <img src="/uploads/<?= $product['image'] ?: 'default.png' ?>"
                                alt="<?= htmlspecialchars($product['name']) ?>"
                                class="w-12 h-12 object-cover rounded-lg border">
                            <div>
                                <div class="font-medium text-gray-800 line-clamp-1">
                                    <?= htmlspecialchars($product['name']) ?>
                                </div>
                                <div class="text-xs text-gray-500">ID: #
                                    <?= $product['id'] ?>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                        <?= htmlspecialchars($product['category_name'] ?? 'Không có') ?>
                    </td>
                    <td class="py-4 px-6 text-sm font-medium text-red-500">
                        <?= number_format($product['price'], 0, ',', '.') ?>đ
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                        <?= $product['quantity'] ?>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600">
                        <?= htmlspecialchars($product['seller_name'] ?? 'N/A') ?>
                    </td>
                    <td class="py-4 px-6">
                        <?php if (($product['status'] ?? 'active') === 'active'): ?>
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Đang bán
                            </span>
                        <?php else: ?>
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Ẩn
                            </span>
                        <?php endif; ?>
                    </td>
                    <td class="py-4 px-6">
                        <div class="flex items-center justify-center gap-2">
                            <a href="/admin/products/edit?id=<?= $product['id'] ?>"
                                class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Sửa">
                                <i class="fa-solid fa-edit"></i>
                            </a>
                            <form action="/admin/products/delete" method="POST" class="inline"
                                onsubmit="return confirm('Bạn có chắc muốn xóa sản phẩm này?')">
                                <input type="hidden" name="id" value="<?= $product['id'] ?>">
                                <button type="submit" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="Xóa">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>

            <?php if (empty($products)): ?>
                <tr>
                    <td colspan="7" class="py-8 text-center text-gray-500">
                        <i class="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
                        <p>Chưa có sản phẩm nào</p>
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
</div>