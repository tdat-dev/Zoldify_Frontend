<aside
    class="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen fixed top-0 left-0 lg:relative z-20 transition-transform duration-300 transform -translate-x-full lg:translate-x-0"
    id="sidebar">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <a href="/admin" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
                <i class="fa-solid fa-bolt"></i>
            </div>
            <span class="text-lg font-bold text-gray-800">
                Zoldify <span class="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Admin</span>
            </span>
        </a>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-0.5">
        <!-- Dashboard -->
        <a href="/admin/dashboard"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= strpos($_SERVER['REQUEST_URI'], '/admin/dashboard') !== false || $_SERVER['REQUEST_URI'] === '/admin' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-chart-pie w-5 <?= strpos($_SERVER['REQUEST_URI'], '/admin/dashboard') !== false || $_SERVER['REQUEST_URI'] === '/admin' ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Tổng quan</span>
        </a>

        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Quản lý</div>

        <!-- Users -->
        <a href="/admin/users"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= strpos($_SERVER['REQUEST_URI'], '/admin/users') !== false ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-users w-5 <?= strpos($_SERVER['REQUEST_URI'], '/admin/users') !== false ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Người dùng</span>
        </a>

        <!-- Products -->
        <a href="/admin/products"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= strpos($_SERVER['REQUEST_URI'], '/admin/products') !== false ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-box w-5 <?= strpos($_SERVER['REQUEST_URI'], '/admin/products') !== false ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Sản phẩm</span>
        </a>

        <!-- Categories -->
        <a href="/admin/categories"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= strpos($_SERVER['REQUEST_URI'], '/admin/categories') !== false ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-folder w-5 <?= strpos($_SERVER['REQUEST_URI'], '/admin/categories') !== false ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Danh mục</span>
        </a>

        <!-- Orders -->
        <a href="/admin/orders"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= strpos($_SERVER['REQUEST_URI'], '/admin/orders') !== false ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-shopping-cart w-5 <?= strpos($_SERVER['REQUEST_URI'], '/admin/orders') !== false ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Đơn hàng</span>
        </a>

        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Tài chính</div>

        <!-- Wallet Management -->
        <a href="/admin/wallets"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/admin/wallets') && !str_contains($_SERVER['REQUEST_URI'], 'withdrawals') && !str_contains($_SERVER['REQUEST_URI'], 'escrow') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-wallet w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/admin/wallets') && !str_contains($_SERVER['REQUEST_URI'], 'withdrawals') && !str_contains($_SERVER['REQUEST_URI'], 'escrow') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Quản lý Ví</span>
        </a>

        <!-- Withdrawals -->
        <a href="/admin/wallets/withdrawals"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/withdrawals') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-money-bill-transfer w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/withdrawals') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Rút tiền</span>
        </a>

        <!-- Escrow -->
        <a href="/admin/wallets/escrow"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/escrow') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-lock w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/escrow') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Escrow</span>
        </a>

        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Hệ thống</div>

        <!-- Report Management -->
        <a href="/admin/reports"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/admin/reports') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-flag w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/admin/reports') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Báo cáo</span>
        </a>

        <!-- Reviews -->
        <a href="/admin/reviews"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/admin/reviews') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-star w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/admin/reviews') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Đánh giá</span>
        </a>

        <!-- Analytics -->
        <a href="/admin/analytics"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/admin/analytics') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-chart-simple w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/admin/analytics') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Phân tích</span>
        </a>

        <!-- Notifications -->
        <a href="/admin/notifications/broadcast"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-1 text-sm font-medium transition-colors <?= str_contains($_SERVER['REQUEST_URI'], '/admin/notifications') ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' ?>">
            <i
                class="fa-solid fa-bullhorn w-5 <?= str_contains($_SERVER['REQUEST_URI'], '/admin/notifications') ? 'text-primary-600' : 'text-gray-400' ?>"></i>
            <span>Thông báo</span>
        </a>

        <!-- Settings -->
        <a href="/admin/settings"
            class="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md mb-5 text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <i class="fa-solid fa-cog w-5 text-gray-400"></i>
            <span>Cài đặt</span>
        </a>
    </nav>

    <!-- Footer Profile -->
    <div class="p-4 border-t border-gray-200">
        <a href="/" class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors group">
            <div
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-gray-300 transition-colors">
                <i class="fa-solid fa-arrow-left text-sm"></i>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Về trang chủ</p>
            </div>
        </a>
    </div>
</aside>