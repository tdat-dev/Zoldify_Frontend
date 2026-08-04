<!-- Page Header -->
<div class="flex items-center gap-4 mb-6">
    <a href="/admin/users" class="p-2 hover:bg-gray-100 rounded-lg transition">
        <i class="fa-solid fa-arrow-left text-gray-500"></i>
    </a>
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Sửa thông tin User</h1>
        <p class="text-gray-500 text-sm mt-1">ID: #
            <?= $user['id'] ?>
        </p>
    </div>
</div>

<!-- Edit Form -->
<div class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
    <form action="/admin/users/update" method="POST">
        <input type="hidden" name="id" value="<?= $user['id'] ?>">

        <!-- Full Name -->
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
            <input type="text" name="full_name" value="<?= htmlspecialchars($user['full_name']) ?>"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required>
        </div>

        <!-- Email -->
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" name="email" value="<?= htmlspecialchars($user['email']) ?>"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required>
        </div>

        <!-- Phone -->
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input type="text" name="phone_number" value="<?= htmlspecialchars($user['phone_number'] ?? '') ?>"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>

        <!-- Role -->
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select name="role"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="buyer" <?= $user['role'] === 'buyer' ? 'selected' : '' ?>>Buyer (Người mua)</option>
                <option value="seller" <?= $user['role'] === 'seller' ? 'selected' : '' ?>>Seller (Người bán)</option>
                <option value="admin" <?= $user['role'] === 'admin' ? 'selected' : '' ?>>Admin</option>
            </select>
        </div>

        <!-- Email Verified -->
        <div class="mb-6">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="email_verified" value="1" <?= !empty($user['email_verified']) ? 'checked' : '' ?>
                class="w-4 h-4 text-blue-500 rounded focus:ring-blue-500">
                <span class="text-sm text-gray-700">Email đã xác minh</span>
            </label>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
            <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                <i class="fa-solid fa-save mr-2"></i>Lưu thay đổi
            </button>
            <a href="/admin/users" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Hủy
            </a>
        </div>
    </form>
</div>