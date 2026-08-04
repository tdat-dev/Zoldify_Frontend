# 🔄 Hướng Dẫn Chuyển Đổi Role System

## 📋 Tổng Quan

Dự án đã chuyển đổi từ **"Marketplace cho sinh viên"** sang **"Marketplace tổng quát cho mọi người"**.

### Thay đổi chính:

**Trước:**

- Role: `student`, `admin`
- Đối tượng: Sinh viên
- Email: `@student.edu.vn`

**Sau:**

- Role: `buyer`, `seller`, `admin`, `moderator`
- Đối tượng: Mọi người (tất cả độ tuổi)
- Email: `@gmail.com` (tổng quát)

---

## 🎯 Hệ Thống Role Mới

| Role          | Mô tả           | Quyền hạn                         |
| ------------- | --------------- | --------------------------------- |
| **buyer**     | Người mua       | Chỉ mua hàng, không được đăng bán |
| **seller**    | Người bán       | Vừa mua vừa bán, đăng sản phẩm    |
| **admin**     | Quản trị viên   | Toàn quyền quản lý hệ thống       |
| **moderator** | Kiểm duyệt viên | Kiểm tra sản phẩm, xử lý báo cáo  |

---

## 🚀 Cách Chạy Migration

### Option 1: Chạy từng migration (Khuyến nghị)

```bash
# Bước 1: Chạy migration cập nhật role
php database/migrate.php

# Migration 017 sẽ tự động:
# - Thêm các role mới
# - Chuyển đổi student -> seller
# - Giữ nguyên admin -> admin
```

### Option 2: Reset toàn bộ database (Nếu muốn bắt đầu lại)

```bash
# Bước 1: Drop database cũ
mysql -u root -p
DROP DATABASE IF EXISTS Zoldify;
exit

# Bước 2: Import lại db.sql mới
mysql -u root -p < db.sql
```

---

## 📊 Dữ Liệu Mẫu Mới

### Admin & Moderator

```
Email: admin@zoldify.vn
Password: 123456
Role: admin

Email: moderator@zoldify.vn
Password: 123456
Role: moderator
```

### Sellers (Người bán đồ cũ)

```
Email: hoa.seller@gmail.com
Password: 123456
Role: seller

Email: minh.shop@gmail.com
Password: 123456
Role: seller

Email: mai.vintage@gmail.com
Password: 123456
Role: seller
```

### Buyers (Người mua)

```
Email: lan.buyer@gmail.com
Password: 123456
Role: buyer

Email: tung.customer@gmail.com
Password: 123456
Role: buyer
```

---

## 🔧 Cập Nhật Code (Nếu Cần)

### 1. Kiểm tra role trong Controller

**Trước:**

```php
if ($_SESSION['user']['role'] === 'student') {
    // Cho phép đăng bán
}
```

**Sau:**

```php
if ($_SESSION['user']['role'] === 'seller' || $_SESSION['user']['role'] === 'admin') {
    // Cho phép đăng bán
}
```

### 2. Cập nhật form đăng ký

Nếu có dropdown chọn role, cập nhật options:

```html
<select name="role">
  <option value="buyer">Người mua</option>
  <option value="seller">Người bán</option>
</select>
```

---

## ✅ Checklist Sau Khi Migration

- [ ] Chạy migration 017 và 018 thành công
- [ ] Kiểm tra login với các user mới
- [ ] Test chức năng đăng sản phẩm (chỉ seller được phép)
- [ ] Kiểm tra admin panel
- [ ] Cập nhật giao diện nếu còn chữ "sinh viên"

---

## 🎨 Cập Nhật Giao Diện (Tùy Chọn)

### Các chỗ cần đổi từ "sinh viên" sang "người dùng":

1. **Header/Footer**: Đổi slogan
2. **Trang chủ**: Cập nhật mô tả
3. **Form đăng ký**: Bỏ yêu cầu email @student.edu.vn
4. **Về chúng tôi**: Cập nhật mission statement

---

## 📝 Ghi Chú

- Migration 017 sẽ **tự động chuyển đổi** dữ liệu cũ
- Tất cả `student` cũ sẽ thành `seller` (vì trong context cũ, sinh viên vừa mua vừa bán)
- `admin` giữ nguyên
- Dữ liệu sản phẩm, đơn hàng, tin nhắn **không bị mất**

---

**Ngày cập nhật:** 2025-12-31  
**Phiên bản:** 2.0 - Marketplace Tổng Quát
