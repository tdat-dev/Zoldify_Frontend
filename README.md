# Zoldify — Web

Giao diện web của Zoldify, sàn mua bán đồ cũ.

## Công nghệ

| Thành phần | Dùng gì |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Ngôn ngữ | TypeScript |
| Giao diện | Tailwind CSS 3, token màu OKLCH |
| Đa ngôn ngữ | next-intl (VI/EN, chọn qua cookie `locale`) |
| Gọi API | axios |
| Realtime | socket.io-client |
| Đăng nhập Google | Firebase Auth |

Backend nằm ở repo riêng `Zoldify_Backend` (NestJS + **MySQL**). Web gọi vào
`/api/v1/...` của backend đó.

## Chạy ở máy

**Hướng dẫn đầy đủ, đã kiểm từng bước: [`docs/chay-tren-may.md`](docs/chay-tren-may.md)** —
gồm cả cách dựng CSDL, vì các bảng gốc không có migration nào tạo ra chúng nên
CSDL mới phải chạy script dựng lược đồ riêng.

Tóm tắt:

```bash
npm install
npx next dev -p 3001
```

Mở http://localhost:3001. Backend phải chạy song song ở cổng **3000** — frontend
mặc định gọi API ở đó, và CORS của backend chỉ cho phép origin `localhost:3001`.

### Biến môi trường

Đặt trong `.env.local`. Cả bốn đều không bắt buộc để trang chạy được:

| Biến | Thiếu thì sao |
| --- | --- |
| `NEXT_PUBLIC_API_ORIGIN` | Mặc định `http://localhost:3000` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Nút "Đăng nhập bằng Google" vẫn hiện nhưng báo chưa dùng được |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | như trên |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | như trên |

> Tiền tố `NEXT_PUBLIC_` là **bắt buộc** — Next.js chỉ đưa biến có tiền tố đó
> xuống trình duyệt. File mẫu môi trường của repo đang ghi tên không có tiền tố
> này; điền theo nó thì nút Google sẽ không bao giờ chạy.

Biến `NEXT_PUBLIC_*` được nhúng lúc build, nên thêm hoặc sửa xong phải **khởi
động lại** dev server.

## Các lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy chế độ phát triển |
| `npm run build` | Build bản production |
| `npm run start` | Chạy bản đã build |
| `npm run lint` | Kiểm tra lint |
| `npm run check:tokens` | Kiểm token màu, bắt các lớp Tailwind bị bỏ im lặng |
| `npm run clean` | Xoá cache `.next` |

`check:tokens` đáng chạy trước mỗi commit đụng tới giao diện: nó bắt loại lỗi
Tailwind âm thầm không sinh ra CSS (lớp có bổ ngữ độ mờ, và nhóm `state-*` nằm
trong `src/lib`), và đo tương phản màu của các cặp token.

## Cấu trúc

```
src/
├── app/         Route theo App Router của Next.js
├── components/  Component dùng lại
├── context/     React context (auth, giỏ hàng)
├── hooks/       useRequireAuth — cổng đăng nhập dùng chung
├── i18n/         Cấu hình next-intl và file chuỗi VI/EN
├── lib/         http, socket, firebase, format, token trạng thái
└── services/    Hàm gọi API theo từng nhóm nghiệp vụ
```

Vài chỗ là **nguồn duy nhất**, đừng chép lại giá trị của chúng vào trang:

| File | Giữ gì |
| --- | --- |
| `lib/order-status.ts` | 7 trạng thái đơn + chuỗi tiến trình |
| `lib/product-status.ts` | 5 trạng thái tin đăng |
| `lib/product-condition.ts` | 4 mức tình trạng đồ cũ |
| `lib/money-flow.ts` | Tiền vào / tiền ra cho ví |
| `lib/format.ts` | Định dạng tiền, thời gian, URL ảnh |
| `i18n/messages/*.json` | Toàn bộ chuỗi giao diện |

## Quy ước làm việc

- Không push thẳng vào `main`, tạo nhánh `feature/ten-chuc-nang`
- Commit theo mẫu `Add: Chức năng đăng nhập`
- Mở Pull Request và cần ít nhất một người khác review

## Tài liệu

- [`docs/chay-tren-may.md`](docs/chay-tren-may.md) — dựng môi trường từ đầu
- `docs/superpowers/specs/` — spec của đợt redesign
- Thiết kế hệ thống và sơ đồ nằm trong repo backend, thư mục `docs/system-design/`
