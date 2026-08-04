#!/bin/bash
# =====================================================
# FIX PERMISSIONS SCRIPT - STAGING SERVER
# Chạy script này trên server staging qua SSH
# =====================================================

# Đường dẫn root của project
WEB_ROOT="/www/wwwroot/staging.zoldify.com"

# User và group của web server (thường là www hoặc www-data)
WEB_USER="www"
WEB_GROUP="www"

echo "🔧 Đang fix permissions cho: $WEB_ROOT"
echo "=========================================="

# 1. Đổi owner toàn bộ project về www:www
echo "📁 Đổi owner về $WEB_USER:$WEB_GROUP..."
chown -R $WEB_USER:$WEB_GROUP $WEB_ROOT

# 2. Set permission cho thư mục: 755 (rwxr-xr-x)
echo "📂 Set permission thư mục: 755..."
find $WEB_ROOT -type d -exec chmod 755 {} \;

# 3. Set permission cho file: 644 (rw-r--r--)
echo "📄 Set permission files: 644..."
find $WEB_ROOT -type f -exec chmod 644 {} \;

# 4. Thư mục cần ghi (uploads, cache, logs): 775
echo "📦 Set permission thư mục uploads/cache: 775..."
chmod -R 775 $WEB_ROOT/public/uploads 2>/dev/null
chmod -R 775 $WEB_ROOT/storage 2>/dev/null
chmod -R 775 $WEB_ROOT/cache 2>/dev/null

# 5. Đảm bảo FTP user có quyền ghi
# (Thêm FTP user vào group www nếu cần)
echo "👤 Thêm FTP user vào group $WEB_GROUP..."
# Thay 'your_ftp_user' bằng username FTP thực tế của bạn
# usermod -a -G $WEB_GROUP your_ftp_user

echo ""
echo "✅ DONE! Permissions đã được fix."
echo "=========================================="
echo ""
echo "📌 Nếu vẫn bị permission denied, chạy thêm:"
echo "   chmod -R 777 $WEB_ROOT/public/js"
echo "   chmod -R 777 $WEB_ROOT/public/css"
echo ""
