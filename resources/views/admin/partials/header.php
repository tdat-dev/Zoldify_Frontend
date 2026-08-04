<header
    class="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 sticky top-0 z-10">
    <!-- Left: Breadcrumb / Mobile Toggle -->
    <div class="flex items-center gap-4">
        <button id="mobile-menu-toggle" class="lg:hidden text-gray-500 hover:text-gray-700 transition-colors">
            <i class="fa-solid fa-bars text-xl"></i>
        </button>
        <div class="flex items-center gap-2 text-sm text-gray-500">
            <i class="fa-solid fa-home text-gray-400"></i>
            <span class="text-gray-300">/</span>
            <span class="text-gray-700 font-medium">
                <?= $title ?? 'Dashboard' ?>
            </span>
        </div>
    </div>

    <!-- Right: User menu & Search -->
    <div class="flex items-center gap-6">
        <!-- Search -->
        <div class="hidden md:flex relative group">
            <input type="text" placeholder="Tìm kiếm..."
                class="bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all w-64">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <!-- Notifications -->
        <button class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <div class="relative">
                <i class="fa-solid fa-bell text-lg"></i>
                <span class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </div>
        </button>

        <!-- User Dropdown -->
        <div class="relative group" id="user-dropdown">
            <button class="flex items-center gap-3 focus:outline-none">
                <div class="text-right hidden sm:block">
                    <div class="text-sm font-medium text-gray-700">
                        <?= $_SESSION['user']['full_name'] ?? 'Admin' ?>
                    </div>
                    <div class="text-xs text-gray-500">Administrator</div>
                </div>
                <div
                    class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                    <?= strtoupper(substr($_SESSION['user']['full_name'] ?? 'A', 0, 1)) ?>
                </div>
            </button>

            <!-- Dropdown Menu -->
            <div
                class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                <div class="py-1">
                    <a href="/admin/profile"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i class="fa-solid fa-user w-4 text-gray-400"></i> Hồ sơ
                    </a>
                    <a href="/admin/settings"
                        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <i class="fa-solid fa-cog w-4 text-gray-400"></i> Cài đặt
                    </a>
                    <div class="border-t border-gray-100 my-1"></div>
                    <form action="/logout" method="POST">
                        <button type="submit"
                            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                            <i class="fa-solid fa-sign-out-alt w-4"></i> Đăng xuất
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</header>

<script>
    // Mobile menu toggle
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
</script>