# Quét regression toàn site — 2026-08-06

Kết quả một lượt rà read-only toàn bộ frontend sau đợt audit, **không liên quan tới bản
thiết kế lại trang chủ** (bản đó đã bị gỡ, xem `design/giu-tien-ho`). Những lỗi dưới đây
vẫn còn nguyên trong code hiện tại.

Nhận định xuyên suốt: **mỗi bản vá của đợt audit chỉ được áp đúng một chỗ, không nhân ra
các chỗ anh em cùng dạng.** Đó là lý do phần lớn danh sách này tồn tại.

---

## P0 — chặn ship

### 1. Toàn bộ luồng quên/đổi mật khẩu là hàng giả
- `src/app/forgot-password/page.tsx:14-19` — `handleSendCode` **không gọi API nào**, chỉ
  `setStep(2)`. Màn sau vẫn báo "Nhập mã code 6 số đã được gửi tới email …" (dòng 45-48).
  Không có email nào được gửi.
- `src/app/forgot-password/page.tsx:21-26` — `handleVerifyOtp` nhận **mọi** chuỗi khác rỗng,
  toast "Xác thực thành công…" rồi **không điều hướng đi đâu cả**.
- `src/app/forgot-password/page.tsx:62` — nút "Gửi lại mã?" không có `onClick`.
- `src/app/reset-password/page.tsx:16-30` — `<form>` không có `onSubmit`, không state, không
  gọi service. Bấm nút là **submit GET native**, reload trang, mật khẩu không đi đâu cả.
  Cũng không có link nào trong app trỏ tới `/reset-password`.
- `src/app/profile/change-password/page.tsx:21-43` — cùng dạng: form không handler, nút
  `type="button"` không `onClick`. Trang này **có link thật** từ menu header
  (`src/components/Header.tsx:119`) và từ `/profile` (`src/app/profile/page.tsx:77`).
- `src/services/auth.service.ts` chỉ có `login`, `register`, `sendRegisterOtp`,
  `verifyRegisterOtp`, `getProfile` — **không có endpoint quên/đặt lại/đổi mật khẩu nào**.

**Hại:** người quên mật khẩu trên một sàn đang giữ tiền của họ sẽ nhập email, chờ OTP không
bao giờ tới, gõ bừa vào ô, được báo "thành công", rồi đứng nguyên tại chỗ. Người đang đăng
nhập muốn đổi mật khẩu vì nghi bị lộ sẽ điền ba ô, bấm nút, không có phản hồi nào — và tin
rằng mật khẩu đã đổi.

### 2. Màn hình tiền báo "bạn không có gì" khi API chết
Đúng lỗi mà audit **đã sửa** ở `/search` (`src/app/search/page.tsx:36-41`, kèm comment
"API hỏng lại hiện 'Không tìm thấy sản phẩm nào phù hợp' — sai sự thật"). Sửa đúng một chỗ,
bỏ sót mọi nơi khác, gồm mọi trang có tiền.

| File:line | Lỗi bị nuốt | Người dùng thấy |
|---|---|---|
| `src/app/profile/wallet/page.tsx:30-38` | `Promise.allSettled`, bỏ qua reject | **"0 VNĐ"** + "Chưa có giao dịch nào." (dòng 142) |
| `src/app/profile/orders/page.tsx:49` | `catch { console.error }` | "Bạn chưa có đơn hàng nào." + nút Mua sắm ngay |
| `src/app/cart/page.tsx:38` | `catch { console.error }` | "Chưa có sản phẩm nào trong giỏ." |
| `src/app/checkout/page.tsx:58` | `catch { console.error }` | Checkout render đủ với 0 món, **"Tổng thanh toán 0đ"** |
| `src/app/profile/orders/[id]/page.tsx:45` | `catch { console.error }` | "Không tìm thấy đơn hàng" — trùng chuỗi với 404 thật |
| `src/app/addresses/page.tsx:25` | `catch { console.error }` | "Chưa có địa chỉ nào" |

**Hại nặng nhất (ví):** người bán đang có 5.000.000đ ký quỹ mở `/profile/wallet` đúng lúc
backend chớp, được báo dõng dạc **0 VNĐ**, lịch sử giao dịch rỗng, kèm nút "Nạp tiền".

**Audit còn làm giỏ hàng tệ hơn:** nó viết lại empty state từ một câu thụ động thành màn
hình tự tin có `h1` + CTA "Tìm sản phẩm". Người có giỏ hàng lỗi 500 giờ được mời đi mua lại
từ đầu, bằng một giao diện đẹp.

### 3. Checkout bị khoá cứng bởi API bên thứ ba không ai bắt lỗi
- `src/components/AddressPicker.tsx:38` — `provinceService.getProvinces().then(setProvinces)`,
  **không `.catch`**, không loading, không timeout.
- `src/services/province.service.ts:27` — trỏ `https://provinces.open-api.vn/api/?depth=3`.
- `src/components/AddressPicker.tsx:51` — `catch {}` rỗng cho địa chỉ đã lưu.

**Hại:** API tỉnh/thành chậm hoặc chặn IP thì ô "Tỉnh/TP" chỉ có "-- Chọn --" mãi mãi, rồi
`handleOrder` (`src/app/checkout/page.tsx:66`) từ chối với "Vui lòng nhập đầy đủ thông tin
giao hàng" — đổ lỗi cho người mua vì một sự cố họ không thể sửa.

### 4. Đợt thay `text-gray-*` hàng loạt lặp lại đúng regression đã biết, trên trang nền tối
- `src/app/maintenance/page.tsx:27` — `text-gray-600` trên nền
  `bg-gradient-to-br from-gray-900 …` (dòng 6). Audit đổi nó từ `text-gray-400` **về phía**
  nền tối. Đoạn kế bên cùng nền dùng `text-gray-300`.
- **Chưa đo pixel, mới đọc code** — cần lấy mẫu ảnh chụp thật trước khi kết luận. Nhưng
  chiều thay đổi và ngữ cảnh chữ-sáng-trên-nền-tối trùng khớp với regression 3.04:1 → 1.94:1
  đã ghi nhận trước đó.
- **Hại:** trang bảo trì hiện ra đúng lúc site hỏng, và dòng có nguy cơ chính là dòng chỉ
  người dùng cách liên hệ (`admin@zoldify.com`).

Nghi tương tự, **chưa đo**: `src/app/product/create/page.tsx:96,127` (`text-slate-400` trên
thẻ trắng). Chỗ audit làm **đúng**: `src/app/profile/wallet/page.tsx:93,95`.

**Tác dụng phụ khác của cùng đợt thay — bẹp phân cấp thị giác:** dấu phân cách và metadata
phụ bị đẩy lên cùng giá trị với chữ chính. `src/app/addresses/page.tsx:51`
(`<span className="text-gray-600">|</span>` giữa hai mục cùng tông), và `src/app/admin/page.tsx`
giờ có `text-gray-600 group-hover:text-gray-600` — một hover state không đổi gì.

### 5. "API base URL không deploy được" mới sửa được một nửa
`src/lib/config.ts:6` đã đúng. Còn sót ba chỗ hardcode `localhost:3000` — mà 3000 là cổng
dev của chính Next:
- `src/lib/socket.ts:7` — `io('http://localhost:3000/chat', …)`. Chat sẽ nối vào server Next
  ở mọi môi trường. `getSocket` còn trả `socket!` (dòng 12) vốn là `null` khi gọi lúc chưa có
  token → crash nếu ai đó deref.
- `src/app/admin/orders/page.tsx:416` và `src/app/shop/orders/page.tsx:155` — ảnh sản phẩm
  fallback về `http://localhost:3000/...`.

**Hại:** deploy lên host thật thì admin xem đơn thấy vỡ ảnh toàn bộ, và chat người mua ↔
người bán không bao giờ kết nối, im lặng, không báo lỗi.

---

## P1 — nghiêm trọng

6. `src/app/category/[slug]/page.tsx:26` — `.catch(() => setProducts([]))` → "Chưa có sản
   phẩm nào trong danh mục này." Đúng lỗi audit đã sửa ở `/search` bằng máy trạng thái
   `loading|ready|error` + nút "Thử lại". `/category` chỉ được đổi màu. Nếu `getBySlug` hỏng
   thì breadcrumb (dòng 54) in ra slug thô và filter (dòng 68) rỗng.
7. `src/app/admin/page.tsx:16` — `.catch(() => {})` trên call lặp mỗi 30s → dashboard hiện
   **"Doanh thu 0đ"** tự tin khi API chết, không phân biệt được với thảm hoạ thật.
8. `src/app/product/[id]/page.tsx:257` — `Math.min(product.stock || 99, …)`: hết hàng
   (`stock = 0`) thì `0 || 99` = 99, cho chọn tới 99 trong khi dòng 259 ghi "0 sản phẩm có
   sẵn". Nút mua không bị disable. (`src/app/shop/page.tsx:294` đã có overlay "Hết hàng" —
   khái niệm này tồn tại sẵn trong codebase.)
9. `src/app/profile/page.tsx` — **không có auth guard** (khác `/cart`, `/profile/orders`,
   `/profile/wallet` đều redirect). Chưa đăng nhập vẫn render form "Thông tin cá nhân" rỗng;
   bấm "Lưu thay đổi" **không làm gì**, không toast, không redirect. Vào được bằng một chạm
   từ bottom nav "Tài khoản" (`src/components/Footer.tsx:101`).
10. Người dùng mobile chưa đăng nhập **không có đường vào đăng nhập/đăng ký**. Link đó nằm
    trong thanh `hidden md:block` (`src/components/Header.tsx:76`, links ở 167-168); bottom
    nav cũng không có mục nào.
11. Cấu trúc heading: **không có `<h1>`** ở `/category/[slug]`, `/profile`,
    `/profile/change-password`, `/reset-password`, `/forgot-password`,
    `/profile/orders/[id]`, `/admin/settings`, `/chat`. **h2 trước h1** ở
    `src/app/search/page.tsx` (filter h2 dòng 90, h1 dòng 120). Nhảy cấp ở `/admin`,
    `/notifications`, `/addresses`, `/shop`. Ngoài ra `src/app/admin/settings/page.tsx:40`
    lồng `<main>` trong `<main id="main">` của layout — hai landmark main.
12. `src/app/shop/page.tsx:50-109` — effect đọc `targetSellerId` nhưng **mảng dependency
    rỗng**. Đi từ `/shop?seller=5` sang `/shop?seller=9` không remount → thấy tên, follower
    và hàng của người bán A kèm nút follow của người bán B.
13. Control chết đã được audit tô lại màu nhưng không nối: ô "Khoảng Giá" + nút "ÁP DỤNG" ở
    `src/app/category/[slug]/page.tsx:76-80`; toàn bộ `/admin/settings`;
    `src/app/register/page.tsx:47` đẩy sang `/login?registered=1` mà `/login` không đọc
    `searchParams`; `src/components/Footer.tsx:72` dùng `pb-safe` — **không phải class
    Tailwind 3.4** và không có plugin safe-area, nên compile ra rỗng.

---

## P2 — nên sửa

14. Vùng chạm dưới 44px: `src/components/StockControl.tsx:46,57` nút `-`/`+` bản `mini` chỉ
    **20×20px**, không `aria-label`, lại nằm trong một `<Link>` phủ cả thẻ — bấm trượt là
    điều hướng đi mất. Tương tự `src/app/notifications/page.tsx:127`, nút đóng của
    `Toast.tsx`, và `src/app/product/[id]/page.tsx:255-257`.
15. `role="alert"` được thêm cho banner lỗi ở `/login` nhưng **không** cho banner y hệt ở
    `src/app/register/page.tsx:82`.
16. `src/lib/format.ts` không đạt mục đích đã ghi trong docstring: chỉ trang chủ import. Còn
    **bốn** kiểu hiển thị tiền khác nhau sống song song ở `/cart`, `/checkout`,
    `/category/[slug]:125-126`, `/search:192`, `/shop:326`.
17. `src/lib/http.ts:25-31` — mọi 401 đều xoá localStorage và nhảy `/login`, chỉ trừ đường
    dẫn chứa `/login`. `/register`, `/forgot-password`, `/reset-password` **không được trừ**
    → mất sạch dữ liệu form giữa chừng. Ngoài ra `localStorage.removeItem` (dòng 26) chạy
    **trước** guard `typeof window !== 'undefined'` (dòng 28). File này **không hề nằm trong
    diff của đợt audit** dù có trong phạm vi.
18. Import chết: `CheckCircle` (`product/[id]:6`), `Check` + `UserMinus` (`shop:6`),
    `userService` (`profile:8`), `Link` (`reset-password:4`);
    `src/app/checkout/page.tsx:34` `const SHIPPING_FEE: number = 0` làm nhánh `else` thành
    code không bao giờ chạy.
19. **Chưa xác minh:** `src/components/Header.tsx:20` gọi `useSearchParams()` trong client
    component render từ root layout, không có `<Suspense>` bao ngoài. Trên Next 14.2 việc này
    thường làm **hỏng build** (`missing-suspense-with-csr-bailout`). Có sẵn từ trước, không do
    đợt này. **Chưa chạy `npm run build` nên chưa kết luận được** — cần một lượt build trước
    khi merge.

---

## Những gì đợt audit làm đúng (đã kiểm chứng)

Form tìm kiếm mobile submit được (`Header.tsx:180` + `handleSearchSubmit:42`); mọi link footer
trỏ route thật, hết `href="#"` và hết ảnh hotlink; Firebase khởi tạo lazy sau
`isFirebaseConfigured` và nút Google tự ẩn thay vì trắng trang (`src/lib/firebase.ts:24-35`);
`/search` và `/product/[id]` phân biệt được lỗi API với rỗng và có đường thử lại; contrast
chữ trên thẻ ví nền tối đã sửa thật; skip link, `prefers-reduced-motion`, `error.tsx`,
`global-error.tsx`, `loading.tsx` đều mới và đúng.
