<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website đang bảo trì</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>

<body class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center justify-center">
    <div class="text-center px-6">
        <!-- Icon -->
        <div class="mb-8">
            <i class="fa-solid fa-tools text-7xl text-yellow-500 animate-pulse"></i>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
            Website đang bảo trì
        </h1>

        <!-- Message -->
        <p class="text-lg text-gray-300 max-w-md mx-auto mb-8">
            <?= htmlspecialchars($message ?? 'Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau!') ?>
        </p>

        <!-- Decorative Line -->
        <div class="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-8"></div>

        <!-- Contact Info -->
        <p class="text-gray-400 text-sm">
            Nếu cần hỗ trợ, vui lòng liên hệ:
            <a href="mailto:admin@zoldify.com" class="text-yellow-500 hover:underline">admin@zoldify.com</a>
        </p>
    </div>
</body>

</html>