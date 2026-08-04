<!-- Page Title -->
<div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Tổng quan</h1>
    <p class="text-gray-500 text-sm mt-1">Chào mừng trở lại, <?= $_SESSION['user']['full_name'] ?? 'Admin' ?>.</p>
</div>

<!-- Dashboard Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

    <!-- Total Users -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <i class="fa-solid fa-users text-xl"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-green-50 text-green-600 flex items-center gap-1">
                <i class="fa-solid fa-arrow-up text-[10px]"></i> 12%
            </span>
        </div>
        <div>
            <p class="text-gray-500 text-sm font-medium mb-1">Tổng Users</p>
            <h3 class="text-2xl font-bold text-gray-800"><?= number_format($stats['total_users']) ?></h3>
        </div>
    </div>

    <!-- Total Products -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <i class="fa-solid fa-box text-xl"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-green-50 text-green-600 flex items-center gap-1">
                <i class="fa-solid fa-arrow-up text-[10px]"></i> 8%
            </span>
        </div>
        <div>
            <p class="text-gray-500 text-sm font-medium mb-1">Tổng Sản phẩm</p>
            <h3 class="text-2xl font-bold text-gray-800"><?= number_format($stats['total_products']) ?></h3>
        </div>
    </div>

    <!-- Total Orders -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <i class="fa-solid fa-shopping-cart text-xl"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-500">
                0%
            </span>
        </div>
        <div>
            <p class="text-gray-500 text-sm font-medium mb-1">Đơn hàng</p>
            <h3 class="text-2xl font-bold text-gray-800"><?= number_format($stats['total_orders']) ?></h3>
        </div>
    </div>

    <!-- Total Revenue -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <i class="fa-solid fa-dollar-sign text-xl"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-500">
                0%
            </span>
        </div>
        <div>
            <p class="text-gray-500 text-sm font-medium mb-1">Doanh thu</p>
            <h3 class="text-2xl font-bold text-gray-800"><?= number_format($stats['total_revenue']) ?>đ</h3>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    <!-- Quick Actions -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-1">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Hành động nhanh</h2>
        <div class="flex flex-col gap-3">
            <a href="/admin/products/create"
                class="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i class="fa-solid fa-plus"></i>
                </div>
                <div>
                    <h4 class="font-medium text-gray-800 text-sm">Thêm sản phẩm</h4>
                    <p class="text-xs text-gray-500">Tạo sản phẩm mới</p>
                </div>
                <i class="fa-solid fa-chevron-right ml-auto text-gray-400 group-hover:text-gray-600 text-xs"></i>
            </a>

            <a href="/admin/users"
                class="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <i class="fa-solid fa-users"></i>
                </div>
                <div>
                    <h4 class="font-medium text-gray-800 text-sm">Quản lý Users</h4>
                    <p class="text-xs text-gray-500">Danh sách người dùng</p>
                </div>
                <i class="fa-solid fa-chevron-right ml-auto text-gray-400 group-hover:text-gray-600 text-xs"></i>
            </a>

            <a href="/admin/orders"
                class="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    <i class="fa-solid fa-list"></i>
                </div>
                <div>
                    <h4 class="font-medium text-gray-800 text-sm">Xem đơn hàng</h4>
                    <p class="text-xs text-gray-500">Kiểm tra đơn mới</p>
                </div>
                <i class="fa-solid fa-chevron-right ml-auto text-gray-400 group-hover:text-gray-600 text-xs"></i>
            </a>
        </div>
    </div>

    <!-- Recent Activity Placeholder -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
            <button class="text-xs text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
        </div>

        <div
            class="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <i class="fa-solid fa-history text-2xl"></i>
            </div>
            <h3 class="text-gray-800 font-medium mb-1">Chưa có hoạt động nào</h3>
            <p class="text-gray-500 text-sm max-w-xs">Các hoạt động mới sẽ xuất hiện tại đây khi hệ thống bắt đầu vận
                hành.</p>
        </div>
    </div>
</div>