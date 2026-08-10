# Chạy Zoldify trên máy

Hướng dẫn này dựng lại đúng môi trường đang chạy ngày 2026-08-10, đã kiểm từng
bước chứ không viết theo trí nhớ.

Cần sẵn: **Node 20+**, **Docker Desktop**, và một trình duyệt.

---

## 1. CSDL — MySQL 8 trong Docker

Backend dùng **MySQL**, không phải PostgreSQL. Nếu máy bạn đang chạy Postgres
thì nó không liên quan gì tới dự án này.

Kiểm xem container đã có chưa:

```bash
docker ps -a --filter name=zoldify-test-mysql
```

**Nếu chưa có**, tạo (script này có sẵn trong `Zoldify_Backend/package.json`):

```bash
cd Zoldify_Backend
npm run test:db
```

Nó tạo container `zoldify-test-mysql`, map **cổng 3307** trên máy sang 3306 bên
trong, mật khẩu `root` là `testpw`.

**Nếu đã có nhưng đang tắt**:

```bash
docker start zoldify-test-mysql
```

> ⚠️ Container này tên là *test* vì script gốc dùng cho kiểm thử, nhưng dữ liệu
> phát triển đang nằm trong đó. `docker rm zoldify-test-mysql` sẽ **xoá sạch**
> CSDL. Muốn chắc thì đổi sang một container riêng có volume.

Tạo CSDL cho môi trường phát triển:

```bash
docker exec zoldify-test-mysql mysql -uroot -ptestpw \
  -e "CREATE DATABASE IF NOT EXISTS zoldify_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 2. Cấu hình backend

Tạo file `Zoldify_Backend/.env` với nội dung sau. Backend đọc nó qua
`ConfigModule.forRoot({ isGlobal: true })`, tức là file `.env` ở thư mục gốc
của backend.

```ini
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=testpw
DB_DATABASE=zoldify_dev

PORT=3000
SITE_URL=http://localhost:3001

JWT_ACCESS_SECRET=doi-chuoi-nay-di-chi-dung-cho-may-ca-nhan
JWT_ACCESS_EXPIRE=1d
JWT_REFRESH_TOKEN_SECRET=doi-chuoi-nay-nua
JWT_REFRESH_EXPIRE=7d
```

`SITE_URL` chính là danh sách origin được CORS cho phép. Frontend chạy ở 3001
nên phải khai đúng 3001, nếu không mọi request sẽ bị chặn.

Ba nhóm dưới đây **không bắt buộc để chạy**, nhưng thiếu thì tính năng tương
ứng sẽ báo lỗi khi dùng tới:

| Nhóm biến | Thiếu thì mất gì |
|---|---|
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_APP_PASSWORD` | Không gửi được mã OTP → **đăng ký** và **quên mật khẩu** dừng ở bước gửi mã |
| `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PAYOS_HOST` | Không nạp ví và không thanh toán thẻ/QR được |

---

## 3. Dựng lược đồ và dữ liệu mẫu

Các bảng gốc (users, products, orders…) **không có migration nào tạo ra chúng**
— trong `src/migrations` chỉ có migration thêm index, fulltext và bảng ledger.
Nên CSDL mới phải dựng lược đồ bằng script riêng:

```bash
cd Zoldify_Backend
npx ts-node -r tsconfig-paths/register scripts/bootstrap-dev-schema.ts
npm run seed
```

Kết quả mong đợi: `OK — zoldify_dev có 24 bảng.` rồi 1 người bán, 9 danh mục,
15 sản phẩm.

> Script chỉ chạy với CSDL có tên kết thúc bằng `_dev` hoặc `_test` — đây là
> rào chắn cố ý, vì nó bật `synchronize` và không được phép chạm vào CSDL thật.
> Nó cũng **chỉ dùng cho CSDL còn trống**: chạy lại trên CSDL đã có lược đồ sẽ
> lỗi `Cannot drop index ... needed in a foreign key constraint`.

Tài khoản có sẵn sau khi seed: **`seller@zoldify.com` / `123456`**

---

## 4. Cấu hình frontend

Tạo file `Zoldify_Frontend/.env.local`:

```ini
NEXT_PUBLIC_API_ORIGIN=http://localhost:3000
```

Nếu bỏ trống, mã tự dùng `http://localhost:3000` (xem `src/lib/config.ts`), nên
với thiết lập mặc định thì file này không bắt buộc.

### Đăng nhập bằng Google

Nút Google chỉ hoạt động khi có **đủ ba biến dưới đây**, và **tên phải có tiền
tố `NEXT_PUBLIC_`** — Next.js chỉ đưa biến có tiền tố đó xuống trình duyệt:

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

Lấy ba giá trị này ở **Firebase Console → Project Settings → General → Your
apps → SDK setup and configuration**.

> ⚠️ File mẫu môi trường của dự án đang ghi tên biến **không có** tiền tố
> `NEXT_PUBLIC_` (`FIREBASE_API_KEY`…). Điền theo đúng file mẫu đó thì nút
> Google **sẽ không bao giờ hiện**. Cần sửa file mẫu lại cho khớp.

Chưa cấu hình cũng không sao: nút vẫn hiện, bấm vào có câu giải thích, và đăng
nhập bằng email/mật khẩu vẫn chạy bình thường.

Sau khi thêm biến, **phải khởi động lại** `next dev` — biến `NEXT_PUBLIC_*`
được nhúng lúc build, không đọc lại khi đang chạy.

---

## 5. Chạy

Hai cửa sổ terminal:

```bash
# Cửa sổ 1 — backend, cổng 3000
cd Zoldify_Backend
npm run start:dev
```

```bash
# Cửa sổ 2 — frontend, cổng 3001
cd Zoldify_Frontend
npx next dev -p 3001
```

Backend **phải** ở 3000: frontend mặc định gọi API ở đó. Frontend **phải** ở
3001: đó là origin duy nhất CORS của backend cho phép.

| | |
|---|---|
| Giao diện | http://localhost:3001 |
| API | http://localhost:3000/api/v1 |
| Tài liệu API | http://localhost:3000/api/docs |

---

## 6. Lỗi hay gặp

**Giao diện mất sạch CSS, hoặc trang trắng.** Thường do chạy `npm run build`
rồi chạy `next dev` trên cùng thư mục `.next`. Cách chữa: dừng server, xoá
`.next`, chạy lại.

**Đổi `tailwind.config.ts` mà không thấy gì thay đổi.** Dev server không nạp
lại file config. Khởi động lại là được.

**Mọi request bị CORS chặn.** Kiểm `SITE_URL` bên backend có đúng
`http://localhost:3001` không.

**Đăng ký / quên mật khẩu báo "Không thể gửi email".** Đúng như mong đợi khi
chưa cấu hình nhóm `EMAIL_*`. Backend vẫn chạy, chỉ là không gửi được mã.

---

## 7. Kiểm nhanh xem mọi thứ có ổn không

```bash
# Backend có trả dữ liệu không
curl "http://localhost:3000/api/v1/products?current=1&pageSize=1"

# Frontend có server-render không (phải thấy nhiều hơn 0 thẻ div)
curl -s http://localhost:3001/ | grep -c "<div"
```

Trong `Zoldify_Frontend` còn hai lệnh kiểm tra nên chạy trước khi commit:

```bash
npx tsc --noEmit          # kiểu dữ liệu
node scripts/check-tokens.mjs   # lớp Tailwind bị bỏ im lặng + tương phản màu
```
