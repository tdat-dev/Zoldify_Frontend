# Redesign đợt 0 — Tầng nền Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng tầng nền thị giác dùng chung cho toàn site Zoldify — token màu/chữ/hình khối chạy đúng, bộ component dùng lại được, ba khung trang — mà không đổi bố cục trang nào.

**Architecture:** Token ngữ nghĩa viết bằng OKLCH dạng kênh rời trong `globals.css`, phơi ra Tailwind qua `<alpha-value>` để bổ ngữ độ mờ hoạt động. shadcn/ui cài đè lên chính bộ token đó nên component mới mang đúng màu thương hiệu. Primitive Zoldify dựng trên shadcn, đặt trong `src/components/ui/`. Một script Node kiểm hai thứ máy kiểm được: lớp Tailwind bị bỏ im lặng, và contrast của các cặp màu phẳng.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3.4, shadcn/ui (Radix), lucide-react, Be Vietnam Pro.

## Global Constraints

- **Không đổi bố cục trang nào ở đợt này.** Chỉ token, component, khung. Trang chủ và `Header.tsx` phải trông y hệt trước/sau, trừ việc viền đổi từ xám `#E2E8F0` sang ink 8% (đó là bản sửa lỗi, không phải đổi thiết kế).
- **Không đổi API, schema, nghiệp vụ.** Không thêm route mới.
- **Bảng màu thương hiệu giữ nguyên:** brand `#2C67C8`, brand-dark `#22539F`, brand-accent `#14708A`, đỏ cho giá. Không đổi hue.
- **Font giữ nguyên** Be Vietnam Pro, một họ. Không thêm font thứ hai.
- **Mọi cặp chữ/nền phẳng phải đạt contrast ≥ 4.5:1.** Kiểm bằng `scripts/check-tokens.mjs`. Gradient và ảnh nền không kiểm được bằng script — phải lấy mẫu pixel trên trang đã render.
- **Không có test framework trong project này** (`package.json` không có jest/vitest/playwright). Cổng kiểm ở đây là: script `check-tokens.mjs`, `npm run build`, và đo trên trình duyệt. Không viết test giả vờ.
- **Commit sau mỗi task**, theo Conventional Commits, không dấu tiếng Việt trong message (repo đang theo lệ này).
- Nhánh hiện tại: `fix/resolve-merge-conflicts`.

---

## File Structure

**Tạo mới:**

| Đường dẫn | Trách nhiệm |
|---|---|
| `scripts/check-tokens.mjs` | Kiểm lớp Tailwind bị bỏ im lặng + contrast cặp token phẳng |
| `src/lib/utils.ts` | `cn()` — gộp class, shadcn cần |
| `src/lib/status.ts` | Ánh xạ mã trạng thái backend → vai trò màu + nhãn tiếng Việt. Nơi DUY NHẤT biết chuyện này |
| `components.json` | Cấu hình shadcn CLI |
| `src/components/ui/button.tsx` … | Component shadcn (CLI sinh) |
| `src/components/ui/page-shell.tsx` | Khoá bề rộng container + nhịp lề dọc |
| `src/components/ui/page-header.tsx` | Tiêu đề trang + mô tả + hành động |
| `src/components/ui/status-badge.tsx` | Huy hiệu trạng thái, đọc từ `lib/status.ts` |
| `src/components/ui/price-tag.tsx` | Giá + giá gạch + % giảm |
| `src/components/ui/empty-state.tsx` | Trạng thái rỗng |
| `src/components/ui/error-state.tsx` | Trạng thái lỗi + nút thử lại |
| `src/components/ui/form-field.tsx` | Nhãn + trường + lỗi, nối `aria-describedby` |
| `src/components/ui/pagination.tsx` | Phân trang |
| `src/components/ui/confirm-dialog.tsx` | Xác nhận hành động phá huỷ |
| `src/components/ui/order-timeline.tsx` | Dòng thời gian đơn hàng |
| `src/components/ui/data-table.tsx` | Bảng desktop → danh sách thẻ dưới `md` |
| `src/components/layout/account-nav.tsx` | Cột điều hướng khung tài khoản |
| `src/app/(account)/layout.tsx` | Khung tài khoản |

**Sửa:**

| Đường dẫn | Sửa gì |
|---|---|
| `src/app/globals.css` | Viết lại khối `:root`: token dạng kênh rời, token trạng thái, map biến shadcn. Xoá `body { bg-gray-50 }` |
| `tailwind.config.ts` | Bọc token bằng `<alpha-value>`, thêm thang chữ, bo góc, bóng, plugin animate |
| `src/app/layout.tsx:40` | Xoá `bg-gray-50` |
| `src/app/admin/layout.tsx` | Nâng thành sidebar + thanh tiêu đề |
| `package.json` | Thêm script `check:tokens`, dependency shadcn |
| `ARCHITECTURE.md` | Viết lại — đang mô tả project PHP "UniMarket" |

---

## Task 1: Sửa tầng token màu để bổ ngữ độ mờ hoạt động

Đây là lỗi đã đo được, không phải giả thuyết: `border-ink/8` trong `Header.tsx` sinh ra **không một dòng CSS nào**. Nguyên nhân: `ink` khai báo là `var(--ink)` chứa một màu OKLCH hoàn chỉnh, Tailwind v3 không chèn được alpha vào đó nên bỏ luôn cả lớp, im lặng. 21 chỗ trong 9 file đang chết như vậy.

**Files:**
- Create: `scripts/check-tokens.mjs`
- Modify: `src/app/globals.css:37-63`, `tailwind.config.ts:17-50`, `package.json`

**Interfaces:**
- Produces: token CSS `--ink`, `--ink-muted`, `--ink-faint`, `--surface-page`, `--surface-card`, `--surface-sunken`, `--brand-tint`, `--price`, `--price-bg` ở **dạng kênh rời** (`L C H`, không bọc `oklch()`); lớp Tailwind `text-ink`, `border-ink/8`, `bg-surface-card/50`… hoạt động với mọi bổ ngữ độ mờ.
- Produces: `node scripts/check-tokens.mjs` thoát mã 0 khi mọi lớp có bổ ngữ độ mờ trong `src/` đều sinh ra CSS, mã 1 kèm danh sách khi có lớp bị bỏ.

- [ ] **Step 1: Viết script kiểm — nó phải BÁO ĐỎ trước khi sửa**

Tạo `scripts/check-tokens.mjs`:

```js
#!/usr/bin/env node
/**
 * Hai thứ máy kiểm được, chạy không cần trình duyệt:
 *
 * 1. LỚP BỊ BỎ IM LẶNG. Tailwind v3 không chèn được alpha vào một biến CSS chứa
 *    màu hoàn chỉnh (vd `var(--ink)` = `oklch(...)`), nên nó bỏ luôn cả lớp mà
 *    KHÔNG cảnh báo. `border-ink/8` viết trong JSX ra CSS rỗng. Script quét mọi
 *    lớp dạng `<utility>-<token>/<số>` trong src rồi đối chiếu với CSS Tailwind
 *    thực sự sinh ra.
 *
 * 2. CONTRAST CẶP MÀU PHẲNG. Chuyển OKLCH sang sRGB tuyến tính rồi tính theo
 *    công thức WCAG. CHỈ đúng cho màu phẳng — gradient và ảnh nền phải lấy mẫu
 *    pixel trên trang đã render, script này không thay thế được việc đó.
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdtempSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = process.cwd();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.tsx', '.ts', '.jsx', '.js'].includes(extname(p))) out.push(p);
  }
  return out;
}

// --- 1. Lớp bị bỏ im lặng -------------------------------------------------
const ALPHA_CLASS = /\b((?:bg|text|border|ring|divide|outline|from|via|to|shadow|fill|stroke|placeholder|accent|caret)-[a-z][a-z0-9-]*)\/(\d{1,3})\b/g;

const used = new Set();
for (const file of walk(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(ALPHA_CLASS)) used.add(`${m[1]}/${m[2]}`);
}

const out = join(mkdtempSync(join(tmpdir(), 'zoldify-tokens-')), 'out.css');
execSync(`npx tailwindcss -i src/app/globals.css -o "${out}"`, { stdio: 'pipe' });
const css = readFileSync(out, 'utf8');

const dropped = [...used].filter((cls) => {
  // Tailwind escape dấu / thành \/ trong selector
  const selector = '.' + cls.replace(/\//g, '\\/').replace(/\./g, '\\.');
  return !css.includes(selector);
});

// --- 2. Contrast cặp màu phẳng -------------------------------------------
function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (fg, bg) => {
  const [a, b] = [luminance(fg) + 0.05, luminance(bg) + 0.05].sort((x, y) => y - x);
  return a / b;
};

const cssText = readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8');
function token(name) {
  const m = cssText.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s*;`));
  if (!m) throw new Error(`Khong doc duoc token --${name} o dang kenh roi "L C H"`);
  return oklchToLinearSrgb(Number(m[1]), Number(m[2]), Number(m[3]));
}

// Cặp nào phải đạt 4.5:1. Nền trang và nền thẻ là hai nền thật của site.
const PAIRS = [
  ['ink', 'surface-page'], ['ink', 'surface-card'],
  ['ink-muted', 'surface-page'], ['ink-muted', 'surface-card'],
  ['ink-faint', 'surface-page'], ['ink-faint', 'surface-card'],
  ['price', 'surface-card'], ['price', 'price-bg'],
  ['state-pending-fg', 'state-pending-bg'],
  ['state-progress-fg', 'state-progress-bg'],
  ['state-success-fg', 'state-success-bg'],
  ['state-danger-fg', 'state-danger-bg'],
  ['state-neutral-fg', 'state-neutral-bg'],
];

const lowContrast = [];
for (const [fg, bg] of PAIRS) {
  let r;
  try { r = ratio(token(fg), token(bg)); } catch (e) { lowContrast.push(`${fg}/${bg}: ${e.message}`); continue; }
  if (r < 4.5) lowContrast.push(`${fg} tren ${bg}: ${r.toFixed(2)}:1 (can >= 4.5)`);
}

// --- Báo cáo --------------------------------------------------------------
let failed = false;
if (dropped.length) {
  failed = true;
  console.error(`\nLOP BI BO IM LANG (${dropped.length}) — viet trong JSX nhung khong sinh ra CSS:`);
  for (const c of dropped.sort()) console.error(`  ${c}`);
}
if (lowContrast.length) {
  failed = true;
  console.error(`\nCONTRAST KHONG DAT (${lowContrast.length}):`);
  for (const c of lowContrast) console.error(`  ${c}`);
}
if (!failed) console.log(`OK — ${used.size} lop co bo ngu do mo deu sinh ra CSS; ${PAIRS.length} cap mau dat 4.5:1`);
process.exit(failed ? 1 : 0);
```

Thêm vào `package.json` phần `scripts`:

```json
"check:tokens": "node scripts/check-tokens.mjs"
```

- [ ] **Step 2: Chạy script, xác nhận nó BÁO ĐỎ**

Run: `npm run check:tokens`

Expected: FAIL, mã thoát 1, liệt kê các lớp bị bỏ gồm `border-ink/8`, `border-ink/12`, `bg-white/75`… và báo `Khong doc duoc token --ink o dang kenh roi` (vì `globals.css` còn viết `oklch(...)` đầy đủ). Nếu nó xanh ngay thì script sai — dừng lại và sửa script trước.

- [ ] **Step 3: Đổi token sang dạng kênh rời trong `globals.css`**

Thay khối token Zoldify (hiện ở `src/app/globals.css:37-63`) bằng:

```css
    /* --- Token màu Zoldify -------------------------------------------------
       Viết dạng KÊNH RỜI "L C H", không bọc oklch(). Lý do đo được ngày
       2026-08-06 bằng chính Tailwind CLI với config của project: khi biến chứa
       một màu hoàn chỉnh (`var(--ink)` = `oklch(...)`), Tailwind v3 không chèn
       được alpha nên BỎ IM LẶNG cả lớp — `border-ink/8` viết trong Header.tsx
       ra 0 dòng CSS, không một cảnh báo nào, và viền rơi về xám #E2E8F0 của
       rule `* { @apply border-border }`. Dạng kênh rời + <alpha-value> trong
       tailwind.config sửa đúng chỗ đó. Chạy `npm run check:tokens` để canh.

       Trung tính nhuộm nhẹ về hue thương hiệu (258) với chroma 0.004-0.012,
       không phải xám trung tính chung chung. Nền trang KHÔNG dùng tông kem:
       đây là sàn mua bán, không phải tạp chí.                                */
    --surface-page: 0.995 0.002 258;
    --surface-card: 1 0 0;
    --surface-sunken: 0.945 0.009 258;
    /* Lấy mẫu pixel panel hero của ảnh mẫu ra #F3F6FF. */
    --brand-tint: 0.965 0.016 258;

    --ink: 0.24 0.021 258;
    --ink-muted: 0.505 0.019 258;
    /* 0.62 đo được 3.63:1 trên nền trắng — dưới vạch 4.5, rơi vào 5 chỗ cùng
       lúc. Tối lại để mọi chỗ dùng nó đều đạt. */
    --ink-faint: 0.55 0.019 258;

    /* Đỏ cho giá — quy ước sàn TMĐT Việt. */
    --price: 0.545 0.208 27;
    --price-bg: 0.955 0.038 27;
```

- [ ] **Step 4: Bọc token bằng `<alpha-value>` trong `tailwind.config.ts`**

Trong `theme.extend.colors`, thay các mục dùng `var(...)` trực tiếp:

```ts
        brand: {
          DEFAULT: "#2C67C8",
          dark: "#22539F",
          // #1990AA cũ chỉ đạt 3.82:1 với chữ trắng ở đầu nhạt của gradient;
          // đo bằng pixel thật trên nút "Đăng Bán". Tông này đạt 5.6:1.
          accent: "#14708A",
          tint: "oklch(var(--brand-tint) / <alpha-value>)",
        },
        price: {
          DEFAULT: "oklch(var(--price) / <alpha-value>)",
          bg: "oklch(var(--price-bg) / <alpha-value>)",
        },
        surface: {
          page: "oklch(var(--surface-page) / <alpha-value>)",
          card: "oklch(var(--surface-card) / <alpha-value>)",
          sunken: "oklch(var(--surface-sunken) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "oklch(var(--ink) / <alpha-value>)",
          muted: "oklch(var(--ink-muted) / <alpha-value>)",
          faint: "oklch(var(--ink-faint) / <alpha-value>)",
        },
```

- [ ] **Step 5: Chạy lại script — phần "lớp bị bỏ" phải sạch**

Run: `npm run check:tokens`

Expected: không còn dòng nào dưới `LOP BI BO IM LANG`. Vẫn còn báo lỗi contrast cho `state-*` vì các token đó chưa tồn tại (Task 2 thêm). Nếu `border-ink/8` vẫn nằm trong danh sách bị bỏ thì `<alpha-value>` chưa ăn — kiểm lại đã sửa đúng file `tailwind.config.ts` chưa.

- [ ] **Step 6: Xác nhận CSS thật sự sinh ra đúng**

Run:
```bash
npx tailwindcss -i src/app/globals.css -o /tmp/zoldify-verify.css && grep -A2 'border-ink\\/8' /tmp/zoldify-verify.css
```
Expected: có khối `.border-ink\/8 { border-color: oklch(0.24 0.021 258 / 0.08); }`

- [ ] **Step 7: Commit**

```bash
git add scripts/check-tokens.mjs package.json src/app/globals.css tailwind.config.ts
git commit -m "fix(tokens): sua 21 lop mau bi Tailwind bo im lang

Token ink/surface/price khai bao la var(--x) chua mot mau oklch hoan chinh nen
Tailwind v3 khong chen duoc alpha va bo luon ca lop, khong canh bao. Do bang
Tailwind CLI voi config that: border-ink/8 trong Header.tsx sinh ra 0 dong CSS,
vien roi ve xam #E2E8F0 cua rule * { @apply border-border }.

Doi token sang dang kenh roi L C H + boc <alpha-value> trong config. Them
scripts/check-tokens.mjs de canh khong tai dien.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Token trạng thái, thang chữ, bo góc, bóng — và xoá xung đột nền trang

**Files:**
- Modify: `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx:40`

**Interfaces:**
- Consumes: token dạng kênh rời từ Task 1.
- Produces: lớp `bg-state-pending-bg`, `text-state-pending-fg` (và progress/success/danger/neutral); lớp chữ `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-caption`; bo `rounded-control`, `rounded-card`, `rounded-modal`; bóng `shadow-raise`, `shadow-float`.

- [ ] **Step 1: Thêm token trạng thái vào `globals.css`**

Đặt ngay sau khối token giá, trong cùng `:root`:

```css
    /* --- Token trạng thái ---------------------------------------------------
       Năm vai trò, dùng chung cho MỌI loại trạng thái của site. Ánh xạ từ mã
       backend sang vai trò nằm ở src/lib/status.ts, không rải khắp trang.
       Mã thật lấy từ Zoldify_Backend ngày 2026-08-06: OrderStatus (7),
       PaymentStatus (3), EscrowStatus (4), ProductStatus (5),
       WithdrawalStatus (4), ShopStatus (3).
       Contrast fg-trên-bg canh bằng npm run check:tokens.                    */
    --state-pending-fg: 0.50 0.12 75;
    --state-pending-bg: 0.96 0.03 75;
    --state-progress-fg: 0.48 0.13 258;
    --state-progress-bg: 0.96 0.025 258;
    --state-success-fg: 0.48 0.12 155;
    --state-success-bg: 0.96 0.03 155;
    --state-danger-fg: 0.50 0.18 27;
    --state-danger-bg: 0.955 0.038 27;
    --state-neutral-fg: 0.50 0.015 258;
    --state-neutral-bg: 0.955 0.008 258;
```

- [ ] **Step 2: Phơi token trạng thái ra Tailwind**

Trong `theme.extend.colors` của `tailwind.config.ts`, thêm:

```ts
        state: {
          "pending-fg": "oklch(var(--state-pending-fg) / <alpha-value>)",
          "pending-bg": "oklch(var(--state-pending-bg) / <alpha-value>)",
          "progress-fg": "oklch(var(--state-progress-fg) / <alpha-value>)",
          "progress-bg": "oklch(var(--state-progress-bg) / <alpha-value>)",
          "success-fg": "oklch(var(--state-success-fg) / <alpha-value>)",
          "success-bg": "oklch(var(--state-success-bg) / <alpha-value>)",
          "danger-fg": "oklch(var(--state-danger-fg) / <alpha-value>)",
          "danger-bg": "oklch(var(--state-danger-bg) / <alpha-value>)",
          "neutral-fg": "oklch(var(--state-neutral-fg) / <alpha-value>)",
          "neutral-bg": "oklch(var(--state-neutral-bg) / <alpha-value>)",
        },
```

- [ ] **Step 3: Chạy script, sửa L của token nào chưa đạt**

Run: `npm run check:tokens`

Expected: xanh hoàn toàn. Nếu cặp nào báo dưới 4.5:1, **hạ giá trị L của `-fg` đi 0.02** rồi chạy lại, lặp cho tới khi đạt. Không nới ngưỡng, không bỏ qua.

- [ ] **Step 4: Thêm thang chữ, bo góc, bóng vào `tailwind.config.ts`**

Trong `theme.extend`, thêm ba khối:

```ts
      // Thang chữ cố định. Trước đây mỗi file tự chọn: text-[13.5px],
      // text-[14.5px], text-[11.5px], text-[16px]... không có thứ bậc chung.
      fontSize: {
        display: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        h1: ["22px", { lineHeight: "28px", fontWeight: "700" }],
        h2: ["18px", { lineHeight: "24px", fontWeight: "700" }],
        h3: ["15px", { lineHeight: "20px", fontWeight: "600" }],
        body: ["14px", { lineHeight: "22px" }],
        small: ["13px", { lineHeight: "18px" }],
        caption: ["11.5px", { lineHeight: "16px", fontWeight: "600" }],
      },
      boxShadow: {
        // Đúng ba mức. Mức 0 là chỉ viền, không có lớp nào.
        raise: "0 8px 24px -12px rgba(20,30,60,0.18)",
        float: "0 12px 32px -8px rgba(20,30,60,0.24)",
      },
```

Và bổ sung vào `borderRadius` sẵn có (giữ nguyên `lg`/`md`/`sm` để shadcn dùng):

```ts
        control: "10px",
        card: "14px",
        modal: "16px",
```

- [ ] **Step 5: Xoá hai chỗ đè lên token nền trang**

Trong `src/app/globals.css`, sửa khối base:

```css
  body {
    @apply bg-surface-page text-ink;
  }
```

Trong `src/app/layout.tsx:40`, bỏ `bg-gray-50`:

```tsx
              <div className="min-h-screen flex flex-col">
```

- [ ] **Step 6: Build và xem trang chủ**

Run: `npm run build`
Expected: build xanh, không lỗi TypeScript.

Run: `npm run dev`, mở `http://localhost:3000`
Expected: nền trang gần như trắng (không còn xám `#F9FAFB`), viền header và viền thẻ sản phẩm là ink 8% ấm hơn xám cũ. Bố cục không đổi.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css tailwind.config.ts src/app/layout.tsx
git commit -m "feat(tokens): them token trang thai, thang chu, bo goc, bong

Nam vai trong trang thai dung chung cho OrderStatus/PaymentStatus/EscrowStatus/
ProductStatus/WithdrawalStatus/ShopStatus, thay 5 bang mau tu bia o cac trang
don hang. Thang chu co dinh thay text-[13.5px] tuy hung.

Xoa body{bg-gray-50} va bg-gray-50 trong layout — hai cho nay dang de len token
--surface-page nen token khong bao gio co tac dung.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Cài shadcn/ui trỏ về token Zoldify

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,input,textarea,select,checkbox,radio-group,dialog,dropdown-menu,tabs,table,tooltip,sheet,skeleton,popover,separator}.tsx`
- Modify: `src/app/globals.css` (map biến shadcn), `tailwind.config.ts` (plugin animate)

**Interfaces:**
- Consumes: token từ Task 1 và 2.
- Produces: `cn(...classes: ClassValue[]): string` từ `@/lib/utils`; các component shadcn dưới `@/components/ui/*`.

- [ ] **Step 1: Tạo `src/lib/utils.ts`**

`clsx` và `tailwind-merge` đã có trong `package.json` nhưng chưa file nào export `cn`.

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Sao lưu `globals.css` trước khi chạy shadcn init**

Lệnh `init` của shadcn sẽ muốn ghi đè khối `:root`. Token OKLCH của Zoldify không được mất.

```bash
cp src/app/globals.css /tmp/globals.css.backup
```

- [ ] **Step 3: Chạy shadcn init**

```bash
npx shadcn@latest init
```

Trả lời: style `new-york`, base color bất kỳ (sẽ ghi đè ở bước sau), CSS variables `yes`, `tailwind.config.ts`, global CSS `src/app/globals.css`, alias `@/components` và `@/lib/utils`, RSC `yes`.

- [ ] **Step 4: Khôi phục token Zoldify và map biến shadcn**

So sánh `src/app/globals.css` với `/tmp/globals.css.backup`. Mọi token `--ink*`, `--surface-*`, `--price*`, `--brand-tint`, `--state-*` phải còn nguyên dạng kênh rời. Sau đó thay khối HSL mặc định của shadcn bằng:

```css
    /* --- Biến shadcn trỏ về màu Zoldify -------------------------------------
       Mặc định của shadcn là --primary: 221.2 83.2% 53.3% — xanh của shadcn,
       KHÔNG phải #2C67C8 của Zoldify. Để nguyên thì mọi component shadcn mang
       sai màu thương hiệu. Dùng oklch trực tiếp thay vì hsl(var(--x)) nên
       tailwind.config phải khai báo các màu này là var(--x), không bọc hsl().  */
    --background: var(--surface-page);
    --foreground: var(--ink);
    --card: var(--surface-card);
    --card-foreground: var(--ink);
    --popover: var(--surface-card);
    --popover-foreground: var(--ink);
    --primary: 0.508 0.153 258;          /* #2C67C8 */
    --primary-foreground: 1 0 0;
    --secondary: var(--surface-sunken);
    --secondary-foreground: var(--ink);
    --muted: var(--surface-sunken);
    --muted-foreground: var(--ink-muted);
    --accent: var(--surface-sunken);
    --accent-foreground: var(--ink);
    --destructive: var(--price);
    --destructive-foreground: 1 0 0;
    --border: var(--ink);
    --input: var(--ink);
    --ring: 0.508 0.153 258;
```

Trong `tailwind.config.ts`, các màu shadcn phải bọc `oklch(... / <alpha-value>)` chứ không phải `hsl(var(--x))`:

```ts
        border: "oklch(var(--border) / 0.12)",
        input: "oklch(var(--input) / 0.16)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
```

- [ ] **Step 5: Thêm 15 component shadcn**

```bash
npx shadcn@latest add button input textarea select checkbox radio-group dialog dropdown-menu tabs table tooltip sheet skeleton popover separator
```

- [ ] **Step 6: Chạy script và build**

Run: `npm run check:tokens && npm run build`
Expected: script xanh, build xanh.

- [ ] **Step 7: Xác nhận nút shadcn mang đúng xanh Zoldify**

Run:
```bash
npx tailwindcss -i src/app/globals.css -o /tmp/zoldify-shadcn.css && grep -A2 '^\.bg-primary' /tmp/zoldify-shadcn.css
```
Expected: `background-color: oklch(0.508 0.153 258 / var(--tw-bg-opacity, 1))` — **không** phải `221.2 83.2% 53.3%`.

- [ ] **Step 8: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui src/app/globals.css tailwind.config.ts package.json package-lock.json
git commit -m "feat(ui): cai shadcn/ui tro ve token mau Zoldify

Bien shadcn mac dinh la --primary 221.2 83.2% 53.3% — xanh cua shadcn, khong
phai #2C67C8. Map lai toan bo ve token Zoldify va doi tailwind.config sang
oklch(... / <alpha-value>) thay vi hsl(var(--x)).

Them cn() vao src/lib/utils.ts — clsx va tailwind-merge da cai san nhung chua
file nao export.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `PageShell` và `PageHeader` — khoá 9 bề rộng container về một

**Files:**
- Create: `src/components/ui/page-shell.tsx`, `src/components/ui/page-header.tsx`

**Interfaces:**
- Consumes: `cn` từ `@/lib/utils`.
- Produces:
  - `<PageShell width?: "wide" | "form" | "narrow", className?: string, children: ReactNode>` — mặc định `wide`.
  - `<PageHeader title: string, description?: string, action?: ReactNode, breadcrumb?: Array<{label: string; href?: string}>>`

- [ ] **Step 1: Viết `page-shell.tsx`**

```tsx
import { cn } from "@/lib/utils";

/**
 * Khoá bề rộng container. Trước đây site có 9 bề rộng khác nhau cho container
 * chính — 1400 (đăng nhập/đăng ký), 1240 (trang chủ), 1280 (admin), 1200
 * (giỏ/thanh toán/tìm kiếm/sản phẩm/shop), 1152, 1024, 1000, 896, 800 — nên
 * chuyển trang là nội dung nhảy trái phải.
 *
 * wide   1240px — trang có lưới sản phẩm hoặc bảng
 * form   800px  — biểu mẫu dài: đăng bán, sửa địa chỉ
 * narrow 600px  — một thông điệp: kết quả thanh toán, đăng nhập
 */
const WIDTH = {
  wide: "max-w-[1240px]",
  form: "max-w-[800px]",
  narrow: "max-w-[600px]",
} as const;

export function PageShell({
  width = "wide",
  className,
  children,
}: {
  width?: keyof typeof WIDTH;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 md:py-8", WIDTH[width], className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Viết `page-header.tsx`**

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Đường dẫn" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-small text-ink-muted">
            {breadcrumb.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-brand">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink">{title}</h1>
          {description && <p className="mt-1 text-body text-ink-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: xanh.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/page-shell.tsx src/components/ui/page-header.tsx
git commit -m "feat(ui): them PageShell va PageHeader

PageShell khoa be rong container ve 3 bien the thay vi 9 gia tri roi rac dang
rai khap cac trang.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: `lib/status.ts` + `StatusBadge` + `PriceTag`

Mã trạng thái dưới đây đọc thẳng từ `Zoldify_Backend` ngày 2026-08-06, không suy từ tên biến ở frontend.

**Files:**
- Create: `src/lib/status.ts`, `src/components/ui/status-badge.tsx`, `src/components/ui/price-tag.tsx`

**Interfaces:**
- Consumes: token `state-*` từ Task 2, `cn` từ Task 3, `formatPrice` từ `@/lib/format`.
- Produces:
  - `type StatusRole = "pending" | "progress" | "success" | "danger" | "neutral"`
  - `type StatusKind = "order" | "payment" | "escrow" | "product" | "withdrawal" | "shop"`
  - `resolveStatus(kind: StatusKind, code: string): { role: StatusRole; label: string }`
  - `<StatusBadge kind: StatusKind, code: string, className?: string>`
  - `<PriceTag price: number, original?: number | null, percent?: number | null, size?: "sm" | "md" | "lg">`

- [ ] **Step 1: Viết `src/lib/status.ts`**

```ts
/**
 * Nơi DUY NHẤT ánh xạ mã trạng thái backend sang vai trò màu và nhãn tiếng Việt.
 *
 * Trước đây 5 trang đơn hàng (admin/orders, shop/orders, profile/orders,
 * profile/orders/[id], payment/return) mỗi trang tự bịa một bảng màu bằng
 * yellow-100/green-100/red-100 — cùng một trạng thái "Chờ xác nhận" ra hai màu
 * khác nhau ở trang người mua và người bán.
 *
 * Mã lấy từ Zoldify_Backend ngày 2026-08-06:
 *   OrderStatus       src/orders/entities/order.entity.ts:17
 *   PaymentStatus     src/common/enums/payment.enum.ts:11
 *   EscrowStatus      src/escrows/entities/escrow.entity.ts:14
 *   ProductStatus     src/products/entities/product.entity.ts:17
 *   WithdrawalStatus  src/withdrawals/entities/withdrawal.entity.ts:13
 *   ShopStatus        src/shop/entities/shop.entity.ts:4
 */
export type StatusRole = "pending" | "progress" | "success" | "danger" | "neutral";
export type StatusKind = "order" | "payment" | "escrow" | "product" | "withdrawal" | "shop";

type Entry = { role: StatusRole; label: string };

const MAP: Record<StatusKind, Record<string, Entry>> = {
  order: {
    pending: { role: "pending", label: "Chờ xác nhận" },
    confirmed: { role: "progress", label: "Đã xác nhận" },
    processing: { role: "progress", label: "Đang xử lý" },
    shipping: { role: "progress", label: "Đang giao" },
    delivered: { role: "success", label: "Đã giao" },
    cancelled: { role: "danger", label: "Đã huỷ" },
    refunded: { role: "neutral", label: "Đã hoàn tiền" },
  },
  payment: {
    pending: { role: "pending", label: "Chờ thanh toán" },
    success: { role: "success", label: "Đã thanh toán" },
    failed: { role: "danger", label: "Thanh toán lỗi" },
  },
  escrow: {
    holding: { role: "pending", label: "Đang giữ hộ" },
    released: { role: "success", label: "Đã chuyển người bán" },
    refunded: { role: "neutral", label: "Đã hoàn người mua" },
    cancelled: { role: "danger", label: "Đã huỷ" },
  },
  product: {
    draft: { role: "neutral", label: "Nháp" },
    pending: { role: "pending", label: "Chờ duyệt" },
    active: { role: "success", label: "Đang bán" },
    sold: { role: "neutral", label: "Đã bán" },
    rejected: { role: "danger", label: "Bị từ chối" },
  },
  withdrawal: {
    pending: { role: "pending", label: "Chờ duyệt" },
    approved: { role: "progress", label: "Đã duyệt" },
    rejected: { role: "danger", label: "Bị từ chối" },
    completed: { role: "success", label: "Đã chuyển khoản" },
  },
  shop: {
    active: { role: "success", label: "Đang hoạt động" },
    inactive: { role: "neutral", label: "Tạm nghỉ" },
    banned: { role: "danger", label: "Bị khoá" },
  },
};

/**
 * Mã lạ không làm vỡ trang: trả về vai trò trung tính và in nguyên mã, để lỗi
 * nhìn thấy được thay vì biến mất.
 */
export function resolveStatus(kind: StatusKind, code: string): Entry {
  return MAP[kind]?.[code] ?? { role: "neutral", label: code };
}
```

- [ ] **Step 2: Viết `status-badge.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { resolveStatus, type StatusKind, type StatusRole } from "@/lib/status";

const ROLE_CLASS: Record<StatusRole, string> = {
  pending: "bg-state-pending-bg text-state-pending-fg",
  progress: "bg-state-progress-bg text-state-progress-fg",
  success: "bg-state-success-bg text-state-success-fg",
  danger: "bg-state-danger-bg text-state-danger-fg",
  neutral: "bg-state-neutral-bg text-state-neutral-fg",
};

export function StatusBadge({
  kind,
  code,
  className,
}: {
  kind: StatusKind;
  code: string;
  className?: string;
}) {
  const { role, label } = resolveStatus(kind, code);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-control px-2.5 py-1 text-caption",
        ROLE_CLASS[role],
        className,
      )}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 3: Viết `price-tag.tsx`**

```tsx
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: { price: "text-body font-bold", struck: "text-caption", pct: "text-caption" },
  md: { price: "text-h2", struck: "text-small", pct: "text-caption" },
  lg: { price: "text-display text-price", struck: "text-body", pct: "text-small" },
} as const;

/**
 * Giá dùng đỏ, không dùng xanh thương hiệu — quy ước sàn TMĐT Việt
 * (Shopee/Tiki/Lazada), là thứ người mua đã đọc quen.
 */
export function PriceTag({
  price,
  original,
  percent,
  size = "md",
  className,
}: {
  price: number;
  original?: number | null;
  percent?: number | null;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn(s.price, "text-price")}>{formatPrice(price)}</span>
      {original != null && original > price && (
        <span className={cn(s.struck, "text-ink-faint line-through")}>{formatPrice(original)}</span>
      )}
      {percent != null && percent > 0 && (
        <span className={cn(s.pct, "rounded-control bg-price-bg px-1.5 py-0.5 text-price")}>
          -{percent}%
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: xanh.

- [ ] **Step 5: Commit**

```bash
git add src/lib/status.ts src/components/ui/status-badge.tsx src/components/ui/price-tag.tsx
git commit -m "feat(ui): them StatusBadge, PriceTag va bang anh xa trang thai

Mot noi duy nhat anh xa ma trang thai backend sang mau va nhan tieng Viet, cho
ca 6 loai trang thai. Ma doc thang tu Zoldify_Backend, khong doan tu frontend.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: `EmptyState`, `ErrorState`, `FormField`, `Pagination`, `ConfirmDialog`, `OrderTimeline`

**Files:**
- Create: `src/components/ui/empty-state.tsx`, `error-state.tsx`, `form-field.tsx`, `pagination.tsx`, `confirm-dialog.tsx`, `order-timeline.tsx`

**Interfaces:**
- Consumes: `cn`, `Button` và `Dialog` từ shadcn (Task 3), `resolveStatus` từ Task 5.
- Produces:
  - `<EmptyState icon?: LucideIcon, title: string, description?: string, action?: ReactNode>`
  - `<ErrorState message?: string, onRetry?: () => void>`
  - `<FormField label: string, htmlFor: string, error?: string | null, hint?: string, required?: boolean, children: ReactNode>`
  - `<Pagination page: number, totalPages: number, onChange: (page: number) => void>`
  - `<ConfirmDialog open: boolean, onOpenChange: (o: boolean) => void, title: string, description?: string, confirmLabel?: string, cancelLabel?: string, destructive?: boolean, onConfirm: () => void | Promise<void>>`
  - `<OrderTimeline current: string, history?: Array<{ code: string; at: string }>>`

- [ ] **Step 1: Viết `empty-state.tsx` và `error-state.tsx`**

```tsx
// empty-state.tsx
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <Icon className="mb-3 h-10 w-10 text-ink-faint" aria-hidden="true" />
      <p className="text-h3 text-ink">{title}</p>
      {description && <p className="mt-1 max-w-[42ch] text-body text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
```

```tsx
// error-state.tsx
"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  message = "Chưa tải được dữ liệu. Mạng có thể đang trục trặc.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <AlertTriangle className="mb-3 h-10 w-10 text-state-danger-fg" aria-hidden="true" />
      <p className="max-w-[42ch] text-body text-ink">{message}</p>
      {onRetry && (
        <Button type="button" onClick={onRetry} variant="outline" className="mt-5">
          Thử lại
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Viết `form-field.tsx`**

```tsx
import { cn } from "@/lib/utils";

/**
 * Nối aria-describedby tới câu lỗi và câu gợi ý. Con truyền vào phải nhận id
 * bằng đúng htmlFor, và khi có lỗi thì tự đặt aria-invalid.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-semibold text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-price" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-caption font-normal text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption font-normal text-state-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Viết `pagination.tsx`**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Luôn hiện trang đầu, trang cuối, trang hiện tại và hai bên nó. Còn lại là "…". */
function pageList(page: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "gap"> = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);
  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("gap");
  out.push(total);
  return out;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-control px-2 text-small transition-colors disabled:cursor-not-allowed disabled:text-ink-faint";
  return (
    <nav aria-label="Phân trang" className={cn("flex items-center justify-center gap-1", className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className={cn(btn, "text-ink hover:bg-surface-sunken")}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-small text-ink-faint" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page ? "bg-brand font-semibold text-white" : "text-ink hover:bg-surface-sunken",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
        className={cn(btn, "text-ink hover:bg-surface-sunken")}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
```

- [ ] **Step 4: Viết `confirm-dialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Quay lại",
  destructive = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-modal sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-h2 text-ink">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-body text-ink-muted">{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={handle}
            disabled={busy}
          >
            {busy ? "Đang xử lý…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Viết `order-timeline.tsx`**

```tsx
import { Check } from "lucide-react";
import { resolveStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

/** Đường đi bình thường của một đơn. Huỷ và hoàn tiền là nhánh rẽ, không nằm trên đường này. */
const FLOW = ["pending", "confirmed", "processing", "shipping", "delivered"] as const;

export function OrderTimeline({
  current,
  history,
  className,
}: {
  current: string;
  history?: Array<{ code: string; at: string }>;
  className?: string;
}) {
  const atOf = (code: string) => history?.find((h) => h.code === code)?.at;

  // Ngoài đường đi bình thường: chỉ hiện một dòng, không vẽ đường
  if (!FLOW.includes(current as (typeof FLOW)[number])) {
    const { label } = resolveStatus("order", current);
    return (
      <p className={cn("text-body text-ink", className)}>
        Đơn ở trạng thái: <span className="font-semibold">{label}</span>
      </p>
    );
  }

  const currentIndex = FLOW.indexOf(current as (typeof FLOW)[number]);

  return (
    <ol className={cn("flex flex-col gap-0", className)}>
      {FLOW.map((code, i) => {
        const done = i <= currentIndex;
        const last = i === FLOW.length - 1;
        return (
          <li key={code} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-brand text-white" : "border border-ink/16 bg-surface-card",
                )}
              >
                {done && <Check className="h-3.5 w-3.5" />}
              </span>
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn("w-px flex-1", i < currentIndex ? "bg-brand" : "bg-ink/12")}
                />
              )}
            </div>
            <div className={cn("pb-6", last && "pb-0")}>
              <p className={cn("text-small", done ? "font-semibold text-ink" : "text-ink-faint")}>
                {resolveStatus("order", code).label}
              </p>
              {atOf(code) && <p className="text-caption font-normal text-ink-muted">{atOf(code)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: xanh.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/empty-state.tsx src/components/ui/error-state.tsx src/components/ui/form-field.tsx src/components/ui/pagination.tsx src/components/ui/confirm-dialog.tsx src/components/ui/order-timeline.tsx
git commit -m "feat(ui): them EmptyState, ErrorState, FormField, Pagination, ConfirmDialog, OrderTimeline

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `DataTable` — bảng desktop, danh sách thẻ trên điện thoại

Sáu trang bảng (`admin/orders` 75 chỗ hardcode, `shop/orders` 67, `admin/users` 63, `admin/products`, `admin/categories`, `profile/products`) đều là bảng nhiều cột trong `overflow-x-auto`. Trên điện thoại phải kéo ngang mới đọc được một dòng.

**Files:**
- Create: `src/components/ui/data-table.tsx`

**Interfaces:**
- Consumes: `Table` từ shadcn, `cn`, `EmptyState`, `ErrorState`, `Skeleton`.
- Produces:
  - `type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; primary?: boolean; hideOnMobile?: boolean; className?: string }`
  - `<DataTable<T> columns: Column<T>[], rows: T[], rowKey: (row: T) => string | number, state?: "loading" | "error" | "ready", onRetry?: () => void, emptyTitle?: string, emptyDescription?: string, actions?: (row: T) => ReactNode>`

- [ ] **Step 1: Viết `data-table.tsx`**

```tsx
"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Cột chính: làm tiêu đề của thẻ trên điện thoại. Đúng MỘT cột nên đặt cờ này. */
  primary?: boolean;
  /** Ẩn hẳn ở dạng thẻ — dùng cho cột phụ trợ, không dùng để né việc sắp xếp lại. */
  hideOnMobile?: boolean;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  state = "ready",
  onRetry,
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription,
  actions,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  state?: "loading" | "error" | "ready";
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: (row: T) => React.ReactNode;
  className?: string;
}) {
  if (state === "loading") {
    return (
      <div className={cn("rounded-card border border-ink/8 bg-surface-card p-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-3 h-11 w-full last:mb-0" />
        ))}
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={cn("rounded-card border border-ink/8 bg-surface-card", className)}>
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cn("rounded-card border border-ink/8 bg-surface-card", className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

  return (
    <>
      {/* Từ md trở lên: bảng thật */}
      <div
        className={cn(
          "hidden overflow-hidden rounded-card border border-ink/8 bg-surface-card md:block",
          className,
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-ink/8 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("text-caption text-ink-muted", col.className)}>
                  {col.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-px" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} className="border-ink/8">
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn("text-small text-ink", col.className)}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {actions && <TableCell className="text-right">{actions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dưới md: mỗi bản ghi một thẻ. Không ai phải kéo ngang để đọc một dòng. */}
      <ul className={cn("flex flex-col gap-3 md:hidden", className)}>
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-card border border-ink/8 bg-surface-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-h3 text-ink">{primary.cell(row)}</div>
              {actions && <div className="shrink-0">{actions(row)}</div>}
            </div>
            <dl className="mt-3 flex flex-col gap-1.5">
              {rest.map((col) => (
                <div key={col.key} className="flex items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-caption text-ink-muted">{col.header}</dt>
                  <dd className="min-w-0 text-right text-small text-ink">{col.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: xanh.

- [ ] **Step 3: Kiểm bằng mắt trên trang thật**

Cần backend đang chạy. Mở `/admin/users` ở 390px và 1440px sau khi Task 9 chuyển trang này sang `DataTable`. Ở đợt 0 chỉ cần build xanh — nếu backend chưa chạy được thì ghi lại là chưa kiểm, **không** đánh dấu đã kiểm.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/data-table.tsx
git commit -m "feat(ui): them DataTable tu doi sang danh sach the duoi md

Sau trang bang deu dat trong overflow-x-auto, tren dien thoai phai keo ngang moi
doc duoc mot dong. Mot lan dung, sau trang huong.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Khung tài khoản và khung admin

**Files:**
- Create: `src/components/layout/account-nav.tsx`, `src/app/(account)/layout.tsx`
- Modify: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: `PageShell` (Task 4), `Sheet` từ shadcn, `cn`.
- Produces: `<AccountNav />`; route group `(account)` bọc các trang tài khoản.

**Lưu ý di chuyển file:** Next.js route group `(account)` không đổi URL. Ở đợt 0 **chỉ tạo layout và nav, chưa di chuyển trang nào vào group** — việc chuyển từng trang thuộc đợt 4 và 5, vì nó động vào bố cục. Task này dựng sẵn khung để đợt sau cắm vào.

- [ ] **Step 1: Viết `account-nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, ShoppingBag, Wallet, MapPin, Package, ClipboardList, MessageSquare, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Mọi mục trỏ tới route CÓ THẬT trong src/app. Không dựng link chết. */
const ITEMS = [
  { href: "/profile", label: "Hồ sơ", icon: User },
  { href: "/profile/orders", label: "Đơn mua", icon: ShoppingBag },
  { href: "/profile/wallet", label: "Ví của tôi", icon: Wallet },
  { href: "/addresses", label: "Địa chỉ", icon: MapPin },
  { href: "/notifications", label: "Thông báo", icon: Bell },
  { href: "/profile/products", label: "Sản phẩm của tôi", icon: Package },
  { href: "/shop/orders", label: "Đơn bán", icon: ClipboardList },
  { href: "/chat", label: "Tin nhắn", icon: MessageSquare },
];

export function AccountNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/profile" ? pathname === "/profile" : pathname.startsWith(href);

  return (
    <nav aria-label="Khu vực tài khoản">
      {/* Desktop: cột dọc */}
      <ul className="hidden flex-col gap-0.5 md:flex">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-small transition-colors",
                isActive(href)
                  ? "bg-brand-tint font-semibold text-brand"
                  : "text-ink hover:bg-surface-sunken",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile: hàng tab cuộn ngang, cuộn BÊN TRONG chứ không đẩy tràn trang */}
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-small transition-colors",
                isActive(href)
                  ? "bg-brand font-semibold text-white"
                  : "bg-surface-sunken text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Viết `src/app/(account)/layout.tsx`**

```tsx
import { AccountNav } from "@/components/layout/account-nav";
import { PageShell } from "@/components/ui/page-shell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      {/* min-w-0 trên cột nội dung: nếu không, bảng và chuỗi dài bên trong sẽ nở
          theo nội dung và đẩy tràn cả trang thay vì tự cuộn bên trong. */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <aside className="md:w-[220px] md:shrink-0">
          <AccountNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 3: Nâng `src/app/admin/layout.tsx`**

File hiện tại (33 dòng) chỉ làm **kiểm quyền**: chưa đăng nhập → đẩy về `/login`, không phải admin → đẩy về `/`, đang chờ → hiện spinner. **Phần kiểm quyền này phải giữ nguyên từng dòng** — nó là hàng rào bảo mật, không phải giao diện. Chỉ thay `return <>{children}</>` ở cuối bằng khung mới, và đổi `text-gray-600` của spinner sang `text-ink-muted`.

Nội dung file sau khi sửa:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Settings, Menu, Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2.5 text-small transition-colors",
                active ? "bg-brand-tint font-semibold text-brand" : "text-ink hover:bg-surface-sunken",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // --- Hàng rào quyền: giữ nguyên hành vi của bản cũ ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user && user.role !== "admin") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-muted" aria-hidden="true" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return null; // đang chuyển hướng
  }

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-4 py-6 md:py-8">
      <aside className="hidden w-[220px] shrink-0 lg:block">
        <p className="mb-3 px-3 text-caption uppercase tracking-wide text-ink-faint">Quản trị</p>
        <AdminNav />
      </aside>

      <div className="min-w-0 flex-1">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Mở menu quản trị"
              className="mb-4 flex h-10 items-center gap-2 rounded-control border border-ink/12 px-3 text-small text-ink lg:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" /> Menu quản trị
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] bg-surface-card">
            <SheetTitle className="mb-3 text-h2 text-ink">Quản trị</SheetTitle>
            <AdminNav onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: xanh. Route group `(account)` chưa có trang nào bên trong nên Next sẽ không sinh route mới — đúng ý đồ.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(account)/layout.tsx" src/components/layout/account-nav.tsx src/app/admin/layout.tsx
git commit -m "feat(layout): dung khung tai khoan va nang khung admin

Khung tai khoan co cot dieu huong doc — truoc day muon tu Don mua sang Vi phai
mo lai menu o header. Admin co sidebar co dinh, duoi lg thanh Sheet.

Chua chuyen trang nao vao route group (account): viec do dong vao bo cuc nen
thuoc dot 4 va 5.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Quét đổi bảng màu cũ sang token — 1.050 chỗ, 46 file

Đây là phần "reskin nông" ghép vào đợt 0 để cả site thống nhất màu ngay, trước khi các đợt sau nâng bố cục. **Chỉ đổi màu và cỡ chữ, không đụng bố cục.**

**Files:** 46 file trong `src/app` và `src/components` (danh sách đầy đủ: chạy lệnh ở Step 1).

**Interfaces:**
- Consumes: mọi token từ Task 1 và 2.
- Produces: `npm run check:legacy` trả về 0 chỗ còn dùng bảng màu mặc định.

**Bảng ánh xạ — dùng đúng bảng này, không tự chế:**

| Cũ | Mới |
|---|---|
| `bg-white` | `bg-surface-card` |
| `bg-gray-50`, `bg-slate-50` | `bg-surface-page` |
| `bg-gray-100`, `bg-slate-100`, `bg-gray-200` | `bg-surface-sunken` |
| `text-gray-900`, `text-slate-900`, `text-gray-800` | `text-ink` |
| `text-gray-600`, `text-gray-700`, `text-slate-600` | `text-ink-muted` |
| `text-gray-400`, `text-gray-500` | `text-ink-faint` |
| `border-gray-200`, `border-gray-100`, `border-slate-200` | `border-ink/8` |
| `border-gray-300` | `border-ink/16` |
| `bg-blue-600`, `bg-blue-500`, `bg-indigo-600` | `bg-brand` |
| `bg-blue-700`, `bg-indigo-700` | `bg-brand-dark` |
| `text-blue-600`, `text-blue-700`, `text-indigo-600` | `text-brand` |
| `bg-blue-50`, `bg-blue-100`, `bg-indigo-50` | `bg-brand-tint` |
| `text-red-500`, `text-red-600` (giá) | `text-price` |
| `bg-red-50`, `bg-red-100` (giá) | `bg-price-bg` |
| `bg-yellow-100` + `text-yellow-800` (trạng thái) | `<StatusBadge />` |
| `bg-green-100` + `text-green-800` (trạng thái) | `<StatusBadge />` |
| `bg-red-100` + `text-red-800` (trạng thái) | `<StatusBadge />` |
| `text-[13.5px]`, `text-sm` | `text-small` |
| `text-[14.5px]`, `text-base` | `text-body` |
| `text-[11.5px]`, `text-xs` | `text-caption` |
| `rounded-lg` trên nút/ô nhập | `rounded-control` |
| `rounded-xl` trên thẻ | `rounded-card` |

- [ ] **Step 1: Thêm lệnh đếm và ghi lại con số xuất phát**

Thêm vào `package.json`:

```json
"check:legacy": "node -e \"const{execSync}=require('child_process');const out=execSync('git grep -oE \\\"\\\\\\\\b(bg|text|border|ring|from|to)-(gray|slate|zinc|blue|red|green|yellow|indigo|purple|orange|emerald)-[0-9]{2,3}\\\" -- src || true').toString().trim();const n=out?out.split('\\n').length:0;console.log(n+' cho con dung bang mau mac dinh');process.exit(n>0?1:0)\""
```

Run: `npm run check:legacy`
Expected: FAIL, in ra khoảng `1050 cho con dung bang mau mac dinh`. Ghi con số này lại để so ở Step 5.

- [ ] **Step 2: Đổi cụm trang công khai**

Sửa theo bảng ánh xạ, từng file một: `src/app/product/[id]/page.tsx`, `product/create`, `product/[id]/edit`, `cart/page.tsx`, `cart/success`, `checkout`, `search`, `category/[slug]`, `payment/return`, `payment/cancel`, `login`, `register`, `forgot-password`, `reset-password`, `maintenance`, `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx`.

Mỗi nhóm trạng thái `bg-yellow-100 text-yellow-800` phải thay bằng `<StatusBadge kind=... code=... />`, **không** phải bằng `bg-state-pending-bg` viết tay — mục đích là còn đúng một nơi biết ánh xạ.

Run sau mỗi 3-4 file: `npm run build`

- [ ] **Step 3: Đổi cụm tài khoản và shop**

`profile/page.tsx`, `profile/change-password`, `profile/orders`, `profile/orders/[id]`, `profile/wallet`, `profile/products`, `addresses/page.tsx`, `addresses/create`, `addresses/[id]/edit`, `notifications`, `shop/page.tsx`, `shop/orders`.

- [ ] **Step 4: Đổi cụm admin, chat và component dùng chung**

`admin/page.tsx`, `admin/categories`, `admin/orders`, `admin/products`, `admin/users`, `admin/settings`, `chat/page.tsx`, `components/AddressPicker.tsx`, `components/Footer.tsx`, `components/StockControl.tsx`, `components/Toast.tsx`, `components/BackButton.tsx`, `components/home/Hero.tsx`, `components/home/TrustStrip.tsx`.

`Toast.tsx`: **giữ nguyên API** (`toast(message, type)`), chỉ thay lớp vỏ. Có nhiều file đang gọi nó.

- [ ] **Step 5: Thay container tự chế bằng `PageShell` trên mọi trang**

Đây là phần xoá 9 bề rộng container. Trong mỗi file, tìm `div` bọc ngoài cùng có `max-w-*` rồi thay bằng `PageShell`, giữ nguyên mọi thứ bên trong:

```tsx
// Trước — mỗi trang một con số
<div className="max-w-[1200px] mx-auto px-4 py-8">

// Sau
<PageShell>
```

Chọn biến thể theo bảng này, **không** theo con số cũ của trang (con số cũ chính là thứ đang sai):

| Biến thể | Trang |
|---|---|
| `wide` (mặc định) | `/`, `search`, `category/[slug]`, `product/[id]`, `cart`, `checkout`, `shop`, `shop/orders`, `profile/*`, `admin/*`, `notifications`, `chat` |
| `form` | `product/create`, `product/[id]/edit`, `addresses/create`, `addresses/[id]/edit`, `addresses` |
| `narrow` | `login`, `register`, `forgot-password`, `reset-password`, `reset-password`, `cart/success`, `payment/return`, `payment/cancel`, `maintenance`, `not-found`, `error`, `profile/change-password` |

Riêng `admin/*`: bề rộng đã do `admin/layout.tsx` (Task 8) đặt — **gỡ** `max-w-7xl` trong từng trang admin thay vì bọc `PageShell` lồng thêm một lớp.

Sau bước này, `grep -oE "max-w-\[?[0-9]" src/app --include=*.tsx -r` chỉ còn khớp bên trong `page-shell.tsx` và các chỗ giới hạn bề rộng **nội dung con** (ví dụ `max-w-md` cho một hộp thoại nhỏ), không còn ở container chính của trang nào.

- [ ] **Step 6: Chạy cả hai lệnh kiểm**

Run: `npm run check:legacy && npm run check:tokens && npm run build`
Expected: `check:legacy` in `0 cho con dung bang mau mac dinh` và thoát 0; `check:tokens` xanh; build xanh.

Nếu còn sót vài chỗ có lý do chính đáng (ví dụ màu của bên thứ ba), sửa nốt — không nới lệnh kiểm.

- [ ] **Step 7: Commit theo từng cụm**

Ba commit riêng, không gộp:

```bash
git add src/app/product src/app/cart src/app/checkout src/app/search src/app/category src/app/payment src/app/login src/app/register src/app/forgot-password src/app/reset-password src/app/maintenance src/app/not-found.tsx src/app/error.tsx src/app/global-error.tsx src/app/loading.tsx
git commit -m "refactor(theme): dua cum trang cong khai ve token Zoldify

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"

git add src/app/profile src/app/addresses src/app/notifications src/app/shop
git commit -m "refactor(theme): dua cum tai khoan va shop ve token Zoldify

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"

git add src/app/admin src/app/chat src/components package.json
git commit -m "refactor(theme): dua cum admin, chat va component dung chung ve token Zoldify

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Viết lại `ARCHITECTURE.md` và chốt cổng nghiệm thu đợt 0

**Files:**
- Modify: `ARCHITECTURE.md`
- Create: `docs/superpowers/plans/2026-08-06-redesign-dot-0-ket-qua.md`

- [ ] **Step 1: Viết lại `ARCHITECTURE.md`**

File hiện tại mô tả một project PHP thuần tên "UniMarket" với `app/Controllers`, `app/Models`, `public/index.php` — không còn liên quan gì tới Next.js đang chạy. Thay bằng mô tả đúng: App Router, `src/app` là route, `src/components/ui` là primitive dùng chung, `src/services` gọi API qua `src/lib/http.ts`, `src/context` giữ auth và giỏ hàng, hệ token màu ở `globals.css` + `tailwind.config.ts`, và **luật**: mọi màu mới phải đi qua token, mọi trang phải bọc `PageShell`, mọi trạng thái phải qua `StatusBadge`.

- [ ] **Step 2: Chạy đủ bộ kiểm**

```bash
npm run check:tokens
npm run check:legacy
npm run build
```
Cả ba phải xanh.

- [ ] **Step 3: Đo trên trình duyệt — cần backend đang chạy**

Với mỗi trang trong danh sách dưới, chụp ở **390px** và **1440px**, kiểm ba điều: không tràn ngang, tab được hết bằng bàn phím và thấy rõ focus, không còn mảng xám `#F9FAFB` lạc lõng.

Trang: `/`, `/search`, `/product/[id]`, `/cart`, `/checkout`, `/profile`, `/profile/orders`, `/admin`, `/admin/orders`.

Riêng contrast trên nút gradient và trên ảnh nền: **lấy mẫu pixel thật** bằng canvas (`ctx.fillStyle = màu` rồi đọc pixel), không đọc `getComputedStyle` — với gradient nó trả về màu nền trong suốt và bỏ sót lỗi thật.

Nếu backend chưa chạy được, ghi rõ "chưa đo được" vào kết quả, **không** đánh dấu đã đo.

- [ ] **Step 4: Ghi kết quả đợt 0**

Tạo `docs/superpowers/plans/2026-08-06-redesign-dot-0-ket-qua.md` gồm: con số `check:legacy` trước/sau, danh sách lớp từng bị bỏ im lặng nay đã sinh CSS, bảng contrast các cặp token, ảnh chụp trước/sau, và danh sách những gì chưa đo được cùng lý do.

- [ ] **Step 5: Commit**

```bash
git add ARCHITECTURE.md docs/superpowers/plans/2026-08-06-redesign-dot-0-ket-qua.md
git commit -m "docs: viet lai ARCHITECTURE.md va ghi ket qua dot 0

ARCHITECTURE.md dang mo ta project PHP thuan 'UniMarket' voi app/Controllers va
public/index.php — khong con lien quan gi toi Next.js dang chay.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Đánh dấu thẻ board**

Đưa thẻ "Redesign đợt 0 — Tầng nền: token, shadcn/ui, primitive, 3 khung trang" sang Done kèm tóm tắt một dòng.

---

## Cổng nghiệm thu đợt 0

Đợt 0 chỉ xong khi cả bảy mục dưới đây đạt:

1. `npm run check:tokens` xanh — không lớp nào bị Tailwind bỏ im lặng, mọi cặp token phẳng đạt ≥ 4.5:1.
2. `npm run check:legacy` in `0 cho con dung bang mau mac dinh`.
3. `npm run build` xanh.
4. Trang chủ và `Header` trông y hệt trước, trừ viền đổi từ xám `#E2E8F0` sang ink 8%.
5. Ảnh chụp 390px và 1440px cho 9 trang ở Task 10 Step 3.
6. Không tràn ngang ở 390px trên cả 9 trang.
7. Nút shadcn mang xanh `oklch(0.508 0.153 258)`, không phải xanh mặc định của shadcn.
