# 🚀 Hướng Dẫn Deployment

> Tài liệu hướng dẫn deploy Zoldify lên Production Server.

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
2. [Yêu cầu Server](#-yêu-cầu-server)
3. [CI/CD Pipeline](#-cicd-pipeline)
4. [Deploy thủ công](#-deploy-thủ-công)
5. [Deploy Chat Server](#-deploy-chat-server)
6. [SSL/HTTPS](#-sslhttps)
7. [Monitoring](#-monitoring)
8. [Rollback](#-rollback)

---

## 🏗 Tổng quan kiến trúc

```
                    ┌─────────────────────────────────────────┐
                    │              INTERNET                   │
                    └──────────────────┬──────────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────────┐
                    │           NGINX (Reverse Proxy)         │
                    │         Port 80/443 (HTTP/HTTPS)        │
                    └──────────────────┬──────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  PHP-FPM        │    │  Chat Server    │    │  Static Files   │
    │  (Port 9000)    │    │  (Port 3001)    │    │  /css, /js, /img│
    │                 │    │  Socket.IO      │    │                 │
    └────────┬────────┘    └────────┬────────┘    └─────────────────┘
             │                      │
             ▼                      ▼
    ┌─────────────────────────────────────────┐
    │               MySQL Database            │
    │                (Port 3306)              │
    └─────────────────────────────────────────┘
```

---

## 💻 Yêu cầu Server

### Minimum Requirements

| Resource      | Giá trị                   |
| ------------- | ------------------------- |
| **CPU**       | 1 vCPU                    |
| **RAM**       | 1 GB                      |
| **Storage**   | 20 GB SSD                 |
| **OS**        | Ubuntu 20.04+ / CentOS 8+ |
| **Bandwidth** | 1 TB/month                |

### Software Stack

| Phần mềm    | Version          |
| ----------- | ---------------- |
| **Nginx**   | >= 1.18          |
| **PHP-FPM** | 8.2              |
| **MySQL**   | 8.0              |
| **Node.js** | 18 LTS           |
| **PM2**     | Latest           |
| **Certbot** | Latest (cho SSL) |

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Push to    │────▶│  CI Pipeline │────▶│    Deploy    │
│   GitHub     │     │   (Tests)    │     │  (FTP/SSH)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Branches

| Branch    | Môi trường | URL                         |
| --------- | ---------- | --------------------------- |
| `develop` | Staging    | https://staging.zoldify.com |
| `main`    | Production | https://zoldify.com         |

### Cấu hình Secrets

Vào **GitHub → Settings → Secrets and variables → Actions**, thêm:

| Secret Name            | Mô tả                   | Ví dụ             |
| ---------------------- | ----------------------- | ----------------- |
| `FTP_SERVER`           | FTP Server IP/Domain    | `ftp.zoldify.com` |
| `FTP_USERNAME`         | FTP Username Production | `zoldify_prod`    |
| `FTP_PASSWORD`         | FTP Password Production | `***`             |
| `FTP_USERNAME_STAGING` | FTP Username Staging    | `zoldify_staging` |
| `FTP_PASSWORD_STAGING` | FTP Password Staging    | `***`             |

### Workflow Files

- `.github/workflows/ci.yml` - Chạy tests, linting
- `.github/workflows/deploy.yml` - Deploy tự động

---

## 🛠 Deploy thủ công

### Bước 1: SSH vào server

```bash
ssh root@your-server-ip
```

### Bước 2: Clone/Pull code

```bash
cd /www/wwwroot/zoldify.com

# Lần đầu
git clone https://github.com/your-org/UniMarket.git .

# Lần sau
git pull origin main
```

### Bước 3: Cài dependencies

```bash
# PHP dependencies
composer install --no-dev --optimize-autoloader

# Không cần npm install cho frontend (đã build sẵn)
```

### Bước 4: Cấu hình .env

```bash
cp .env.example .env
nano .env
```

**Production config:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://zoldify.com

DB_HOST=127.0.0.1
DB_DATABASE=zoldify
DB_USERNAME=zoldify_user
DB_PASSWORD=<strong_password>
```

### Bước 5: Chạy migrations

```bash
php database/migrate.php
```

### Bước 6: Set permissions

```bash
# Cho phép write vào uploads
chmod -R 755 public/uploads
chown -R www:www public/uploads

# Bảo vệ file nhạy cảm
chmod 600 .env
```

---

## 💬 Deploy Chat Server

### Bước 1: Vào folder chat-server

```bash
cd /www/wwwroot/zoldify.com/chat-server
```

### Bước 2: Cài dependencies

```bash
npm ci --production
```

### Bước 3: Tạo file .env

```bash
cp .env.example .env
nano .env
```

**Production config:**

```env
SOCKET_PORT=3001
CORS_ORIGIN=https://zoldify.com,https://www.zoldify.com

DB_HOST=127.0.0.1
DB_USER=zoldify_user
DB_PASS=<same_password>
DB_NAME=zoldify
```

### Bước 4: Chạy với PM2

```bash
# Cài PM2 global (nếu chưa có)
npm install -g pm2

# Chạy chat server
pm2 start index.js --name zoldify-chat

# Auto-start khi reboot
pm2 startup
pm2 save
```

### Bước 5: Kiểm tra status

```bash
pm2 status
pm2 logs zoldify-chat
```

### PM2 Commands thường dùng

```bash
pm2 restart zoldify-chat    # Restart
pm2 stop zoldify-chat       # Stop
pm2 delete zoldify-chat     # Xóa
pm2 logs zoldify-chat       # Xem logs
pm2 monit                   # Monitor real-time
```

---

## 🔐 SSL/HTTPS

### Cài đặt Certbot (Let's Encrypt)

```bash
# Ubuntu
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d zoldify.com -d www.zoldify.com
```

### Auto-renew

```bash
# Test
sudo certbot renew --dry-run

# Certbot tự động setup cron job
```

---

## 📊 Monitoring

### Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

### PHP-FPM Logs

```bash
tail -f /var/log/php-fpm/www-error.log
```

### Chat Server Logs

```bash
pm2 logs zoldify-chat --lines 100
```

### Disk Space

```bash
df -h
```

### Memory Usage

```bash
free -m
htop
```

---

## ↩️ Rollback

### Rollback code (Git)

```bash
cd /www/wwwroot/zoldify.com

# Xem lịch sử commits
git log --oneline -10

# Rollback về commit cụ thể
git checkout <commit-hash>

# Hoặc rollback 1 commit
git revert HEAD
```

### Rollback database

```bash
# Restore từ backup
mysql -u zoldify_user -p zoldify < /backups/zoldify_backup_20260103.sql
```

---

## 📋 Checklist Deploy

### Pre-Deploy

- [ ] Code đã được review và merge vào `main`
- [ ] CI Pipeline đã pass (xanh lá)
- [ ] Đã test trên Staging
- [ ] Đã backup database Production

### Post-Deploy

- [ ] Kiểm tra website hoạt động
- [ ] Kiểm tra đăng nhập/đăng ký
- [ ] Kiểm tra Chat real-time
- [ ] Kiểm tra không có error trong logs
- [ ] Thông báo team deploy thành công

---

## 🆘 Emergency Contacts

| Vai trò             | Tên     | Liên hệ             |
| ------------------- | ------- | ------------------- |
| **DevOps Lead**     | [Tên]   | [Email/Phone]       |
| **Backend Lead**    | [Tên]   | [Email/Phone]       |
| **Hosting Support** | aaPanel | support@aapanel.com |

---

<p align="center">
  <strong>Zoldify DevOps</strong><br>
  <sub>Last updated: January 2026</sub>
</p>
