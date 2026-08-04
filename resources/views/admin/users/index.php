<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Quản lý Users</h1>
        <p class="text-gray-500 text-sm mt-1">Tổng cộng <?= $totalUsers ?> người dùng</p>
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

<!-- Users Table -->
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-gray-50 border-b">
            <tr>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Họ tên</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Xác minh</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Ngày tạo</th>
                <th class="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
            <?php foreach ($users as $user): ?>
                <tr class="hover:bg-gray-50 transition">
                    <td class="py-4 px-6 text-sm text-gray-600">#<?= $user['id'] ?></td>
                    <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                <?= strtoupper(substr($user['full_name'], 0, 1)) ?>
                            </div>
                            <div>
                                <div class="font-medium text-gray-800"><?= htmlspecialchars($user['full_name']) ?></div>
                                <div class="text-xs text-gray-500"><?= $user['phone_number'] ?? 'Chưa có SĐT' ?></div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-600"><?= htmlspecialchars($user['email']) ?></td>
                    <td class="py-4 px-6">
                        <?php
                        $roleColors = [
                            'admin' => 'bg-red-100 text-red-700',
                            'seller' => 'bg-blue-100 text-blue-700',
                            'buyer' => 'bg-gray-100 text-gray-700'
                        ];
                        $color = $roleColors[$user['role']] ?? 'bg-gray-100 text-gray-700';
                        ?>
                        <span class="px-2 py-1 rounded-full text-xs font-medium <?= $color ?>">
                            <?= ucfirst($user['role']) ?>
                        </span>
                    </td>
                    <td class="py-4 px-6">
                        <?php if ($user['email_verified']): ?>
                            <span class="text-green-500"><i class="fa-solid fa-check-circle"></i> Đã xác minh</span>
                        <?php else: ?>
                            <span class="text-orange-500"><i class="fa-solid fa-clock"></i> Chưa</span>
                        <?php endif; ?>
                    </td>
                    <td class="py-4 px-6">
                        <?php if (!empty($user['is_locked'])): ?>
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <i class="fa-solid fa-lock mr-1"></i>Bị khóa
                            </span>
                        <?php else: ?>
                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <i class="fa-solid fa-unlock mr-1"></i>Hoạt động
                            </span>
                        <?php endif; ?>
                    </td>
                    <td class="py-4 px-6 text-sm text-gray-500">
                        <?= \App\Helpers\TimeHelper::formatDate($user['created_at']) ?>
                    </td>
                    <td class="py-4 px-6">
                        <div class="flex items-center justify-center gap-2">
                            <!-- Edit -->
                            <a href="/admin/users/edit?id=<?= $user['id'] ?>"
                                class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Sửa">
                                <i class="fa-solid fa-edit"></i>
                            </a>

                            <!-- Toggle Email Verified -->
                            <form action="/admin/users/toggle-status" method="POST" class="inline">
                                <input type="hidden" name="id" value="<?= $user['id'] ?>">
                                <button type="submit" class="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                    title="Toggle xác minh email">
                                    <i class="fa-solid fa-envelope"></i>
                                </button>
                            </form>

                            <!-- Lock/Unlock -->
                            <?php if ($user['id'] != $_SESSION['user']['id']): ?>
                                <button type="button"
                                    onclick="toggleLock(<?= $user['id'] ?>, '<?= !empty($user['is_locked']) ? 'Mở khóa tài khoản này?' : 'Khóa tài khoản này?' ?>')"
                                    class="p-2 <?= !empty($user['is_locked']) ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50' ?> rounded-lg transition"
                                    title="<?= !empty($user['is_locked']) ? 'Mở khóa' : 'Khóa tài khoản' ?>">
                                    <i class="fa-solid fa-<?= !empty($user['is_locked']) ? 'unlock' : 'lock' ?>"></i>
                                </button>
                            <?php endif; ?>
                        </div>
                    </td>
                </tr>
            <?php endforeach; ?>

            <?php if (empty($users)): ?>
                <tr>
                    <td colspan="8" class="py-8 text-center text-gray-500">
                        <i class="fa-solid fa-users text-4xl text-gray-300 mb-3"></i>
                        <p>Chưa có user nào</p>
                    </td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
    <script>
        async function toggleLock(userId, message) {
            const confirmed = await ZDialog.confirm('Xác nhận', message);
            if (confirmed) {
                var form = document.createElement('form');
                form.method = 'POST';
                form.action = '/admin/users/toggle-lock';

                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'id';
                input.value = userId;

                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
            }
        }
    </script>
</div>