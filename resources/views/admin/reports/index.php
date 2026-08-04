<!-- Page Header -->
<div class="flex justify-between items-center mb-6">
    <div>
        <h1 class="text-2xl font-bold text-gray-800">Báo Cáo Vi Phạm</h1>
        <p class="text-gray-500 text-sm mt-1">Quản lý các báo cáo vi phạm từ người dùng</p>
    </div>
</div>

<?php if (empty($reports)): ?>
    <!-- Empty State -->
    <div class="bg-white rounded-xl shadow-sm p-12 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-flag text-red-500 text-2xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Chưa có báo cáo nào</h3>
        <p class="text-gray-500 text-sm">Không có báo cáo vi phạm nào trong hệ thống</p>
    </div>
<?php else: ?>
    <!-- Reports Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Sản Phẩm</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Lý Do</th>
                    <th class="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Trạng Thái</th>
                    <th class="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Thao Tác</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <?php foreach ($reports as $report): ?>
                    <tr class="hover:bg-gray-50 transition">
                        <td class="py-4 px-6 text-sm text-gray-600 font-medium">#<?= $report['id'] ?></td>
                        <td class="py-4 px-6">
                            <div class="font-medium text-gray-800"><?= htmlspecialchars($report['product_name']) ?></div>
                        </td>
                        <td class="py-4 px-6">
                            <div class="text-sm text-gray-600 line-clamp-2"><?= htmlspecialchars($report['reason']) ?></div>
                        </td>
                        <td class="py-4 px-6">
                            <?php
                            $statusColors = [
                                'pending' => 'bg-yellow-100 text-yellow-700',
                                'resolved' => 'bg-green-100 text-green-700',
                                'rejected' => 'bg-red-100 text-red-700'
                            ];
                            $color = $statusColors[$report['status']] ?? 'bg-gray-100 text-gray-700';
                            ?>
                            <span class="px-2 py-1 rounded-full text-xs font-medium <?= $color ?>">
                                <?= ucfirst($report['status']) ?>
                            </span>
                        </td>
                        <td class="py-4 px-6">
                            <div class="flex items-center justify-center gap-2">
                                <a href="/admin/reports/show?id=<?= $report['id'] ?>"
                                    class="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1">
                                    <i class="fa-solid fa-eye"></i>
                                    <span>Xem</span>
                                </a>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>
