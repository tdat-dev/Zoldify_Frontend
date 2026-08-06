# Trang chủ Zoldify — thiết kế "Giữ tiền hộ"

Ngày: 2026-08-06
Trạng thái: đã duyệt, chưa dựng

---

## 1. Phân loại

```yaml
surface_route: LANDING_BRAND     # bộ mặt thương hiệu; phần chợ bên dưới vẫn là landing
work_mode:     REDESIGN          # trang chủ đã tồn tại, được phép thay đổi lớn
modifiers:     MEDIA_FREE, MOTION_LED, COMMERCE, CONSTRAINED
scope:         chỉ src/app/page.tsx và tài sản kèm theo
```

Chỉ trang chủ `/`. `Header`, `Footer` và toàn bộ bản sửa lỗi ngày 2026-08-05 giữ nguyên,
không đụng tới.

## 2. Bản đồ sự thật (fact / claim / source)

Mọi câu chữ trên trang phải truy được về một dòng trong bảng này.

| # | Sự thật | Nguồn xác minh |
|---|---------|----------------|
| F1 | Tiền người mua trả được giữ ở trạng thái `HOLDING`, chỉ chuyển sang `RELEASED` cho người bán khi đơn được đánh dấu đã giao | `Zoldify_Backend/src/escrows/escrows.service.ts` (`createOrderEscrows`, `release`), `orders.service.ts:294-317` |
| F2 | Đơn huỷ hoặc hoàn thì escrow chuyển `REFUNDED` | `escrows.service.ts:78-89`, `orders.service.ts:335-338, 403-406` |
| F3 | Escrow được tạo tại thời điểm đơn chuyển sang `PAID`, không phải lúc đặt hàng | `orders.service.ts:294-297` |
| F4 | Sản phẩm, danh mục, giá, tồn kho là dữ liệu thật từ API | `product.service.ts`, `category.service.ts` |
| F5 | Phương thức thanh toán: COD, ví Zoldify, thẻ/QR qua PayOS | `src/app/checkout/page.tsx`, `payos.service.ts` |
| F6 | Khẩu hiệu sẵn có của dự án: "Đồ cũ, vẫn chất" | `README.md` |

**Giả định đã ghi nhận:** F1–F3 đọc từ mã nguồn, chưa chạy được end-to-end vì môi trường
thiếu MySQL. Nếu chạy thật mà cơ chế sai khác, **copy hero phải sửa trước khi phát hành** —
đây là claim công khai về tiền của người dùng.

**Không được nói:** bất kỳ con số nào về lượng người dùng, số giao dịch, đánh giá, thời gian
hoàn tiền, hay cam kết bảo hiểm. Không có nguồn nào cho những thứ đó.

## 3. Hướng đã chọn

### 3.1 Bộ khung

`Marquee Hero` — hero chiếm trọn màn hình đầu bằng một câu chữ khổ lớn, bên dưới là chợ
dạng lưới thẻ.

**Kiểm tra luật đa dạng (run-log):** 3 run gần nhất là `custom:Panel Grid Gallery`,
`Production Docket`, `Control Room Precision`. `Marquee Hero` khác cả ba. So với run gần
nhất (`trannhuasmc`: committed-navy / geometric-sans / yellow-amber) thì khác ở cả ba trục.

**Đã cân nhắc và loại:**

- `Ledger Index` (sổ hàng ngang) — tôi đề xuất đầu tiên, chủ dự án loại. Lý do của chủ dự án:
  người mua Việt Nam quen lưới thẻ. Chấp nhận: đây là quyết định về người dùng, không phải
  về thẩm mỹ.
- `Narrative Scroll` (3 màn kể chuyện escrow) — loại vì đẩy sản phẩm xuống quá sâu, phá mất
  nửa "vẫn dùng được" của mục tiêu.
- `Ticker Frame` — loại vì dính `RR-12` (marquee/ticker bão hoà) và cần dữ liệu thật liên tục
  mới không rỗng.

**Hệ quả phải nói rõ:** lưới thẻ là hình dạng bão hoà nhất của thương mại điện tử. Nửa dưới
trang chủ sẽ trông giống các sàn khác. Toàn bộ khác biệt dồn vào hero và đồng xu ký quỹ.
Không được mô tả trang này là "độc đáo toàn trang".

### 3.2 Màu

**Câu bối cảnh dùng (bắt buộc, nó ép ra sáng/tối):** sinh viên cầm điện thoại giá rẻ, ở hành
lang giảng đường nắng gắt hoặc phòng trọ đèn huỳnh quang, đang cân nhắc bỏ 45.000₫ mua một
cuốn giáo trình cũ.

→ **Nền sáng.** Tối là lựa chọn phong cách đi ngược môi trường dùng thật.

Chiến lược: `RESTRAINED` (trung tính + một màu nhấn dưới 10% diện tích).

Craft-rules yêu cầu ghi màu bằng không gian tri giác (OKLCH) và neutral ngả về hue thương
hiệu với chroma 0.005–0.015. Bảng dưới là giá trị chốt, không phải mô tả:

| Token | OKLCH | ~hex | Vai |
|-------|-------|------|-----|
| `--surface-page` | `oklch(0.983 0.006 258)` | `#F7F9FC` | Nền trang. Off-white **lạnh** ngả hue logo. KHÔNG kem/sand/giấy cũ — craft-rules cấm nền warm-neutral, mà ẩn dụ "sổ" cám dỗ đúng vào đó |
| `--surface-card` | `oklch(1 0 0)` | `#FFFFFF` | Thẻ sản phẩm, nổi lên trên nền trang |
| `--ink` | `oklch(0.24 0.021 258)` | `#151C28` | Chữ chính, near-black ám xanh |
| `--ink-muted` | `oklch(0.52 0.018 258)` | `#5D6B7E` | Chữ phụ. Đã tính đạt ≥4.5:1 trên `--surface-page`, phải đo lại khi render |
| `--brand` | `oklch(0.52 0.146 262)` | `#2C67C8` | Giữ nguyên từ logo. CTA và tiền |
| `--brand-accent` | `oklch(0.49 0.079 218)` | `#14708A` | Đầu teal của gradient. Đã sửa 05-08 cho đạt contrast |

Màu nhấn (`--brand`, `--brand-accent`) **chỉ** xuất hiện ở: CTA chính, đồng xu, giá tiền,
ba chặng cơ chế. Cộng lại dưới 10% diện tích màn hình đầu.

**Kiểm phản xạ category hai tầng:**
- Tầng 1: sàn TMĐT → cam (Shopee). Không dùng.
- Tầng 2: "sàn nhưng không cam → xanh tin cậy". Đây mới là phản xạ sâu hơn, và ta đang dùng xanh.
- **Biện minh:** logo `logouni.png` đã có sẵn gradient xanh→teal, đây là *identity preservation*
  chứ không phải chọn mới. Thêm nữa, xanh không ôm cả hai vai: nền là off-white, xanh chỉ làm
  màu của tiền. Craft-rules cấm màu category giữ đồng thời nền và nhấn — ở đây không vi phạm.

### 3.3 Chữ

**Đã chọn: Archivo**, dùng một họ duy nhất.

| Vai | Cỡ | Thiết lập |
|-----|-----|-----------|
| Display hero | `clamp(3.25rem, 9vw, 8.5rem)` | `wght 900`, `wdth 125`, `line-height 0.92`, `letter-spacing -0.035em` |
| Nhãn / eyebrow | `0.8125rem` | `wght 600`, `wdth 62` (condensed), `letter-spacing 0.08em`, uppercase — tương phản **bề rộng**, không phải chỉ cỡ |
| Hero phụ | `clamp(1rem, 1.5vw, 1.25rem)` | `wght 400`, `wdth 100`, `line-height 1.55`, `text-wrap: pretty`, `max-width: 46ch` |
| Tiêu đề mục | `clamp(1.5rem, 2.5vw, 2.25rem)` | `wght 800`, `wdth 112`, `text-wrap: balance` |
| Tên sản phẩm | `0.875rem` | `wght 450`, `wdth 100`, `line-height 1.4` |
| Số tiền | `1rem` | `wght 700`, `font-variant-numeric: tabular-nums` |

Trần `clamp` của display là `8.5rem` = 136px. Craft-rules đặt trần 6rem cho **tiêu đề mục**,
và cho phép đúng **một** display moment vượt trần trên `LANDING_BRAND` dưới Gate C. Tiêu đề
mục ở bảng trên là `2.25rem`, nằm trong trần. Chỉ hero vượt, và chỉ một lần.

**Quy trình casting đã thực hiện:**

1. Ba từ mô tả chất: *chắc, hành chính, giữ được* (vật thể, không phải "hiện đại/thanh lịch").
2. Phản xạ đầu tiên của tôi: Be Vietnam Pro. **Loại** — run-log cho thấy đã dùng ở 2 run gần
   đây (`lo-chum` 07-19, `wakercreator` 07-21), nó đang thành phản xạ của chính tôi.
3. Reflex-reject list: đã loại Inter, DM Sans, Outfit, Plus Jakarta, Space Grotesk và các mục khác.
4. **Kiểm phủ tiếng Việt bằng render thật, không giả định** (đây là casting gate):
   - Xác minh subset qua Google Fonts API: `Sora` và `Figtree` **không có** subset vietnamese → loại ngay.
   - Render "GIỮ / TIỀN HỘ" ở 104px cho 4 ứng viên còn lại, ảnh: `scratchpad/type-test.png`.
   - `Bricolage Grotesque` và `Anybody`: chữ số quái, tên sản phẩm tiếng Việt bị rung ở cỡ nhỏ.
     **Loại** — một sàn toàn giá tiền và tên hàng thì đây là hỏng ở chỗ quan trọng nhất.
     (Bricolage là lựa chọn tôi định chốt trước khi render; render mới thấy sai.)
   - `Epilogue`: dùng được nhưng nhạt hơn.
   - `Archivo`: dấu tiếng Việt gọn, và dòng body dưới nó dễ đọc nhất trong bốn mẫu. **Chọn.**
5. Cross-check: kết quả khác phản xạ ban đầu (Be Vietnam Pro → Archivo). Đạt.

**Phát hiện đo được, phải tuân thủ khi dựng:** ở `line-height 0.84`, khoảng cách dòng đo được
là **âm 18–20px**; mũ của `Ề`, `Ộ` ở dòng dưới thụt lên vùng chân dòng trên. Với đúng chuỗi
"GIỮ / TIỀN HỘ" thì thoát vì `GIỮ` không có nét thòng, nhưng đổi một chữ là vỡ.
→ **Dùng `line-height: 0.92` và `padding-top` riêng để dấu không bị cắt.** Không dùng 0.84.

### 3.4 Chữ nghĩa

| Vị trí | Nội dung | Truy nguồn |
|--------|----------|-----------|
| Hero display | GIỮ TIỀN HỘ | F1 |
| Hero phụ | Bạn chuyển tiền cho Zoldify, không chuyển cho người lạ. Người bán chỉ lấy được khi bạn bấm đã nhận hàng. | F1 |
| CTA chính | Tìm giáo trình, đồ dùng | F4 |
| CTA phụ | Đăng bán đồ của bạn | — |
| Mục chợ | Đang bán ở Zoldify | F4 |
| Mục cơ chế | Tiền đi đường nào | F1, F2, F3 |
| Dòng thương hiệu | Đồ cũ, vẫn chất | F6 — viết thường, không Title Case |

**Đã chạy các bài kiểm tra của copy-voice:**

- *Competitor-swap*: "Giữ tiền hộ" dán sang Chợ Tốt là sai (họ không giữ tiền), sang Shopee
  cũng lệch (không nhắm sinh viên). Đạt.
- *Cadence column*: các tiêu đề và CTA có hình dạng ngữ pháp khác nhau (mệnh lệnh / trần thuật
  / danh ngữ / câu hỏi không dấu hỏi). Không lặp khuôn. Đạt.
- *Punctuation*: không em-dash, không emoji, sentence case, không dấu chấm than.
- *Ban-list*: không dùng "giải pháp toàn diện", "trải nghiệm liền mạch", "nâng tầm", "đồng hành
  cùng bạn", "không chỉ… mà còn…".
- Không dùng lại "Cam kết nhận hàng hoặc hoàn tiền" (đã gỡ ngày 05-08 vì không có trang chính
  sách). Câu mới **mô tả cơ chế**, không hứa chính sách — khác nhau về bản chất.

## 4. Ambition gates

| Gate | Cách thoả | Trạng thái |
|------|-----------|-----------|
| **A · Media** | Media-free **có chủ đích**. Đã probe: tool sinh ảnh `mcp__wakermcp__generate_image` **có tồn tại trong harness**; chủ dự án chọn không dùng vì ảnh AI "sinh viên cầm giáo trình" ra đúng kiểu stock vô hồn. Art direction do chữ khổ lớn + SVG cơ chế gánh, và chúng là *chủ thể* của thiết kế, không phải chỗ trống chờ ảnh. | Thoả (media-free by choice, đã ghi trần) |
| **B · Composition risk** | Chữ display tràn hẳn khỏi mép trái canvas; thẻ đầu tiên của lưới chui lên nằm dưới nét chữ. Một điểm phá duy nhất, có khoảng lặng quanh nó. | Thoả |
| **C · Type bravery** | Hero ~9vw, tương phản **bề rộng** (expanded 125 cạnh condensed 62), ngắt dòng có nghĩa, leading siết 0.92, test tràn ở mọi breakpoint. | Thoả |
| **D · Motion** | (1) Chữ vào theo thứ tự bằng `transform`, nội dung hiện sẵn không phụ thuộc animation. (2) Đồng xu đi theo scroll. (3) Micro-interaction ở CTA và thẻ sản phẩm. Có nhánh `prefers-reduced-motion` đầy đủ. | Thoả |
| **E · Signature** | **Đồng xu ký quỹ** — xem 4.1 | Thoả |

### 4.1 Signature interaction

```
signature: Đồng xu nằm bên trong chữ "GIỮ" của hero. Khi cuộn, nó rời khỏi chữ, chạy hết
ba chặng của cơ chế ký quỹ (bạn trả → Zoldify giữ → người bán nhận), rồi đậu lại thành ký
hiệu ₫ ở giá của thẻ sản phẩm đầu tiên.
```

Vì sao nó thuộc về chủ thể này: một vật thể duy nhất mang đúng lời hứa của sản phẩm, và
đích đến của nó là một mức giá thật. Dán sang site khác là mất nghĩa.

**Ràng buộc trung thực:** đồng xu chỉ minh hoạ **cơ chế chung**, không gắn với đơn hàng nào.
Không được vẽ trạng thái tiền lên từng tin đăng — tin chưa bán thì chưa có escrow, vẽ vào là
bịa dữ liệu. (Đây là lý do bản phác đầu tiên có thanh trạng thái ở mép trái mỗi dòng đã bị bỏ;
nó còn dính structural ban #1 side-stripe accent.)

## 5. Cấu trúc trang

```
┌─ HERO (100vh) ────────────────────────────────┐
│  eyebrow condensed: Đồ cũ, vẫn chất           │
│  GIỮ ●            ← ● = đồng xu SVG trong chữ │
│  TIỀN HỘ          ← tràn khỏi mép trái        │
│  Bạn chuyển tiền cho Zoldify, không chuyển…   │
│  [Tìm giáo trình, đồ dùng] [Đăng bán đồ…]     │
└───────────────────────────────────────────────┘
┌─ TIỀN ĐI ĐƯỜNG NÀO ───────────────────────────┐
│  ba chặng, đồng xu chạy qua theo scroll        │
│  bạn trả → Zoldify giữ → người bán nhận        │
└───────────────────────────────────────────────┘
┌─ DANH MỤC ────────────────────────────────────┐
│  giữ nguyên cấu trúc hiện có                   │
└───────────────────────────────────────────────┘
┌─ ĐANG BÁN Ở ZOLDIFY ──────────────────────────┐
│  lưới thẻ sản phẩm (thẻ đầu chui dưới chữ hero)│
│  dùng lại ProductCard + SectionState đã có     │
└───────────────────────────────────────────────┘
```

Mục "Sản phẩm nổi bật" và "Sản phẩm mới nhất" hiện tại gộp thành một mục "Đang bán ở Zoldify",
vì bản audit đã cho thấy chúng từng render trùng dữ liệu.

## 6. Trạng thái và biên

Tái dùng `SectionState` và `ProductCard` đã viết ngày 05-08 — không viết lại.

| Trạng thái | Hành vi |
|-----------|---------|
| Đang tải | `SectionState state="loading"` |
| API lỗi | `SectionState state="error"` — báo lỗi rõ, không hiện khối trắng |
| Không có sản phẩm | "Chưa có sản phẩm nào ở đây." |
| JS tắt / animation hỏng | Hero hiện đủ chữ và CTA; đồng xu ở vị trí cuối; không gate visibility |
| `prefers-reduced-motion` | Xu không di chuyển, ba chặng hiện tĩnh; không có entrance |
| Màn hẹp 320px | Display giảm clamp, test tràn dấu tiếng Việt |

## 7. Rủi ro đã ghi nhận

1. **Lưới thẻ làm nửa dưới trang giống các sàn khác.** Chấp nhận có ý thức, theo quyết định
   của chủ dự án và theo mục tiêu "vẫn dùng được". Không được mô tả trang là độc đáo toàn phần.
2. **Copy hero là claim về tiền của người dùng.** Đọc từ mã nguồn, chưa chạy end-to-end.
   Phải chạy thật một đơn trước khi phát hành công khai.
3. **Đồng xu theo scroll dễ thành hiệu ứng vô nghĩa** nếu làm ẩu. Nó phải kết thúc ở một mức
   giá thật, nếu không thì cắt bỏ chứ không giữ làm trang trí.
4. **Archivo ở cỡ nhỏ trong thẻ** đã render thử ở một dòng; cần kiểm lại trên lưới đầy đủ.

## 8. Ngoại lệ đã ghi

| Ngoại lệ | Lý do |
|----------|-------|
| Media-free dù harness có tool sinh ảnh | Chủ dự án chọn, tránh rủi ro AI-slop. Trần đã ghi ở Gate A. |
| Lưới thẻ sản phẩm (gần ban #5 "identical card grids") | Product-register exception: thẻ mang dữ liệu thật khác nhau, không phải icon+tiêu đề+text lặp làm đầy trang. |
| Giữ màu xanh dù là phản xạ category tầng 2 | Identity preservation: logo đã có sẵn. Xanh không ôm cả nền lẫn nhấn. |

## 9. Nghiệm thu

Không được tuyên bố xong nếu thiếu bất kỳ mục nào:

- [ ] Render thật desktop 1440 và mobile 390, có ảnh
- [ ] Đo contrast bằng **lấy mẫu pixel** ở mọi chỗ nền gradient hoặc nền đặt bằng inline style
      (bài học 05-08: detector đọc computed-style mù với hai thứ này)
- [ ] Test tràn chữ display ở 320 / 390 / 768 / 1440
- [ ] Test `prefers-reduced-motion`
- [ ] Test API chết → hiện lỗi, không hiện khối trắng
- [ ] Tab qua toàn hero: mọi control có tên, focus nhìn thấy
- [ ] `npx tsc --noEmit` sạch, `npm run build` xanh
- [ ] Ghi run-log vào `~/.premium-web/log.json` (lần này CÓ khoá hướng sáng tạo, khác đợt polish 05-08)
