<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tiêu đề động, lấy từ biến $title, nếu không có thì dùng mặc định -->
    <title>
        <?= $title ?? 'Zoldify - Mua sắm đồ cũ' ?>
    </title>

    <!-- 1. KHU VỰC FAVICON (Dùng chung cho cả dự án) -->
    <link rel="icon" href="/images/icons/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png" />
    <link rel="manifest" href="/images/site.webmanifest" />
    <meta name="theme-color" content="#2C67C8" />

    <!-- 2. CSS & FONTS (Dùng riêng cho Auth) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        body {
            font-family: 'Roboto', sans-serif;
        }

        .no-drag {
            -webkit-user-drag: none;
            user-drag: none;
            -webkit-user-select: none;
            user-select: none;
            pointer-events: none;
        }
    </style>
</head>

<body class="flex flex-col min-h-screen">

    <!-- Header dùng chung -->
    <?php include __DIR__ . '/../partials/header.php'; ?>

    <!-- Wrapper màu xanh đặc trưng của trang Auth -->
    <div class="bg-[#4e89ff] flex-grow flex items-center justify-center py-10">
        <!-- CHỖ NÀY LÀ ĐỂ ĐỔ NỘI DUNG RIÊNG CỦA TỪNG TRANG VÀO -->
        <!-- Biến $content chứa HTML của trang con -->
        <?= $content ?>
    </div>

    <!-- Footer dùng chung -->
    <?php include __DIR__ . '/../partials/footer.php'; ?>

    <!-- Nơi chứa Javascript riêng của từng trang (nếu có) -->
    <?= $scripts ?? '' ?>
</body>

</html>