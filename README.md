# Zoldify — Web

Giao diện web của Zoldify, sàn mua bán đồ cũ dành cho sinh viên.

## Công nghệ

| Thành phần | Dùng gì |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Ngôn ngữ | TypeScript |
| Giao diện | Tailwind CSS 3 |
| Gọi API | axios |
| Realtime | socket.io-client |
| Thông báo đẩy | Firebase |

Backend nằm ở repo riêng `Zoldify_Backend` (NestJS + MySQL). Web gọi vào `/api/v1/...` của backend đó.

## Chạy ở máy

Cần Node.js 20 trở lên.

```bash
npm install
cp .env.example .env.local   # sửa NEXT_PUBLIC_API_URL cho khớp backend
npm run dev
```

Mở http://localhost:3001

Backend phải chạy song song ở cổng 3000. Nếu chưa có backend, có thể chạy mock server từ repo backend:

```bash
cd ../Zoldify_Backend && npm run mock   # cổng 4200
```

## Các lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy chế độ phát triển |
| `npm run build` | Build bản production |
| `npm run start` | Chạy bản đã build |
| `npm run lint` | Kiểm tra lint |
| `npm run check:tokens` | Kiểm token màu, bắt các lớp Tailwind bị bỏ im lặng |
| `npm run clean` | Xoá cache `.next` |

## Cấu trúc

```
src/
├── app/         Route theo App Router của Next.js
├── components/  Component dùng lại
├── context/     React context (auth, giỏ hàng)
├── lib/         http client, socket, firebase, format, config
└── services/    Hàm gọi API theo từng nhóm nghiệp vụ
```

## Quy ước làm việc

- Không push thẳng vào `main`, tạo nhánh `feature/ten-chuc-nang`
- Commit theo mẫu `Add: Chức năng đăng nhập`
- Mở Pull Request và cần ít nhất một người khác review

## Tài liệu

Thiết kế hệ thống, sơ đồ và kế hoạch bàn giao nằm trong repo backend, thư mục `docs/system-design/`.
