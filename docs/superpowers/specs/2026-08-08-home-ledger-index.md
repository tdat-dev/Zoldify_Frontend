# Trang chủ Zoldify — hướng "Ledger Index"

Ngày: 2026-08-08
Trạng thái: đang dựng

---

## 1. Phân loại

```yaml
surface_route: LANDING_BRAND
work_mode:     REDESIGN
modifiers:     COMMERCE, NO_MEDIA, CONSTRAINED
scope:         src/app/page.tsx, src/components/home/*, Header, thang bo góc toàn cục
```

## 2. Bản đồ sự thật

| ID | Sự thật | Nguồn |
|---|---|---|
| F1 | Sàn C2C mua bán đồ cũ cho sinh viên | `README.md` |
| F2 | Mỗi món là hàng đã qua sử dụng, thường chỉ có **một** cái | `ProductStatus` có `sold`; `stock` thường 1 |
| F3 | Món có `condition` (new/used), `seller`, `sold`, `stock`, `price` | `product.entity.ts` |
| F4 | Thanh toán: COD, ví Zoldify, PayOS | `payment.enum.ts` |
| F5 | Có 6 loại trạng thái, đọc từ backend | `2026-08-06-...-design.md` §4.2 |

**Không có nguồn** (cấm dựng lên trang): số người dùng, điểm đánh giá tổng, số lượt đánh giá,
giá gốc / phần trăm giảm, khuyến mãi, đếm ngược. Đã xoá `src/lib/demo.ts` ngày 2026-08-07.

**Tuyên bố chưa chứng minh được**: "Zoldify giữ tiền tới khi bạn nhận hàng" ở `AnnounceBar`.
Escrow trong backend không có đường thoát khỏi `HOLDING` và `PATCH /orders/:id/status` không
kiểm vai trò. Ghi nhận là rủi ro thuộc chủ dự án, chưa gỡ vì ngoài phạm vi được giao.

## 3. Macrostructure và luật diversification

Đọc `~/.premium-web/log.json` trước khi chốt. Ba lần chạy gần nhất:

| Ngày | Dự án | Macrostructure |
|---|---|---|
| 2026-08-06 | zoldify-frontend | Marquee Hero |
| 2026-08-04 | trannhuasmc | custom: Panel Grid Gallery |
| 2026-08-01 | wakercreator-studio | Production Docket |

Chọn **Ledger Index** (catalog #8). Khác cả ba. Lý do khớp nội dung chứ không phải để tránh trùng:

- F2 — mỗi món độc nhất, nên lưới thẻ đều tăm tắp (ngôn ngữ của hàng sản xuất hàng loạt) nói
  sai bản chất. Sổ kê từng dòng nói đúng.
- F3 — mỗi món cần nhiều metadata cạnh nhau (tình trạng, người bán, giá, thời điểm đăng).
  Hàng ngang chứa được; thẻ vuông thì phải cắt bớt.
- Khi ít hàng, một cuốn sổ vài dòng vẫn ra cuốn sổ. Một lưới thẻ 3 ô thì ra "hỏng".

**Va chạm phải ghi nhận:** `palette_family`, `display_family`, `accent_hue_band` **trùng
nguyên vẹn** với lần chạy 2026-08-06. Không đổi, vì:
- bảng màu (#2C67C8 + đỏ cho giá) là quyết định trực tiếp của chủ dự án trong phiên 2026-08-06,
  và đỏ-cho-giá là quy ước người mua Việt đã đọc quen;
- Be Vietnam Pro giữ lại vì dấu tiếng Việt ở 13–14px trong lưới dày là chỗ font Latin-first vỡ.
Đây là ngoại lệ identity-preservation, không phải quên đọc luật.

## 4. Chiến lược màu và kiểm phản xạ

`RESTRAINED` — trung tính chiếm mặt bằng, xanh thương hiệu dưới 10% diện tích, đỏ chỉ dành cho giá.

**Kiểm phản xạ theo danh mục, bậc 1:** sàn TMĐT → xanh dương là màu ai cũng đoán ra. Vẫn giữ,
ngoại lệ đã ghi ở §3 (quyết định của chủ dự án + quy ước người đọc).
**Bậc 2:** "sàn TMĐT nhưng không xanh → tối + neon" là phản xạ tầng sâu hơn. Không đi hướng đó.

**Reflex registry 2026 — tín hiệu trên bề mặt này:**

| ID | Có mặt? | Ghi chú |
|---|---|---|
| RR-01 hero chia đôi | không | đã gỡ 2026-08-07 |
| RR-02 chồng section kiểu generator | không | trang còn 3 tầng |
| RR-03 bento + bo góc lớn | không | hướng này đi ngược: hairline, góc gần vuông |
| RR-15 fade-up lặp lại | 1 (nhẹ) | `animate-rise` chỉ ở 3 phần tử của masthead, không rải mọi section |
| RR-16 eyebrow + đánh số 01/02 | không | không đánh số dòng: thứ tự "mới đăng" đã tự mang nghĩa |

Một tín hiệu — dưới ngưỡng can thiệp (2).

## 5. Bo góc — thang mới

Chủ dự án yêu cầu giảm bo góc. Thang cũ (control 10 / card 14 / modal 16) cộng với
`rounded-full` ở ô tìm kiếm và chip là ngôn ngữ "app thân thiện", ngược với sổ kê.

| Vai trò | Cũ | Mới |
|---|---|---|
| control (nút, ô nhập) | 10px | **4px** |
| card / khối | 14px | **4px** |
| modal | 16px | **8px** |
| pill | tròn hoàn toàn | **bỏ** — chip và ô tìm kiếm thành hình chữ nhật |

## 6. Cấu trúc trang

Ba tầng, giữ nguyên mạch TÌM → DANH MỤC → HÀNG.

**Masthead** — không phải hero panel. Một câu, một dòng dẫn, một lối đi. Ngăn bằng hairline.

**Chỉ mục danh mục** — hàng chữ ngăn bằng hairline, kèm số món nếu API trả về. Không phải ô
bo góc có icon.

**Sổ hàng** — mỗi món MỘT DÒNG:

```
[ảnh 56px] Tên món                          Tình trạng · Người bán      380.000₫
           đăng 2 giờ trước                                             [Thêm vào giỏ]
```

Giá canh phải, dùng `tabular-nums` để cột số thẳng hàng — đây là lý do kỹ thuật thật của
sổ kê, không phải trang trí.

## 7. Ambition gates — trạng thái dự kiến

| Gate | Trạng thái | Lý do |
|---|---|---|
| A — media | **thất bại, có lý do** | `cliproxy.zoldify.com` trả 502 (3 lần thử, 2 phiên); `fal`/`openai`/`gemini` chưa có key. Đi hướng media-free có chủ đích: cấu trúc và hairline gánh art direction. Không đặt hình khối giả vào chỗ của ảnh. |
| B — mạo hiểm bố cục | nhắm đạt | Cột giá tràn ra ngoài lề phải của khung nội dung; masthead lệch trục so với sổ hàng |
| C — chữ | nhắm đạt một phần | Không có khoảnh khắc chữ cỡ viewport: đã thử 136px ngày 2026-08-07, đo ra đẩy nội dung xuống dưới màn hình. Đánh đổi nghiêng về công năng, ghi rõ. |
| D — chuyển động | nhắm đạt | Masthead vào có thứ tự; dòng hàng đổi trạng thái khi hover/focus; tất cả bằng transform |
| E — tương tác đặc trưng | nhắm đạt | Xem §8 |

Gate A thất bại không được miễn → trần sáng tạo **CLEAN BASELINE**. Ghi thẳng trong báo cáo,
không gọi là "premium".

## 8. Tương tác đặc trưng

`signature:` **Cột phải của mỗi dòng đổi giữa GIÁ và HÀNH ĐỘNG.** Ở trạng thái nghỉ, cột phải
là con số — mắt quét dọc được cả cột giá, đúng cách người ta đọc một sổ kê và đúng cái sinh
viên lọc trước tiên. Khi trỏ hoặc tab vào dòng, con số trượt lên nhường chỗ cho "Thêm vào giỏ"
tại **đúng vị trí đó**, không phải một nút nằm sẵn ở chỗ khác.

Thuộc về sản phẩm này vì: giá là tiêu chí lọc số một của người mua đồ cũ, và mỗi món chỉ có một
cái nên hành động luôn là "lấy món này", không có biến thể để chọn. Dán sang site khác thì mất
nghĩa. Bàn phím có cùng hành vi qua `focus-within`; `prefers-reduced-motion` thì đổi tức thì
không trượt.

## 9. Ngoài phạm vi

Không đụng backend. Không thêm route. Trang tìm kiếm và danh mục vẫn dùng `ProductCard` dạng
thẻ ở đợt này — chuyển sang dạng dòng cho khớp là việc của đợt 3.
