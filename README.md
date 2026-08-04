<p align="center">
  <img src="public/images/logouni.png" alt="Zoldify Logo" width="150">
</p>

<p align="center">
  <strong>Nền Tảng Thương Mại Điện Tử</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/php-8.0+-777BB4.svg" alt="PHP">
  <img src="https://img.shields.io/badge/mysql-8.0+-4479A1.svg" alt="MySQL">
  <img src="https://img.shields.io/badge/tailwind-3.x-38B2AC.svg" alt="Tailwind">
</p>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Database & Migrations](#-database--migrations)
- [Quy trình làm việc](#-quy-trình-làm-việc)
- [Thành viên nhóm](#-thành-viên-nhóm)
- [Tiến độ dự án](#-tiến-độ-dự-án)

---

## 🎯 Giới thiệu

**Zoldify** là nền tảng mua bán đồ cũ dành cho sinh viên - một dự án môn học tâm huyết giúp kết nối sinh viên có nhu cầu mua bán, trao đổi đồ dùng học tập, giáo trình và thiết bị cũ.

Với khẩu hiệu _"Đồ Cũ, Vẫn CHẤT"_, chúng tôi mong muốn tạo ra một môi trường giao dịch an toàn, tiết kiệm và thân thiện.

### Tính năng chính

| Tính năng             | Mô tả                                 | Trạng thái |
| --------------------- | ------------------------------------- | :--------: |
| **Đăng ký/Đăng nhập** | Xác thực, quản lý profile             |     ✅     |
| **Sản phẩm**          | Đăng bán, quản lý, upload ảnh         |     ✅     |
| **Tìm kiếm**          | Tìm theo tên, danh mục, giá           |     ✅     |
| **Gợi ý thông minh**  | Gợi ý từ khóa, sản phẩm liên quan     |     ✅     |
| **Giỏ hàng**          | Thêm vào giỏ, cập nhật số lượng       |     ✅     |
| **Thanh toán**        | Quy trình đặt hàng (Checkout)         |     🔄     |
| **Admin Dashboard**   | Quản lý người dùng, sản phẩm (cơ bản) |     ⏳     |

---

## 💻 Yêu cầu hệ thống

Để chạy dự án mượt mà, bạn cần môi trường sau:

| Thành phần   | Yêu cầu | Ghi chú                      |
| ------------ | ------- | ---------------------------- |
| **PHP**      | >= 8.0  | Bật extension `pdo_mysql`    |
| **MySQL**    | >= 8.0  | Hỗ trợ JSON, UTF8mb4         |
| **Composer** | >= 2.0  | Quản lý thư viện PHP         |
| **Node.js**  | >= 16.0 | Để build Tailwind CSS        |
| **Laragon**  | Đề xuất | Môi trường dev tiện lợi nhất |

---

## 🚀 Cài đặt nhanh

Hãy làm theo các bước sau để khởi chạy dự án trên máy local:

### 1. Clone project

```bash
git clone <repository-url>
cd UniMarket
```

### 2. Cài dependencies

Cài đặt các gói thư viện cần thiết cho PHP và JS:

```bash
composer install
npm install
```

### 3. Cấu hình database

Copy file cấu hình mẫu và cập nhật thông tin kết nối CSDL của bạn:

```bash
cp .env.example .env
```

Mở file `.env` và chỉnh sửa các thông số `DB_` cho phù hợp (ví dụ dùng root/rỗng mặc định của Laragon):

```env
DB_HOST=127.0.0.1
DB_DATABASE=unimarket
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Khởi tạo Database

Bạn cần tạo database trống trước, sau đó chạy script migration để tạo bảng và dữ liệu mẫu:

```bash
# Tạo database (nếu chưa có)
# CREATE DATABASE unimarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Chạy migrations
php database/migrate.php
```

> **Lưu ý:** Script `migrate.php` sẽ tự động chạy tất cả các file SQL và PHP trong thư mục `database/migrations` chưa được thực thi.

### 5. Build Assets

Biên dịch Tailwind CSS:

```bash
npm run dev    # Chế độ development (tự động build khi sửa file)
# hoặc
npm run build  # Build bản production (tối ưu hóa)
```

### 6. Khởi chạy

- **Nếu dùng Laragon**: Chỉ cần Start All, truy cập `http://unimarket.test`.
- **Nếu dùng PHP Server**:
  ```bash
  php -S localhost:8000 -t public
  ```
  Truy cập `http://localhost:8000`.

---

## 📁 Cấu trúc dự án

Cấu trúc thư mục được tổ chức theo mô hình MVC (gần giống Laravel nhưng đơn giản hơn):

```
UniMarket/
│
├── app/                         # CORE LOGIC
│   ├── Controllers/             # Nhận request, xử lý logic, trả về view
│   ├── Core/                    # Framework base (Router, Database, App)
│   ├── Models/                  # Tương tác dữ liệu (Active Record pattern)
│   └── Services/                # Xử lý nghiệp vụ phức tạp
│
├── config/                      # CẤU HÌNH
│   ├── app.php                  # Config chung
│   └── database.php             # Config DB
│
├── database/                    # MIGRATIONS & SEEDS
│   ├── migrate.php              # Script chạy migration
│   └── migrations/              # Danh sách file thay đổi CSDL theo thời gian
│
├── public/                      # WEB ROOT
│   ├── index.php                # Entry point duy nhất
│   ├── css/                     # File CSS đầu ra
│   ├── images/                  # Ảnh tĩnh
│   └── uploads/                 # Ảnh user upload
│
├── resources/                   # FRONTEND SOURCE
│   ├── css/                     # Tailwind source
│   ├── lang/                    # Ngôn ngữ
│   └── views/                   # Các file giao diện (.php)
│
└── routes/                      # ĐỊNH TUYẾN
    └── web.php                  # Khai báo URL và Controller tương ứng
```

---

## 🗄️ Database & Migrations

Hệ thống sử dụng cơ chế migration tự viết (`app/Core/Database.php` và `database/migrate.php`) để quản lý version database.

### Danh sách Migrations hiện tại

| File                                     | Mô tả                                         |
| :--------------------------------------- | :-------------------------------------------- |
| `001_create_base_tables.sql`             | Tạo bảng cơ sở: users, categories             |
| `002_create_products_table.sql`          | Tạo bảng products                             |
| `003_create_orders_tables.sql`           | Tạo bảng orders, order_details                |
| `004_create_social_tables.sql`           | Tạo bảng messages, reviews, favorites         |
| `005_create_system_tables.sql`           | Tạo bảng interactions, notifications, reports |
| `006_create_search_keywords.sql`         | Tạo bảng search_keywords (tracking tìm kiếm)  |
| `007_add_quantity_if_missing.sql`        | Bổ sung cột quantity cho products             |
| `008_seed_categories_data.sql`           | Thêm dữ liệu danh mục mẫu                     |
| `009_correct_category_images.sql`        | Sửa đường dẫn ảnh danh mục                    |
| `010_update_renamed_category_images.sql` | Cập nhật lại tên ảnh danh mục                 |
| `011_fix_password_hash.sql`              | Sửa logic hash password                       |
| `012_reset_users_with_correct_hash.sql`  | Reset user mẫu với pass mới                   |
| `013_fix_password_final.sql`             | Fix lỗi password cuối cùng                    |
| `014_seed_admin.php`                     | Script PHP tạo tài khoản Admin mặc định       |
| `015_create_carts_table.sql`             | Tạo bảng carts (Giỏ hàng)                     |

### Cách tạo Migration mới

Để thay đổi Database, **ĐỪNG** sửa file SQL cũ. Hãy tạo file mới theo thứ tự tăng dần:

1. Đặt tên file logic: `NNN_ten_thay_doi.sql` (hoặc `.php`)
2. Viết câu lệnh SQL vào file.
3. Chạy lệnh `php database/migrate.php`.

### ⚡ QUAN TRỌNG: Sau khi Pull Code

> **⚠️ Mỗi lần pull code mới, BẮT BUỘC chạy:**
>
> ```bash
> php database/migrate.php
> ```
>
> Điều này đảm bảo database của bạn được cập nhật với các thay đổi mới nhất.

**Xem workflow chi tiết:** Chạy lệnh `/db` trong chat với AI hoặc xem file `.agent/workflows/db.md`

---

## 📚 Tài liệu chi tiết (Documentation)

Ngoài README chính, dự án còn có các tài liệu hướng dẫn chi tiết cho từng module:

### 🚀 Bắt đầu (Getting Started)

- [**Hướng dẫn Cài đặt Chi tiết**](docs/SETUP.md): Step-by-step setup cho developer mới, bao gồm cài đặt môi trường, database, chat server.
- [**Hướng dẫn Deployment**](docs/DEPLOYMENT.md): Deploy lên Production/Staging, CI/CD, SSL, monitoring.
- [**Template Credentials**](docs/CREDENTIALS.template.md): Mẫu lưu trữ thông tin truy cập cho team.

### 🔐 Google OAuth (Đăng nhập Google)

- [**Hướng dẫn tích hợp Google Login**](docs/GOOGLE_OAUTH_GUIDE.md): Chi tiết cách tạo App trên Google Console và cấu hình code.
- [**Checklist Debug lỗi OAuth**](docs/GOOGLE_OAUTH_CHECKLIST.md): Các bước kiểm tra khi gặp lỗi "Not Found" hoặc "Mismatch URI".

### ⚡ Performance & Caching (Redis)

- [**Cài đặt Redis**](docs/REDIS_SETUP.md): Hướng dẫn cài Redis trên Windows/Laragon và tích hợp vào dự án.
- [**Redis Advanced**](docs/REDIS_ADVANCED.md): Chiến lược caching nâng cao cho Search và Product data.

### 👤 Quản lý Vai trò (Roles)

- [**Role Migration Guide**](docs/ROLE_MIGRATION_GUIDE.md): Hướng dẫn migration và phân quyền user.
- [**Role Changes Summary**](docs/ROLE_CHANGES_SUMMARY.md): Tổng hợp các thay đổi về logic phân quyền.

### 🛠 Troubleshooting (Sửa lỗi)

- [**Fix Lỗi Checkout**](docs/BUG_FIX_CHECKOUT_TYPEERROR.md): Hướng dẫn fix lỗi TypeError khi thanh toán.

### 🧪 Testing

- [**Hướng dẫn Testing**](docs/TESTING.md): Cách chạy Jest (JS) và PHPUnit (PHP) tests, viết tests mới, coverage.

---

## 🔄 Quy trình làm việc

### Git Flow

Chúng ta tuân thủ quy trình Git Flow đơn giản:

```
main (bản ổn định)
  ↑
develop (bản đang code) ──── feature/chuc-nang-moi
                             feature/fix-loi-abc
```

### Commit Message chuẩn

Vui lòng viết commit message bằng tiếng Anh theo Convention:

- `feat(scope)`: tính năng mới (vd: `feat(auth): add login page`)
- `fix(scope)`: sửa lỗi (vd: `fix(cart): update total calculation`)
- `docs(...)`: tài liệu
- `style(...)`: format, CSS
- `refactor(...)`: viết lại code cho gọn, không đổi logic

---

## 👥 Thành viên nhóm

|  #  | Họ tên |  MSSV  | Vai trò       | Nhiệm vụ chính                             |
| :-: | ------ | :----: | ------------- | ------------------------------------------ |
|  1  | [Tên]  | [MSSV] | **Team Lead** | Kiến trúc hệ thống, Database, Core, Review |
|  2  | [Tên]  | [MSSV] | Frontend      | Giao diện, UX/UI, Responsive               |
|  3  | [Tên]  | [MSSV] | Dev           | Chức năng Search, Cart, Testing            |

---

## 📅 Tiến độ dự án

| Giai đoạn | Nội dung                        |   Trạng thái   |
| :-------: | ------------------------------- | :------------: |
|  **P1**   | Phân tích, Database, Setup Base |  ✅ Completed  |
|  **P2**   | Auth, Homepage, Product Listing |  ✅ Completed  |
|  **P3**   | Search, Filter, Product Detail  |  ✅ Completed  |
|  **P4**   | Cart, Checkout                  | 🔄 In Progress |
|  **P5**   | Admin, Report, Polish           |   ⏳ Pending   |

---

<p align="center">
  <strong>Zoldify Team</strong><br>
  <sub>📅 Cập nhật lần cuối: 30/12/2025</sub>
</p>
