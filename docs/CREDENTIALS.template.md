# 🔐 Thông Tin Truy Cập (Credentials)

> ⚠️ **CẢNH BÁO BẢO MẬT**: File này KHÔNG được commit lên Git!
> Thêm `CREDENTIALS.md` vào `.gitignore`

---

## 📋 Mục lục

1. [Local Development](#-local-development)
2. [Staging Environment](#-staging-environment)
3. [Production Environment](#-production-environment)
4. [Third-party Services](#-third-party-services)
5. [GitHub & CI/CD](#-github--cicd)

---

## 💻 Local Development

### MySQL Database

| Field        | Value                             |
| ------------ | --------------------------------- |
| **Host**     | `127.0.0.1` / `localhost`         |
| **Port**     | `3306`                            |
| **Database** | `zoldify`                         |
| **Username** | `root`                            |
| **Password** | _(để trống với Laragon mặc định)_ |

### Test Accounts

| Role       | Email               | Password    |
| ---------- | ------------------- | ----------- |
| **Admin**  | `admin@zoldify.com` | `Admin@123` |
| **User 1** | `user1@gmail.com`   | `User@123`  |
| **User 2** | `user2@gmail.com`   | `User@123`  |

### Chat Server

| Field         | Value                   |
| ------------- | ----------------------- |
| **URL**       | `http://localhost:3001` |
| **WebSocket** | `ws://localhost:3001`   |

### Redis (Optional)

| Field        | Value        |
| ------------ | ------------ |
| **Host**     | `127.0.0.1`  |
| **Port**     | `6379`       |
| **Password** | _(để trống)_ |

---

## 🧪 Staging Environment

### Server Access

| Field        | Value                              |
| ------------ | ---------------------------------- |
| **URL**      | `https://staging.zoldify.com`      |
| **IP**       | `xxx.xxx.xxx.xxx`                  |
| **SSH User** | `root` hoặc `zoldify_staging`      |
| **SSH Port** | `22`                               |
| **SSH Key**  | File: `~/.ssh/zoldify_staging_key` |

### FTP Access

| Field        | Value                              |
| ------------ | ---------------------------------- |
| **Host**     | `ftp.zoldify.com`                  |
| **Port**     | `21`                               |
| **Username** | `zoldify_staging`                  |
| **Password** | `[Lấy từ GitHub Secrets]`          |
| **Root Dir** | `/www/wwwroot/staging.zoldify.com` |

### Database

| Field        | Value              |
| ------------ | ------------------ |
| **Host**     | `127.0.0.1`        |
| **Database** | `zoldify_staging`  |
| **Username** | `zoldify_staging`  |
| **Password** | `[Lấy từ aaPanel]` |

---

## 🚀 Production Environment

### Server Access

| Field            | Value                          |
| ---------------- | ------------------------------ |
| **URL**          | `https://zoldify.com`          |
| **aaPanel**      | `https://xxx.xxx.xxx.xxx:8888` |
| **aaPanel User** | `admin`                        |
| **aaPanel Pass** | `[Liên hệ DevOps Lead]`        |
| **IP**           | `xxx.xxx.xxx.xxx`              |
| **SSH User**     | `root`                         |
| **SSH Port**     | `22`                           |

### FTP Access

| Field        | Value                      |
| ------------ | -------------------------- |
| **Host**     | `ftp.zoldify.com`          |
| **Port**     | `21`                       |
| **Username** | `zoldify_prod`             |
| **Password** | `[Lấy từ GitHub Secrets]`  |
| **Root Dir** | `/www/wwwroot/zoldify.com` |

### MySQL Database

| Field        | Value                   |
| ------------ | ----------------------- |
| **Host**     | `127.0.0.1`             |
| **Port**     | `3306`                  |
| **Database** | `zoldify`               |
| **Username** | `zoldify_user`          |
| **Password** | `[Liên hệ DevOps Lead]` |

### Chat Server (PM2)

| Field      | Value                   |
| ---------- | ----------------------- |
| **Name**   | `zoldify-chat`          |
| **Port**   | `3001`                  |
| **Status** | `pm2 status`            |
| **Logs**   | `pm2 logs zoldify-chat` |

---

## 🔗 Third-party Services

### Google Cloud Console (OAuth)

| Field             | Value                                        |
| ----------------- | -------------------------------------------- |
| **Console URL**   | https://console.cloud.google.com             |
| **Project Name**  | `Zoldify`                                    |
| **Client ID**     | `xxxxx.apps.googleusercontent.com`           |
| **Client Secret** | `[Lấy từ .env]`                              |
| **Redirect URIs** |                                              |
|                   | `http://localhost:8000/auth/google/callback` |
|                   | `https://zoldify.com/auth/google/callback`   |

### Gmail SMTP (Email Service)

| Field             | Value                              |
| ----------------- | ---------------------------------- |
| **Email Account** | `noreply@zoldify.com` (hoặc Gmail) |
| **SMTP Host**     | `smtp.gmail.com`                   |
| **SMTP Port**     | `587`                              |
| **Encryption**    | `TLS`                              |
| **App Password**  | `[16 ký tự từ Google]`             |

**Cách tạo App Password:**

1. Đăng nhập Google Account
2. Security → 2-Step Verification → Bật
3. Security → App passwords → Tạo mới
4. Chọn "Mail" + "Windows Computer"
5. Copy 16 ký tự password

### Domain & DNS

| Field               | Value                      |
| ------------------- | -------------------------- |
| **Registrar**       | `[Nhà đăng ký tên miền]`   |
| **Domain**          | `zoldify.com`              |
| **Nameservers**     | `[DNS Provider]`           |
| **SSL Certificate** | Let's Encrypt (auto-renew) |

---

## 🐙 GitHub & CI/CD

### Repository

| Field           | Value                                   |
| --------------- | --------------------------------------- |
| **URL**         | `https://github.com/your-org/UniMarket` |
| **Main Branch** | `main`                                  |
| **Dev Branch**  | `develop`                               |

### GitHub Secrets (Actions)

Vào: **Settings → Secrets and variables → Actions**

| Secret Name            | Description         | Value             |
| ---------------------- | ------------------- | ----------------- |
| `FTP_SERVER`           | FTP Server          | `ftp.zoldify.com` |
| `FTP_USERNAME`         | Production FTP User | `zoldify_prod`    |
| `FTP_PASSWORD`         | Production FTP Pass | `***`             |
| `FTP_USERNAME_STAGING` | Staging FTP User    | `zoldify_staging` |
| `FTP_PASSWORD_STAGING` | Staging FTP Pass    | `***`             |

### Environments

Vào: **Settings → Environments**

| Environment  | Protection Rules            |
| ------------ | --------------------------- |
| `staging`    | None                        |
| `production` | Require approval (optional) |

---

## 📝 Ghi chú

### Đổi Password

Khi cần đổi password, update những nơi sau:

1. **aaPanel** - MySQL user password
2. **Server** - `.env` file
3. **GitHub Secrets** - FTP passwords
4. **Tài liệu này** - Update thông tin

### Quy trình thêm Developer mới

1. Thêm vào GitHub repository (Collaborator hoặc Team)
2. Cấp quyền truy cập Staging server (nếu cần)
3. **KHÔNG** cấp quyền Production trực tiếp
4. Gửi link docs `SETUP.md`

### Bảo mật

- ❌ KHÔNG commit file `.env` lên Git
- ❌ KHÔNG share password qua chat/email không mã hóa
- ✅ Dùng GitHub Secrets cho CI/CD
- ✅ Dùng SSH key thay vì password khi có thể
- ✅ Đổi password định kỳ (3-6 tháng)

---

<p align="center">
  <strong>🔒 Keep this file secure!</strong><br>
  <sub>Last updated: January 2026</sub>
</p>
