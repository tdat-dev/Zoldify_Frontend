# 🚀 Hướng Dẫn Cài Đặt Chi Tiết (Setup Guide)

> Tài liệu này dành cho **developer mới** tham gia dự án. Đọc kỹ và làm theo từng bước.

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
2. [Cài đặt môi trường](#-cài-đặt-môi-trường)
3. [Clone và cấu hình project](#-clone-và-cấu-hình-project)
4. [Khởi tạo Database](#-khởi-tạo-database)
5. [Chạy Project](#-chạy-project)
6. [Thiết lập Chat Server](#-thiết-lập-chat-server)
7. [Cấu hình Optional](#-cấu-hình-optional)
8. [Troubleshooting](#-troubleshooting)

---

## 💻 Yêu cầu hệ thống

| Phần mềm     | Version | Bắt buộc | Ghi chú                                         |
| ------------ | ------- | :------: | ----------------------------------------------- |
| **PHP**      | >= 8.0  |    ✅    | Bật extensions: `pdo_mysql`, `curl`, `mbstring` |
| **MySQL**    | >= 8.0  |    ✅    | Hoặc MariaDB 10.5+                              |
| **Composer** | >= 2.0  |    ✅    | Quản lý thư viện PHP                            |
| **Node.js**  | >= 18.0 |    ✅    | Cho Tailwind CSS + Chat Server                  |
| **npm**      | >= 9.0  |    ✅    | Đi kèm Node.js                                  |
| **Redis**    | >= 6.0  |    ❌    | Optional, dùng để cache                         |
| **Git**      | >= 2.0  |    ✅    | Quản lý source code                             |

### 🛠 Môi trường đề xuất

- **Windows**: [Laragon](https://laragon.org/) (đã có PHP, MySQL, Redis sẵn)
- **macOS**: Homebrew + Valet
- **Linux**: apt/yum install

---

## 📦 Cài đặt môi trường

### Option 1: Laragon (Windows - Đề xuất)

1. Tải Laragon Full: https://laragon.org/download/
2. Cài đặt → Khởi động
3. Đảm bảo PHP 8.x và MySQL 8.x đã được chọn trong Menu > PHP/MySQL

### Option 2: Manual Setup

```bash
# Kiểm tra PHP
php -v

# Kiểm tra Composer
composer -V

# Kiểm tra Node.js
node -v
npm -v

# Kiểm tra MySQL
mysql --version
```

---

## 📥 Clone và cấu hình project

### Bước 1: Clone repository

```bash
git clone https://github.com/your-org/UniMarket.git
cd UniMarket
```

### Bước 2: Cài đặt PHP dependencies

```bash
composer install
```

### Bước 3: Cài đặt Node.js dependencies

```bash
npm install
```

### Bước 4: Tạo file .env

```bash
# Copy file mẫu
cp .env.example .env

# Mở và sửa theo môi trường của bạn
```

**Nội dung quan trọng cần sửa trong `.env`:**

```env
# Database - Sửa theo thông tin MySQL của bạn
DB_DATABASE=zoldify
DB_USERNAME=root
DB_PASSWORD=            # Password MySQL (để trống nếu Laragon mặc định)

# App URL
APP_URL=http://localhost:8000    # Hoặc http://zoldify.test nếu dùng Laragon
```

---

## 🗄️ Khởi tạo Database

### Bước 1: Tạo database trống

```sql
-- Mở MySQL terminal hoặc phpMyAdmin
CREATE DATABASE zoldify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Với Laragon:**

- Right-click Laragon → MySQL → HeidiSQL
- Click chuột phải → Create new → Database
- Tên: `zoldify`

### Bước 2: Chạy migrations

```bash
php database/migrate.php
```

**Kết quả mong đợi:**

```
[MIGRATE] Running: 001_create_base_tables.sql
[MIGRATE] Running: 002_create_products_table.sql
...
[MIGRATE] All migrations completed!
```

### Bước 3: Xác nhận

Kiểm tra database đã có các bảng:

- `users`
- `products`
- `categories`
- `orders`
- `messages`
- ...

---

## ▶️ Chạy Project

### Option 1: PHP Built-in Server

```bash
# Terminal 1: Chạy PHP server
php -S localhost:8000 -t public

# Terminal 2: Chạy Tailwind (watch mode)
npm run dev
```

Truy cập: http://localhost:8000

### Option 2: Laragon

1. Đặt folder project trong `C:\laragon\www\`
2. Start All Services
3. Truy cập: http://zoldify.test (tự động tạo virtual host)

---

## 💬 Thiết lập Chat Server

Chat Server chạy riêng biệt bằng Node.js + Socket.IO.

### Bước 1: Cấu hình

```bash
cd chat-server
cp .env.example .env
```

Sửa file `.env`:

```env
SOCKET_PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=             # Password MySQL
DB_NAME=zoldify      # Giống database PHP
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy Chat Server

```bash
# Development mode (có auto-reload)
npm run dev

# Production mode
npm start
```

**Kết quả mong đợi:**

```
========================================
🚀 Zoldify Chat Server is running!
📡 Port: 3001
🌐 CORS: http://localhost:8000
📦 Redis: Disabled (standalone)
========================================
```

### Bước 4: Test

1. Mở http://localhost:8000
2. Đăng nhập 2 tài khoản trên 2 tab khác nhau
3. Mở trang Chat và gửi tin nhắn
4. Tin nhắn phải hiện real-time!

---

## ⚙️ Cấu hình Optional

### 1. Redis Cache (Tăng tốc độ)

**Laragon:**

- Menu → Redis → Start

**Sửa `.env`:**

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 2. Google OAuth (Đăng nhập Google)

1. Vào https://console.cloud.google.com
2. Tạo Project → APIs & Services → Credentials
3. Create OAuth Client ID (Web application)
4. Thêm Authorized redirect URIs:

   - `http://localhost:8000/auth/google/callback`
   - `https://zoldify.com/auth/google/callback`

5. Copy Client ID và Secret vào `.env`:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 3. Email SMTP (Gửi mail xác thực)

**Với Gmail:**

1. Bật 2-Factor Authentication
2. Tạo App Password: Google Account → Security → App passwords
3. Sửa `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx   # App Password (16 ký tự)
```

---

## 🐛 Troubleshooting

### Lỗi: "Connection refused" khi kết nối MySQL

**Nguyên nhân:** MySQL chưa chạy hoặc sai thông tin kết nối.

**Giải pháp:**

```bash
# Kiểm tra MySQL đang chạy
# Windows (Laragon): Đảm bảo đã Start All

# Thử kết nối thủ công
mysql -u root -p
```

---

### Lỗi: "Class not found" hoặc "Autoload error"

**Nguyên nhân:** Chưa chạy `composer install`.

**Giải pháp:**

```bash
composer install
composer dump-autoload
```

---

### Lỗi: Chat không hoạt động real-time

**Nguyên nhân:** Chat Server chưa chạy hoặc sai CORS.

**Giải pháp:**

1. Kiểm tra Chat Server đang chạy: `cd chat-server && npm run dev`
2. Kiểm tra Console browser (F12) có lỗi gì không
3. Đảm bảo `CORS_ORIGIN` trong `chat-server/.env` có URL của PHP app

---

### Lỗi: "Port already in use"

**Nguyên nhân:** Port 8000 hoặc 3001 đang bị chiếm.

**Giải pháp:**

```bash
# Windows - Tìm process chiếm port
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

---

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề không giải quyết được:

1. Tạo Issue trên GitHub
2. Liên hệ Team Lead
3. Xem thêm docs trong folder `/docs`

---

<p align="center">
  <strong>Happy Coding! 🚀</strong><br>
  <sub>Zoldify Team - 2026</sub>
</p>
