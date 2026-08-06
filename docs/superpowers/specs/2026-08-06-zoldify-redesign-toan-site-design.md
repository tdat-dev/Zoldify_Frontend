# Zoldify — thiết kế lại toàn site theo một hệ thống

Ngày: 2026-08-06
Trạng thái: đã duyệt hướng, chưa dựng
Tiếp nối: `2026-08-06-zoldify-homepage-design.md` (trang chủ) — bản này mở rộng ra 39 trang còn lại

---

## 1. Phân loại

```yaml
surface_route: DASHBOARD_PRODUCT   # phần lớn là UI chức năng: bảng, biểu mẫu, luồng mua
work_mode:     REDESIGN            # code đã chạy; đổi diện mạo, không đổi nghiệp vụ
modifiers:     COMMERCE, DENSE_DATA, CONSTRAINED
scope:         toàn bộ src/app + src/components của Zoldify_Frontend
ngoại lệ:      src/app/page.tsx và src/components/Header.tsx đã đạt mốc — chỉ đổi để ăn token chung
```

## 2. Vấn đề — đo được, không phỏng đoán

Bốn con số dưới đây là bằng chứng, lấy bằng `grep`/`find` trên `src/` ngày 2026-08-06.
Chúng giải thích vì sao site "chưa xịn" mà không ai chỉ ra được chỗ nào sai.

| # | Đo được | Hệ quả người dùng thấy |
|---|---|---|
| 1 | **1.050 lượt** dùng bảng màu mặc định Tailwind (`bg-gray-*`, `text-blue-*`, `border-gray-*`…) trên **46 file**. Nặng nhất: `admin/orders` 75, `shop/orders` 67, `admin/users` 63, `product/[id]` 51, `product/create` 48, `admin/page` 48. | Rời trang chủ là rơi vào một sản phẩm khác. Xanh của nút không phải xanh thương hiệu. |
| 2 | Container chính có **9 bề rộng khác nhau**: 1400 (đăng nhập/đăng ký/quên MK), 1240 (trang chủ), 1280 = `7xl` (admin), 1200 (giỏ/thanh toán/tìm kiếm/danh mục/sản phẩm/shop), 1152 = `6xl`, 1024 = `5xl`, 1000 (chat), 896 = `4xl`, 800. | Chuyển trang là nội dung nhảy trái–phải. |
| 3 | Cỡ chữ đặt bằng px tuỳ hứng: `text-[13.5px]`, `text-[14.5px]`, `text-[11.5px]`, `text-[16px]`, `text-[12.5px]`… mỗi file tự chọn. | Không có thứ bậc chữ nhất quán giữa các trang. |
| 4 | **5 trang đơn hàng** (`admin/orders`, `shop/orders`, `profile/orders`, `profile/orders/[id]`, `payment/return`) mỗi trang tự bịa một bảng màu trạng thái bằng `yellow-100`/`green-100`/`red-100`. | Cùng một trạng thái "Chờ xác nhận" có thể ra hai màu ở trang người mua và người bán. |

Thêm hai mâu thuẫn ở tầng nền:

- `globals.css` khai báo `--surface-page` (trắng gần tuyệt đối) **nhưng** `body { @apply bg-gray-50 }`
  và `layout.tsx` bọc `div.bg-gray-50` — token nền trang không bao giờ có tác dụng.
- `globals.css` giữ nguyên bộ biến HSL mặc định của shadcn với `--primary: 221.2 83.2% 53.3%`
  (xanh shadcn), **không phải** `#2C67C8` của Zoldify. Cài shadcn mà để nguyên thì mọi
  component mới mang sai màu thương hiệu.

Ngoài ra `ARCHITECTURE.md` ở gốc frontend vẫn mô tả một project PHP thuần tên "UniMarket" —
không còn đúng với Next.js hiện tại. Sửa trong đợt 0.

## 3. Hướng đã chốt với chủ dự án

- **Phạm vi:** toàn site, gồm cả admin.
- **Thẩm mỹ:** giữ hướng hiện tại — xanh thương hiệu `#2C67C8` + đỏ cho giá, đúng quy ước sàn
  TMĐT Việt mà người mua đã đọc quen. Nâng bằng thứ bậc, khoảng cách, trạng thái tử tế;
  **không** đổi bảng màu, **không** chuyển sang hướng editorial.
- **Stack:** thêm `shadcn/ui`.
- **Cách làm:** dựng tầng nền trước rồi di cư từng cụm trang (không đi từng trang tuỳ hứng —
  đó chính là cách site rơi vào tình trạng hiện tại).
- **Nghiệm thu:** chủ dự án tự chạy backend + frontend, cung cấp URL localhost; mọi kết luận
  về giao diện phải dựa trên trang đã render, không dựa trên đọc code.

## 4. Tầng nền — token

### 4.1 Một nguồn sự thật cho màu

Giữ token ngữ nghĩa của Zoldify làm gốc (`--brand`, `--price`, `--ink*`, `--surface-*`).
Định nghĩa lại toàn bộ biến shadcn trỏ về đúng các giá trị đó: `--primary` → xanh Zoldify,
`--destructive` → đỏ giá, `--background`/`--card` → surface, `--foreground` → ink,
`--muted-foreground` → ink-muted, `--border`/`--input` → viền ink 8–12%, `--ring` → brand.

Xoá `body { @apply bg-gray-50 }` trong `globals.css` và `bg-gray-50` trong `layout.tsx`;
nền trang do `--surface-page` quyết định.

### 4.2 Màu trạng thái (mới)

Năm vai trò, mỗi vai trò một cặp chữ/nền đã đo đạt 4.5:1:

| Vai trò | Dùng cho |
|---|---|
| `state-pending` | Chờ xác nhận, chờ thanh toán |
| `state-progress` | Đang xử lý, đang giao |
| `state-success` | Hoàn tất, đã thanh toán |
| `state-danger` | Đã huỷ, thất bại |
| `state-neutral` | Nháp, lưu trữ, không xác định |

Ánh xạ mã trạng thái backend → vai trò nằm ở **một chỗ duy nhất**, trong `StatusBadge`.

### 4.3 Thang chữ

Khai báo trong `tailwind.config.ts` để không ai phải gõ px tuỳ hứng nữa:

| Tên | Cỡ / dòng | Trọng lượng | Dùng cho |
|---|---|---|---|
| `display` | 28 / 34 | 700 | Tiêu đề hero |
| `h1` | 22 / 28 | 700 | Tiêu đề trang |
| `h2` | 18 / 24 | 700 | Tiêu đề khối |
| `h3` | 15 / 20 | 600 | Tiêu đề thẻ, tên sản phẩm |
| `body` | 14 / 22 | 400 | Nội dung |
| `small` | 13 / 18 | 400 | Phụ chú, nhãn nút |
| `caption` | 11.5 / 16 | 600 | Nhãn viết hoa, đơn vị |

Font giữ nguyên **Be Vietnam Pro**, một họ nhiều trọng lượng. Không thêm font thứ hai:
lý do như đã ghi trong `tailwind.config.ts` — dấu chồng tiếng Việt (ữ, ề, ộ) ở 13–14px trong
lưới dày là chỗ font Latin-first vỡ.

### 4.4 Bo góc, độ nổi, chuyển động

- Bo: control 10px (nút, ô nhập) · card 14px · modal 16px · pill tròn hoàn toàn.
- Độ nổi đúng 3 mức: (0) chỉ viền, khối tĩnh — (1) bóng nhẹ khi hover thẻ — (2) bóng sâu cho
  dropdown/modal/sheet. Không có mức thứ tư.
- Chuyển động: chỉ `transform` và `background-color`, 150–250ms, một đường cong duy nhất.
  **Không** dùng `opacity: 0` làm trạng thái vào của cả khối — nếu trigger không chạy thì khối
  biến mất vĩnh viễn. Khối `prefers-reduced-motion` đã có trong `globals.css`, giữ nguyên.

### 4.5 Nhịp khoảng cách

Cơ số 4px. Nhịp giữa các khối trong trang: 36px (mobile) / 44px (desktop) — đúng nhịp
`gap-9 md:gap-11` trang chủ đang dùng. Padding thẻ: 12 / 16 / 20 tuỳ mật độ.

## 5. Bộ component dùng chung

### 5.1 Lấy từ shadcn/ui

Button, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, DropdownMenu, Tabs, Table,
Tooltip, Sheet, Skeleton, Popover, Separator.

Lý do lấy shadcn thay vì tự viết: phần điều hướng bàn phím và quản lý focus của Radix bên dưới
Select/Dialog/DropdownMenu là thứ tự viết cho đúng rất tốn công và rất dễ sai.

Việc cài kéo theo: `components.json`, `class-variance-authority`, `tailwindcss-animate`
(chưa có trong `plugins` của `tailwind.config.ts`), các gói `@radix-ui/*` tương ứng, và
`src/lib/utils.ts` với hàm `cn()` — `clsx` và `tailwind-merge` đã có trong `package.json`
nhưng **chưa có** file `utils.ts` nào export `cn`.

### 5.2 Component riêng của Zoldify

| Component | Việc nó làm |
|---|---|
| `PageShell` | Khoá bề rộng container và nhịp lề dọc. Có biến thể `wide` (1240) / `narrow` (600) / `form` (800). Xoá 9 bề rộng rời rạc ở mục 2.2. |
| `PageHeader` | Tiêu đề trang + mô tả + vùng hành động + breadcrumb. |
| `StatusBadge` | Nơi duy nhất ánh xạ trạng thái → màu. Thay 5 bảng màu tự bịa. |
| `PriceTag` | Giá chính + giá gạch + phần trăm giảm, đúng quy ước đỏ. |
| `EmptyState` | Biểu tượng + câu giải thích + hành động kế tiếp. |
| `ErrorState` | Câu lỗi người thật đọc được + nút thử lại. |
| `FormField` | Nhãn + trường + câu lỗi + `aria-describedby` nối đúng. |
| `Pagination` | Phân trang dùng chung cho tìm kiếm/admin/shop. |
| `ConfirmDialog` | Xác nhận hành động phá huỷ (xoá sản phẩm, huỷ đơn). |
| `OrderTimeline` | Dòng thời gian trạng thái đơn hàng. |
| `DataTable` | Xem 5.3. |

`Toast` đã tồn tại và được gọi ở nhiều file — **giữ nguyên API**, chỉ thay lớp vỏ theo token,
để không phải sửa lời gọi rải rác.

`ProductCard` đã dựng kỹ ở đợt trang chủ — chuẩn hoá để dùng lại ở tìm kiếm, danh mục,
shop, "sản phẩm của tôi" thay vì mỗi trang tự dựng một thẻ.

### 5.3 `DataTable` — nâng cấp có sức nặng nhất

Sáu trang bảng (`admin/orders`, `admin/users`, `admin/products`, `admin/categories`,
`shop/orders`, `profile/products`) đều là bảng nhiều cột đặt trong `overflow-x-auto`.
Trên điện thoại người dùng phải kéo ngang mới đọc được một dòng — đây là thứ khiến một sàn
trông nghiệp dư rõ nhất, và nó lặp lại 6 lần.

`DataTable` nhận định nghĩa cột, và **dưới breakpoint `md` tự đổi sang danh sách thẻ**:
mỗi bản ghi một thẻ, cột chính làm tiêu đề, các cột phụ thành cặp nhãn–giá trị, hành động
gom vào một menu. Một lần dựng, sáu trang hưởng.

## 6. Ba khung trang

Mọi trang phải nằm trong một trong ba khung; không trang nào tự đặt bề rộng nữa.

**Khung công khai** — trang chủ, tìm kiếm, danh mục, chi tiết sản phẩm, giỏ, thanh toán,
kết quả thanh toán, đăng nhập/đăng ký. Giữ `AnnounceBar + Header + Footer` hiện có, bọc nội
dung bằng `PageShell`.

**Khung tài khoản** — `/profile/*`, `/addresses/*`, `/notifications`, `/shop/*`.
Thêm cột điều hướng dọc bên trái: Hồ sơ · Đơn mua · Ví · Địa chỉ · Sản phẩm của tôi ·
Đơn bán · Tin nhắn. Hiện các trang này đứng rời nhau: muốn từ "Đơn mua" sang "Ví" phải mở lại
menu ở header. Dưới `md`, cột này thu thành hàng tab cuộn ngang.

**Khung admin** — `admin/layout.tsx` hiện chỉ 887B. Nâng thành sidebar cố định + thanh tiêu đề,
nội dung dùng `DataTable`. Dưới `md` sidebar thành `Sheet`.

## 7. Lộ trình — 7 đợt, mỗi đợt một commit

| Đợt | Nội dung | File chính |
|---|---|---|
| **0** | Tầng nền: token, cài shadcn map về màu Zoldify, `utils.ts`/`cn`, bộ primitive, `DataTable`, 3 khung trang. Quét đổi bảng màu cũ sang token trên toàn bộ file. Sửa `ARCHITECTURE.md`. **Chưa đổi bố cục trang nào.** | `globals.css`, `tailwind.config.ts`, `layout.tsx`, `src/components/ui/*` |
| **1** | Chi tiết sản phẩm + đăng bán + sửa sản phẩm | `product/[id]`, `product/create`, `product/[id]/edit` |
| **2** | Giỏ + thanh toán + kết quả thanh toán | `cart`, `checkout`, `payment/return`, `payment/cancel`, `cart/success` |
| **3** | Tìm kiếm + danh mục; bộ lọc thành `Sheet` trên mobile | `search`, `category/[slug]` |
| **4** | Tài khoản: hồ sơ, đơn mua, ví, địa chỉ, thông báo, đổi mật khẩu + 4 trang xác thực | `profile/*`, `addresses/*`, `notifications`, `login`, `register`, `forgot-password`, `reset-password` |
| **5** | Shop người bán | `shop`, `shop/orders`, `profile/products` |
| **6** | Admin 6 trang + chat | `admin/*`, `chat` |

Trang chủ và `Header` không nằm trong đợt nào — chỉ đổi để ăn token chung ở đợt 0.

## 8. Cổng nghiệm thu — áp cho từng đợt

Một đợt chỉ được coi là xong khi qua hết bảy mục:

1. Ảnh chụp trước/sau ở **390px** và **1440px** cho mọi trang trong đợt.
2. Contrast đo bằng **lấy mẫu pixel thật** trên trang đã render, không đọc `getComputedStyle`.
   Lý do: với nút gradient, computed style trả về màu nền trong suốt và bỏ sót lỗi thật;
   với màu OKLCH, parser regex đọc `oklch(0.24 0.021 258)` thành RGB rác và sinh ra hàng chục
   lỗi ảo. Cách dùng chung cho mọi định dạng: `ctx.fillStyle = c` rồi đọc pixel.
3. `grep` ra **0** kết quả `bg-gray-*` / `text-blue-*` / `border-gray-*` trong các file đã migrate.
4. Đi hết trang bằng bàn phím: tab tới được mọi thứ bấm được, focus nhìn thấy rõ.
5. Không tràn ngang ở 390px.
6. Mọi trạng thái rỗng và lỗi đều có câu chữ người thật đọc được — không để trang trắng.
7. `npm run build` xanh.

## 9. Rủi ro kỹ thuật đã biết

**Bổ ngữ độ mờ trên màu khai báo bằng `var()`.** Code hiện dùng `border-ink/8`,
`ring-brand/15` — trong khi `ink` và `surface-*` được khai báo là `var(--ink)` (một màu OKLCH
hoàn chỉnh, không phải các kênh rời). Tailwind v3 có thể **bỏ im lặng** bổ ngữ độ mờ trong
trường hợp này, tức `border-ink/8` ra viền đặc thay vì viền 8%. Phải **đo trên trang đã render**
ở đợt 0 chứ không suy từ tài liệu. Nếu đúng là bị bỏ: chuyển các token cần độ mờ sang
`color-mix()` khai báo sẵn thành lớp tiện ích có tên, thay vì rắc bổ ngữ khắp nơi.

**shadcn ghi đè `globals.css`.** Lệnh `init` của shadcn sẽ muốn ghi lại khối `:root`.
Phải giữ token OKLCH của Zoldify; nếu bị ghi đè thì khôi phục rồi map thủ công.

**Trạng thái backend chưa biết đủ.** Danh sách mã trạng thái đơn hàng thật phải lấy từ
`Zoldify_Backend` trước khi cố định bảng ánh xạ trong `StatusBadge`, không đoán từ tên biến
ở frontend.

## 10. Ngoài phạm vi

Không đổi API, không đổi schema, không đổi luồng nghiệp vụ. Không thêm trang mới. Không đụng
`Zoldify_Backend` ngoài việc đọc để lấy danh sách mã trạng thái. Không làm dark mode —
chưa có yêu cầu, và làm nửa vời sẽ hỏng nhiều hơn được.
