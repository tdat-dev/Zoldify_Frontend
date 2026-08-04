<?php
/**
 * UNIMARKET MIGRATION MANAGER PRO
 * 
 * Tool quản lý Database Migration chuyên nghiệp.
 * Tính năng: Batch Run, SQL Preview, DB Stats, Logs.
 */

// =====================================================
// 1. CẤU HÌNH & BẢO MẬT
// =====================================================
define('SECRET_KEY', 'tdatdev@123'); // <--- ĐỔI MẬT KHẨU Ở ĐÂY
define('MIGRATIONS_DIR', __DIR__ . '/../database/migrations/');

session_start();
$pdo = null;
$dbStats = [];
$logs = [];
$fileContent = '';
$previewFile = '';

// Kiểm tra đăng nhập
$isAuthenticated = isset($_SESSION['migrate_auth']) && $_SESSION['migrate_auth'] === true;

// Xử lý Login/Logout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    if ($_POST['password'] === SECRET_KEY) {
        $_SESSION['migrate_auth'] = true;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $logs[] = ['type' => 'error', 'msg' => 'Mật khẩu sai!'];
    }
}
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// =====================================================
// 2. LOGIC XỬ LÝ DATABASE
// =====================================================
if ($isAuthenticated) {
    try {
        // Kết nối DB
        $config = require __DIR__ . '/../config/database.php';
        $dsn = "mysql:host={$config['host']};dbname={$config['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        // Lấy thông tin các bảng (DB Stats)
        $stmt = $pdo->query("SHOW TABLE STATUS");
        $dbStats = $stmt->fetchAll();

        // Xử lý Run Migrations
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'run') {
            $files = $_POST['files'] ?? [];
            if (empty($files)) {
                $logs[] = ['type' => 'warning', 'msg' => 'Chưa chọn file nào!'];
            } else {
                foreach ($files as $file) {
                    $filePath = MIGRATIONS_DIR . $file;
                    $extension = pathinfo($file, PATHINFO_EXTENSION);

                    if (file_exists($filePath)) {
                        try {
                            if ($extension === 'sql') {
                                // Chạy file SQL
                                $sql = file_get_contents($filePath);
                                $pdo->exec($sql);
                            } elseif ($extension === 'php') {
                                // Chạy file PHP
                                require_once $filePath;
                                if (function_exists('run')) {
                                    run($pdo);
                                }
                            }
                            $logs[] = ['type' => 'success', 'msg' => "✅ {$file}: Chạy thành công!"];
                        } catch (Exception $e) {
                            $logs[] = ['type' => 'error', 'msg' => "❌ {$file}: " . $e->getMessage()];
                        }
                    }
                }
                // Refresh stats
                $stmt = $pdo->query("SHOW TABLE STATUS");
                $dbStats = $stmt->fetchAll();
            }
        }

        // Xử lý xem file (Preview)
        if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['preview'])) {
            $f = $_GET['preview'];
            $fp = MIGRATIONS_DIR . $f;
            if (file_exists($fp)) {
                $fileContent = file_get_contents($fp);
                $previewFile = $f;
            }
        }

    } catch (PDOException $e) {
        $logs[] = ['type' => 'error', 'msg' => 'Lỗi kết nối DB: ' . $e->getMessage()];
    }
}

// =====================================================
// 3. LẤY DANH SÁCH FILE
// =====================================================
$migrations = [];
if ($isAuthenticated && is_dir(MIGRATIONS_DIR)) {
    $files = scandir(MIGRATIONS_DIR);
    foreach ($files as $file) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        // Hỗ trợ cả file .sql và .php
        if ($ext === 'sql' || $ext === 'php') {
            $migrations[] = $file;
        }
    }
    sort($migrations);
}
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoldify Migration Pro</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
        }

        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }

        .glass {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
        }
    </style>
</head>

<body class="bg-slate-100 text-slate-800 min-h-screen">

    <!-- LOGIN SCREEN -->
    <?php if (!$isAuthenticated): ?>
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                <div class="text-center mb-6">
                    <div
                        class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <i class="fa-solid fa-database text-white text-2xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-slate-800">Zoldify Migration</h1>
                    <p class="text-slate-500 text-sm">Dashboard quản trị Database</p>
                </div>

                <?php foreach ($logs as $log): ?>
                    <div
                        class="mb-4 p-3 rounded-lg text-sm font-medium <?= $log['type'] === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600' ?>">
                        <?= htmlspecialchars($log['msg']) ?>
                    </div>
                <?php endforeach; ?>

                <form method="POST">
                    <input type="hidden" name="action" value="login">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Mã khóa bảo mật</label>
                        <div class="relative">
                            <span class="absolute left-3 top-3 text-slate-400"><i class="fa-solid fa-key"></i></span>
                            <input type="password" name="password" required autofocus
                                class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                        </div>
                    </div>
                    <button type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/30">
                        Truy cập Dashboard
                    </button>
                </form>
            </div>
        </div>

        <!-- MAIN DASHBOARD -->
    <?php else: ?>
        <div class="flex flex-col h-screen" x-data="{ showPreview: <?= $fileContent ? 'true' : 'false' ?> }">

            <!-- HEADER -->
            <header
                class="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                        <i class="fa-solid fa-bolt text-sm"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-slate-800 leading-tight">Migration Manager <span
                                class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full ml-1">PRO</span></h1>
                        <div class="flex items-center gap-2 text-xs text-slate-500">
                            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Connected: <?= htmlspecialchars($config['db_name'] ?? 'Unknown') ?>
                        </div>
                    </div>
                </div>
                <a href="?logout=1" class="text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
                    <i class="fa-solid fa-right-from-bracket mr-1"></i> Thoát
                </a>
            </header>

            <div class="flex-1 flex overflow-hidden">

                <!-- LEFT SIDEBAR: MIGRATION LIST -->
                <div class="w-[400px] bg-white border-r border-slate-200 flex flex-col z-10">
                    <div class="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tệp tin Migration</h2>
                        <div class="flex gap-2">
                            <button onclick="document.getElementById('migForm').submit()"
                                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded shadow-sm transition-colors">
                                <i class="fa-solid fa-play mr-1"></i> CHẠY BATCH
                            </button>
                            <button type="button"
                                @click="$el.closest('.w-\[400px\]').querySelectorAll('input[type=checkbox]').forEach(c => c.checked = !c.checked)"
                                class="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded transition-colors"
                                title="Chọn tất cả">
                                <i class="fa-solid fa-check-double"></i>
                            </button>
                        </div>
                    </div>

                    <form id="migForm" method="POST" class="flex-1 overflow-y-auto p-2 space-y-1">
                        <input type="hidden" name="action" value="run">
                        <?php if (empty($migrations)): ?>
                            <div class="text-center py-8 text-slate-400 text-sm">Không có file nào.</div>
                        <?php else: ?>
                            <?php foreach ($migrations as $file): ?>
                                <div
                                    class="group flex items-center p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <label class="flex items-center flex-1 cursor-pointer select-none">
                                        <input type="checkbox" name="files[]" value="<?= htmlspecialchars($file) ?>"
                                            class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500">
                                        <div class="ml-3">
                                            <div class="text-sm font-medium text-slate-700 font-mono flex items-center gap-2">
                                                <?= htmlspecialchars($file) ?>
                                                <?php $ext = pathinfo($file, PATHINFO_EXTENSION); ?>
                                                <span
                                                    class="text-[9px] px-1.5 py-0.5 rounded font-bold <?= $ext === 'php' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' ?>">
                                                    <?= strtoupper($ext) ?>
                                                </span>
                                            </div>
                                            <div class="text-[10px] text-slate-400">
                                                <?= date("d/m/Y H:i", filemtime(MIGRATIONS_DIR . $file)) ?>
                                            </div>
                                        </div>
                                    </label>
                                    <a href="?preview=<?= urlencode($file) ?>"
                                        class="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Xem code">
                                        <i class="fa-regular fa-eye"></i>
                                    </a>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </form>
                </div>

                <!-- RIGHT CONTENT area -->
                <div class="flex-1 bg-slate-50 overflow-y-auto p-6">

                    <!-- ALERTS -->
                    <?php if (!empty($logs)): ?>
                        <div class="mb-6 space-y-2">
                            <?php foreach ($logs as $log): ?>
                                <div
                                    class="p-4 rounded-lg shadow-sm border border-l-4 flex items-start gap-3 
                                <?= $log['type'] === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-white border-green-500 text-green-700' ?>">
                                    <i
                                        class="fa-solid <?= $log['type'] === 'error' ? 'fa-circle-xmark mt-1' : 'fa-circle-check mt-1' ?>"></i>
                                    <div class="text-sm font-medium"><?= $log['msg'] ?></div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <!-- DB STATUS GRID -->
                    <div class="mb-6">
                        <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-server text-indigo-500"></i> Trạng thái Database
                        </h2>

                        <?php if (empty($dbStats)): ?>
                            <div
                                class="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                                Chưa có bảng nào trong Database. Hãy chạy Migration!
                            </div>
                        <?php else: ?>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <?php foreach ($dbStats as $table): ?>
                                    <div
                                        class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start mb-2">
                                            <h3 class="font-bold text-slate-700"><?= $table['Name'] ?></h3>
                                            <span
                                                class="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500"><?= $table['Engine'] ?></span>
                                        </div>
                                        <div class="flex items-end justify-between">
                                            <div class="text-3xl font-bold text-indigo-600"><?= number_format($table['Rows']) ?>
                                            </div>
                                            <div class="text-xs text-slate-500 font-medium">dòng dữ liệu</div>
                                        </div>
                                        <div class="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div class="bg-indigo-500 h-full rounded-full"
                                                style="width: min(100%, <?= ($table['Rows'] > 0 ? '100' : '0') ?>%)"></div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                </div>
            </div>

            <!-- PREVIEW MODAL -->
            <?php if ($fileContent): ?>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                    x-show="showPreview" x-transition>
                    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                        @click.away="window.location.href='?'">
                        <div class="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 class="font-bold text-slate-700 flex items-center gap-2">
                                <i class="fa-regular fa-file-code text-blue-500"></i>
                                <?= htmlspecialchars($previewFile) ?>
                            </h3>
                            <a href="?" class="text-slate-400 hover:text-slate-600 transition-colors">
                                <i class="fa-solid fa-xmark text-xl"></i>
                            </a>
                        </div>
                        <div class="flex-1 overflow-auto bg-slate-900 text-slate-200 p-6 font-mono text-sm leading-relaxed">
                            <pre><?= htmlspecialchars($fileContent) ?></pre>
                        </div>
                        <div class="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                            <a href="?"
                                class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Đóng</a>
                            <form method="POST">
                                <input type="hidden" name="action" value="run">
                                <input type="hidden" name="files[]" value="<?= htmlspecialchars($previewFile) ?>">
                                <button type="submit"
                                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all">
                                    Chạy file này ngay
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

        </div>
    <?php endif; ?>

</body>

</html>