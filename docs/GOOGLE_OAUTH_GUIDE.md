# 🔐 Hướng Dẫn Tích Hợp Google OAuth Login

## 📋 Tổng Quan

Hướng dẫn này sẽ giúp bạn tích hợp **Google OAuth 2.0** để cho phép người dùng đăng nhập bằng tài khoản Google.

---

## 🚀 Bước 1: Tạo Google OAuth Credentials

### 1.1. Truy cập Google Cloud Console

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn

### 1.2. Tạo Project Mới

1. Click vào dropdown "Select a project" ở góc trên
2. Click "NEW PROJECT"
3. Nhập tên project: `Zoldify` (hoặc tên bạn thích)
4. Click "CREATE"

### 1.3. Bật Google+ API

1. Vào menu ☰ → **APIs & Services** → **Library**
2. Tìm "Google+ API"
3. Click vào và nhấn "ENABLE"

### 1.4. Tạo OAuth Consent Screen

1. Vào menu ☰ → **APIs & Services** → **OAuth consent screen**
2. Chọn **External** (cho phép mọi người dùng)
3. Click "CREATE"
4. Điền thông tin:
   - **App name**: `Zoldify`
   - **User support email**: Email của bạn
   - **Developer contact email**: Email của bạn
5. Click "SAVE AND CONTINUE"
6. Bỏ qua phần "Scopes" → Click "SAVE AND CONTINUE"
7. Bỏ qua phần "Test users" → Click "SAVE AND CONTINUE"
8. Click "BACK TO DASHBOARD"

### 1.5. Tạo OAuth 2.0 Credentials

1. Vào menu ☰ → **APIs & Services** → **Credentials**
2. Click "+ CREATE CREDENTIALS" → **OAuth client ID**
3. Chọn **Application type**: `Web application`
4. Nhập tên: `Zoldify Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost
   http://unimarket.test
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost/auth/google/callback
   http://unimarket.test/auth/google/callback
   ```
7. Click "CREATE"
8. **LƯU LẠI**:
   - `Client ID`: Chuỗi dài kiểu `123456789-abc...xyz.apps.googleusercontent.com`
   - `Client Secret`: Chuỗi ngắn hơn kiểu `GOCSPX-...`

---

## 🔧 Bước 2: Cấu Hình Project

### 2.1. Cập nhật file `.env`

Mở file `.env` và thêm:

```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback
```

**Thay thế:**

- `YOUR_CLIENT_ID_HERE` → Client ID vừa copy
- `YOUR_CLIENT_SECRET_HERE` → Client Secret vừa copy
- Nếu dùng Laragon: `http://unimarket.test/auth/google/callback`

### 2.2. Cập nhật file `config/app.php`

Tạo file `config/google.php`:

```php
<?php

return [
    'client_id' => $_ENV['GOOGLE_CLIENT_ID'] ?? '',
    'client_secret' => $_ENV['GOOGLE_CLIENT_SECRET'] ?? '',
    'redirect_uri' => $_ENV['GOOGLE_REDIRECT_URI'] ?? '',
];
```

---

## 📝 Bước 3: Code Implementation

Các file đã được tạo sẵn:

1. `app/Controllers/GoogleAuthController.php` - Xử lý OAuth flow
2. `app/Services/GoogleOAuthService.php` - Service tương tác với Google API
3. `config/google.php` - Cấu hình Google OAuth

### Thêm routes vào `routes/web.php`:

```php
// Google OAuth
$router->get('/auth/google', 'GoogleAuthController@redirectToGoogle');
$router->get('/auth/google/callback', 'GoogleAuthController@handleGoogleCallback');
```

---

## 🎨 Bước 4: Cập Nhật Giao Diện

Nút "Đăng nhập bằng Google" đã có sẵn trong:

- `resources/views/auth/login.php`
- `resources/views/auth/register.php`

Chỉ cần đổi `href="#"` thành `href="/auth/google"`:

```html
<a
  href="/auth/google"
  class="flex items-center justify-center w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition duration-300 group bg-white"
>
  <img src="/images/google.png" alt="Google" class="w-5 h-5 mr-3" />
  <span class="text-gray-700 font-medium group-hover:text-gray-900"
    >Đăng nhập bằng Google</span
  >
</a>
```

---

## ✅ Bước 5: Test

### 5.1. Kiểm tra cấu hình

```bash
# Kiểm tra .env đã có Google credentials chưa
cat .env | grep GOOGLE
```

### 5.2. Test flow

1. Vào trang login: `http://localhost/login`
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google
4. Cho phép ứng dụng truy cập
5. Được redirect về và tự động đăng nhập

---

## 🔍 Troubleshooting

### Lỗi: "redirect_uri_mismatch"

**Nguyên nhân:** URL callback không khớp với cấu hình trong Google Console

**Giải pháp:**

1. Vào Google Cloud Console → Credentials
2. Edit OAuth client
3. Thêm chính xác URL đang dùng vào "Authorized redirect URIs"

### Lỗi: "invalid_client"

**Nguyên nhân:** Client ID hoặc Secret sai

**Giải pháp:**

1. Kiểm tra lại file `.env`
2. Đảm bảo không có khoảng trắng thừa
3. Copy lại từ Google Console

### Lỗi: "access_denied"

**Nguyên nhân:** User từ chối cấp quyền

**Giải pháp:** Bình thường, user cần accept để tiếp tục

---

## 📚 Tài Liệu Tham Khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google API PHP Client](https://github.com/googleapis/google-api-php-client)

---

## 🎯 Checklist Hoàn Thành

- [ ] Tạo Google Cloud Project
- [ ] Bật Google+ API
- [ ] Tạo OAuth Consent Screen
- [ ] Tạo OAuth 2.0 Credentials
- [ ] Cập nhật file `.env`
- [ ] Chạy `composer update`
- [ ] Thêm routes
- [ ] Cập nhật giao diện
- [ ] Test đăng nhập

---

**Lưu ý:** Trong môi trường production, nhớ thêm domain thật vào Authorized URIs!
