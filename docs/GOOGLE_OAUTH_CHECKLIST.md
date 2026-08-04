# ✅ Google OAuth Login - Checklist Hoàn Thành

## 📦 Đã Cài Đặt

- ✅ Thêm `google/apiclient` vào `composer.json`
- ✅ Chạy `composer update` (đang xử lý...)

## 📁 Files Đã Tạo

### 1. Configuration

- ✅ `config/google.php` - Cấu hình Google OAuth credentials

### 2. Service Layer

- ✅ `app/Services/GoogleOAuthService.php` - Service xử lý Google API
  - `getAuthUrl()` - Lấy URL redirect đến Google
  - `getUserInfo($code)` - Lấy thông tin user từ Google
  - `isConfigured()` - Kiểm tra cấu hình

### 3. Controller

- ✅ `app/Controllers/GoogleAuthController.php` - Controller xử lý OAuth flow
  - `redirectToGoogle()` - Redirect user đến Google login
  - `handleGoogleCallback()` - Xử lý callback từ Google
  - `registerGoogleUser()` - Tạo user mới từ Google

### 4. Model Updates

- ✅ `app/Models/User.php` - Thêm method `findByEmail()`

### 5. Routes

- ✅ `routes/web.php` - Thêm 2 routes:
  - `GET /auth/google` → Redirect đến Google
  - `GET /auth/google/callback` → Xử lý callback

### 6. Views

- ✅ `resources/views/auth/login.php` - Link nút Google
- ✅ `resources/views/auth/register.php` - Link nút Google

### 7. Documentation

- ✅ `docs/GOOGLE_OAUTH_GUIDE.md` - Hướng dẫn chi tiết

---

## 🎯 Bước Tiếp Theo - BẠN CẦN LÀM

### Bước 1: Tạo Google OAuth Credentials (10 phút)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới: `Zoldify`
3. Bật Google+ API
4. Tạo OAuth Consent Screen
5. Tạo OAuth 2.0 Client ID
6. **LƯU LẠI**:
   - Client ID
   - Client Secret

### Bước 2: Cập Nhật File `.env` (1 phút)

Mở file `.env` và thêm/cập nhật:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback
```

**Lưu ý:**

- Nếu dùng Laragon: `http://unimarket.test/auth/google/callback`
- Phải khớp với Authorized redirect URIs trong Google Console

### Bước 3: Test (2 phút)

1. Vào `http://localhost/login`
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google
4. Cho phép ứng dụng
5. Kiểm tra đăng nhập thành công

---

## 🔍 Troubleshooting

### Lỗi: "Class 'Google_Client' not found"

**Nguyên nhân:** Composer chưa cài xong

**Giải pháp:**

```bash
composer update
# hoặc
composer require google/apiclient
```

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân:** URL callback không khớp

**Giải pháp:**

1. Kiểm tra `.env` → `GOOGLE_REDIRECT_URI`
2. Vào Google Console → Credentials → Edit
3. Thêm chính xác URL vào "Authorized redirect URIs"

### Lỗi: "invalid_client"

**Nguyên nhân:** Client ID/Secret sai

**Giải pháp:**

1. Kiểm tra lại `.env`
2. Copy lại từ Google Console
3. Không có khoảng trắng thừa

---

## 📊 Luồng Hoạt Động

```
User click "Đăng nhập Google"
    ↓
/auth/google
    ↓
Redirect đến Google Login
    ↓
User chọn tài khoản & cho phép
    ↓
Google redirect về /auth/google/callback?code=...
    ↓
Lấy thông tin user từ Google
    ↓
Kiểm tra email đã tồn tại?
    ├─ Có → Đăng nhập
    └─ Không → Tạo tài khoản mới → Đăng nhập
```

---

## 🎨 Features

- ✅ Đăng nhập nhanh bằng Google
- ✅ Tự động tạo tài khoản nếu chưa có
- ✅ Không cần nhập password
- ✅ Lấy email và tên từ Google
- ✅ Mặc định role: `buyer`
- ✅ Có thể upgrade lên `seller` sau

---

## 📝 Ghi Chú

- User đăng ký qua Google sẽ có password ngẫu nhiên (họ không biết)
- Họ chỉ có thể đăng nhập bằng Google
- Email được verify tự động bởi Google
- Nếu muốn cho phép đổi password sau, cần thêm feature "Forgot Password"

---

**Trạng thái:** ✅ Code hoàn thành, chờ cấu hình Google Console  
**Ưu tiên:** 🔥 HIGH - Cần làm ngay để test
