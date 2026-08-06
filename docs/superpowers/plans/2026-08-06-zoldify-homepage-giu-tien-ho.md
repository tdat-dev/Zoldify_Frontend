# Trang chủ Zoldify "Giữ tiền hộ" — Kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay trang chủ Zoldify bằng một trang có hero khổ lớn kể đúng cơ chế ký quỹ có thật của sản phẩm, giữ nguyên phần chợ dạng lưới thẻ bên dưới.

**Architecture:** Tách `src/app/page.tsx` (hiện đang ôm tất cả) thành các component nhỏ trong `src/components/home/`. Nền tảng chữ và màu đặt ở `globals.css` + `tailwind.config.ts`. Đồng xu ký quỹ là một component độc lập, nhận tiến độ cuộn qua props, không tự đọc DOM của component khác.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind 3.4, `next/font/google` (Archivo variable), SVG nội tuyến, CSS transform. Không thêm thư viện animation.

## Global Constraints

Mọi task đều phải tuân thủ, không nhắc lại ở từng task:

- **Không thêm dependency vào `package.json`.** Harness kiểm thử nằm ngoài repo tại `C:/Users/tvmar/AppData/Local/Temp/claude/D--Zoldify/2935dfe8-473c-42f5-a095-c8ca3b853cc6/scratchpad/`.
- **Không sửa** `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/Toast.tsx`, `src/app/layout.tsx` (trừ đúng dòng font ở Task 1), hay bất kỳ route nào ngoài `/`.
- **Màu chỉ lấy từ token.** Cấm hex rời trong JSX. Token đã có: `brand`, `brand-dark`, `brand-accent`. Token mới thêm ở Task 1.
- **Thang z-index có tên**: `dropdown 100, sticky 200, backdrop 300, modal 400, toast 500, tooltip 600`. Cấm `z-[9999]`.
- **Copy chỉ lấy từ bảng ở mục 3.4 của spec.** Không em-dash, không emoji, sentence case, không Title Case Mỗi Từ.
- **Không bịa dữ liệu.** Không vẽ trạng thái escrow lên tin đăng chưa bán.
- **Mọi animation phải có nhánh `prefers-reduced-motion: reduce`.** Không bao giờ gate visibility của nội dung bằng animation.
- **Chạy `npx tsc --noEmit` sạch trước mỗi commit.**
- **Không chạy `npm run build` khi dev server đang chạy** (dùng chung `.next`, sẽ làm hỏng dev server — đã xảy ra ngày 05-08).
- Giá trị token màu lấy nguyên văn từ spec mục 3.2. Giá trị `clamp()` lấy nguyên văn từ spec mục 3.3.

---

## File Structure

| File | Trạng thái | Trách nhiệm |
|------|-----------|-------------|
| `tailwind.config.ts` | Sửa | Thêm `fontFamily.sans` trỏ biến Archivo, thêm màu `surface`/`ink` |
| `src/app/globals.css` | Sửa | Khai báo token OKLCH, class `.hero-display`, `.coin-*`, nhánh reduced-motion |
| `src/app/layout.tsx` | Sửa | Đổi `Inter` sang `Archivo` variable |
| `src/components/home/SectionState.tsx` | Tạo | Trạng thái tải/lỗi/rỗng dùng chung |
| `src/components/home/ProductCard.tsx` | Tạo | Thẻ một sản phẩm |
| `src/components/home/EscrowCoin.tsx` | Tạo | SVG đồng xu, không tự biết mình ở đâu |
| `src/components/home/useCoinJourney.ts` | Tạo | Hook tính tiến độ cuộn và toạ độ đích |
| `src/components/home/HomeHero.tsx` | Tạo | Hero: eyebrow, display, phụ đề, 2 CTA |
| `src/components/home/EscrowStages.tsx` | Tạo | Mục "Tiền đi đường nào", ba chặng |
| `src/app/page.tsx` | Sửa | Chỉ còn: gọi API, quản state, ghép component |

---

## Task 1: Nền tảng chữ và màu

**Files:**
- Modify: `src/app/layout.tsx` (dòng import font)
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: không
- Produces: biến CSS `--font-archivo`; token Tailwind `bg-surface-page`, `bg-surface-card`, `text-ink`, `text-ink-muted`; class `.hero-display`, `.label-condensed`

- [ ] **Step 1: Viết bài kiểm tra sẽ trượt**

Tạo `scratchpad/check-type.mjs`:

```js
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox'], defaultViewport:{width:1440,height:900} });
const p = await b.newPage();
await p.goto('http://localhost:3000/', { waitUntil:'networkidle2', timeout:60000 });
await p.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1500));

const r = await p.evaluate(() => {
  const cs = getComputedStyle(document.body);
  const probe = document.createElement('div');
  probe.textContent = 'Đồ cũ vẫn chất ế ộ ữ';
  probe.style.cssText = 'position:fixed;top:0;left:0;font-size:40px';
  document.body.appendChild(probe);
  const rs = getComputedStyle(document.documentElement);
  return {
    bodyFont: cs.fontFamily,
    surfacePage: rs.getPropertyValue('--surface-page').trim(),
    ink: rs.getPropertyValue('--ink').trim(),
  };
});
const ok = /Archivo/i.test(r.bodyFont) && r.surfacePage !== '' && r.ink !== '';
console.log(JSON.stringify(r, null, 1));
console.log(ok ? 'PASS' : 'FAIL');
await b.close();
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Chạy để xác nhận nó trượt**

```bash
cd "C:/Users/tvmar/AppData/Local/Temp/claude/D--Zoldify/2935dfe8-473c-42f5-a095-c8ca3b853cc6/scratchpad" && node check-type.mjs
```

Kỳ vọng: `FAIL`, `bodyFont` chứa `Inter`, `--surface-page` rỗng.

- [ ] **Step 3: Đổi font ở layout.tsx**

Thay dòng import và khai báo font:

```tsx
import { Archivo } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});
```

Và trên thẻ `<body>`:

```tsx
<body className={`${archivo.variable} font-sans`}>
```

Xoá import `Inter` và biến `inter`.

- [ ] **Step 4: Thêm token màu vào globals.css**

Chèn vào đầu `@layer base { :root { ... } }` đang có:

```css
    /* Bảng màu "Giữ tiền hộ" — spec 2026-08-06 mục 3.2.
       Neutral ngả về hue thương hiệu (258), chroma trong khoảng 0.005-0.015
       theo craft-rules. KHÔNG dùng kem/sand: nền warm-neutral bị cấm. */
    --surface-page: oklch(0.983 0.006 258);
    --surface-card: oklch(1 0 0);
    --ink: oklch(0.24 0.021 258);
    --ink-muted: oklch(0.52 0.018 258);
```

- [ ] **Step 5: Thêm class chữ vào globals.css**

Chèn sau khối `@layer base`:

```css
@layer components {
  /* Display moment duy nhất của trang. Trần 6rem của craft-rules áp cho tiêu đề
     mục, không áp cho một hero moment trên LANDING_BRAND (Gate C). */
  .hero-display {
    font-size: clamp(3.25rem, 9vw, 8.5rem);
    font-weight: 900;
    font-stretch: 125%;
    font-variation-settings: 'wdth' 125;
    /* 0.92 chứ không phải 0.84: ở 0.84 khoảng cách dòng đo được là ÂM 18-20px,
       mũ của Ề/Ộ dòng dưới thụt lên chân dòng trên. */
    line-height: 0.92;
    letter-spacing: -0.035em;
    /* chừa chỗ cho dấu tiếng Việt khỏi bị cắt ở mép trên */
    padding-top: 0.08em;
    text-wrap: balance;
  }

  .label-condensed {
    font-size: 0.8125rem;
    font-weight: 600;
    font-stretch: 62%;
    font-variation-settings: 'wdth' 62;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .price-figure {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }
}
```

- [ ] **Step 6: Nối token vào Tailwind**

Trong `tailwind.config.ts`, bên trong `theme.extend`, thêm:

```ts
      fontFamily: {
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
```

và bên trong `theme.extend.colors`, thêm cạnh `brand`:

```ts
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
        },
```

- [ ] **Step 7: Chạy lại bài kiểm tra**

```bash
cd "C:/Users/tvmar/AppData/Local/Temp/claude/D--Zoldify/2935dfe8-473c-42f5-a095-c8ca3b853cc6/scratchpad" && node check-type.mjs
```

Kỳ vọng: `PASS`, `bodyFont` chứa `Archivo`, hai token có giá trị.

- [ ] **Step 8: Kiểm dấu tiếng Việt render bằng đúng Archivo**

Chạy lại `font.mjs` đã có ở scratchpad phiên trước (hoặc tạo lại theo mẫu ở đó). Kỳ vọng: cả chuỗi latin-only lẫn chuỗi có dấu đều trả `familyName: "Archivo"`, không rơi về fallback.

- [ ] **Step 9: Typecheck và commit**

```bash
npx tsc --noEmit
git add src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat(home): nền tảng chữ Archivo và token màu OKLCH"
```

---

## Task 2: Tách ProductCard và SectionState ra file riêng, áp token của Task 1

Tách component **và** áp bộ token chữ/màu mà Task 1 vừa dựng. Bố cục, cấu trúc DOM, và mọi
nhánh điều kiện phải y hệt trước và sau; phần được phép đổi là **cách trình bày**: màu chữ
sang `ink`/`ink-muted`, và giá tiền sang class `price-figure`.

> Ghi chú sửa ngày 2026-08-06: bản đầu của task này ghi "thuần refactor, render y hệt" nhưng
> đoạn code mẫu của chính nó lại đổi giá từ `font-semibold` (600) sang `price-figure`
> (700 + `tabular-nums`). Reviewer bắt đúng mâu thuẫn đó. Chủ dự án phân xử: **giữ code, sửa
> nhãn** — vì spec mục 3.3 ghi rõ "Số tiền: `tabular-nums`", và `price-figure` sinh ra đúng
> cho việc này. Cái sai là ở nhãn, không phải ở code.

**Files:**
- Create: `src/components/home/SectionState.tsx`
- Create: `src/components/home/ProductCard.tsx`
- Modify: `src/app/page.tsx` (xoá hai hàm nội bộ, import từ file mới)

**Interfaces:**
- Consumes: `formatPrice` từ `@/lib/format`
- Produces:
  - `export type LoadState = 'loading' | 'ready' | 'error'`
  - `export function SectionState(props: { state: LoadState; empty: boolean }): JSX.Element | null`
  - `export function ProductCard(props: { item: any }): JSX.Element`

- [ ] **Step 1: Chụp ảnh trang chủ hiện tại làm mốc so sánh**

```bash
cd "C:/Users/tvmar/AppData/Local/Temp/claude/D--Zoldify/2935dfe8-473c-42f5-a095-c8ca3b853cc6/scratchpad" && node ../../d1002517-a6a6-4c39-8569-95fe541e1b71/scratchpad/audit.mjs '[["home","/"]]' 1440 900 before-refactor
```

Lưu lại đường dẫn ảnh. Đây là mốc: sau refactor phải giống hệt.

- [ ] **Step 2: Tạo SectionState.tsx**

```tsx
import { AlertCircle, Loader } from 'lucide-react';

export type LoadState = 'loading' | 'ready' | 'error';

export function SectionState({ state, empty }: { state: LoadState; empty: boolean }) {
  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-ink-muted text-sm">
        <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
        Đang tải…
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-ink text-sm">
        <AlertCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
        Không tải được dữ liệu. Kiểm tra kết nối rồi tải lại trang.
      </div>
    );
  }
  if (empty) {
    return <p className="py-10 text-center text-sm text-ink-muted">Chưa có sản phẩm nào ở đây.</p>;
  }
  return null;
}
```

- [ ] **Step 3: Tạo ProductCard.tsx**

Task này là refactor thuần: **không thêm prop mới, không thêm attribute mới**. Đích hạ cánh
của đồng xu (`data-coin-target`) do Task 7 thêm, vì Task 6 đã có nhánh dự phòng khi chưa có đích.

```tsx
import Link from 'next/link';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export function ProductCard({ item }: { item: any }) {
  const stock = item.stock ?? item.quantity;
  return (
    <Link
      href={`/product/${item.id}`}
      className="block bg-surface-card rounded-sm shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-brand/30 overflow-hidden"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <Package className="w-10 h-10 text-ink-muted" aria-hidden="true" />
        )}
        {Number(item.sold) > 0 && (
          <span className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs text-center py-1">
            Đã bán {item.sold}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-sm text-ink line-clamp-2 mb-2 min-h-[40px] font-normal">{item.name}</h3>
        <div className="flex justify-between items-end gap-2">
          <span className="text-red-600 text-base price-figure">
            {formatPrice(item.price)}
          </span>
          {Number.isFinite(Number(stock)) && (
            <span className="text-xs text-ink-muted whitespace-nowrap">Còn {stock}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Sửa page.tsx dùng file mới**

Xoá hai hàm `ProductCard` và `SectionState` cùng `type LoadState` khỏi `page.tsx`. Thay bằng:

```tsx
import { ProductCard } from '@/components/home/ProductCard';
import { SectionState, type LoadState } from '@/components/home/SectionState';
```

Xoá các import giờ không dùng nữa ở `page.tsx`: `AlertCircle`, `Loader`, `formatPrice`. Giữ `Package` nếu phần danh mục còn dùng.

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```

Kỳ vọng: sạch. Nếu báo `formatPrice` khai báo mà không dùng, xoá import đó ở `page.tsx`.

- [ ] **Step 6: Chụp lại và so với mốc**

```bash
cd "C:/Users/tvmar/AppData/Local/Temp/claude/D--Zoldify/2935dfe8-473c-42f5-a095-c8ca3b853cc6/scratchpad" && node ../../d1002517-a6a6-4c39-8569-95fe541e1b71/scratchpad/audit.mjs '[["home","/"]]' 1440 900 after-refactor
```

Mở hai ảnh `before-refactor-home.png` và `after-refactor-home.png`. Khác biệt được phép: màu chữ
nhích nhẹ do đổi sang token `ink`/`ink-muted`, và giá tiền đậm hơn một bậc kèm chữ số đều bề rộng
(`price-figure`). **Bố cục, cấu trúc DOM và thứ tự phần tử phải y hệt** — đó mới là thứ ảnh này
dùng để chứng minh.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/ src/app/page.tsx
git commit -m "refactor(home): tách ProductCard và SectionState khỏi page.tsx"
```

---

## Task 3: Component đồng xu

Đồng xu không tự biết mình ở đâu. Nó nhận `progress` (0→1) và vẽ. Ai quyết định progress là việc của Task 6.

**Files:**
- Create: `src/components/home/EscrowCoin.tsx`

**Interfaces:**
- Consumes: không
- Produces: `export function EscrowCoin(props: { progress: number; className?: string; size?: number }): JSX.Element`

- [ ] **Step 1: Viết bài kiểm tra sẽ trượt**

Tạo `scratchpad/check-coin.mjs`:

```js
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox'], defaultViewport:{width:1440,height:900} });
const p = await b.newPage();
await p.goto('http://localhost:3000/', { waitUntil:'networkidle2', timeout:60000 });
await new Promise(r => setTimeout(r, 2500));
const r = await p.evaluate(() => {
  const el = document.querySelector('[data-escrow-coin]');
  if (!el) return { found:false };
  const s = el.querySelector('svg');
  return { found:true, hasSvg:!!s, ariaHidden: el.getAttribute('aria-hidden'), tag: el.tagName };
});
console.log(JSON.stringify(r));
const ok = r.found && r.hasSvg && r.ariaHidden === 'true';
console.log(ok ? 'PASS' : 'FAIL');
await b.close();
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Chạy để xác nhận trượt**

```bash
node check-coin.mjs
```

Kỳ vọng: `{"found":false}` và `FAIL`.

- [ ] **Step 3: Viết EscrowCoin.tsx**

```tsx
"use client";

/**
 * Đồng xu ký quỹ. Nó KHÔNG mang trạng thái của một đơn hàng nào.
 * Nó chỉ minh hoạ cơ chế chung: tiền đứng lại rồi mới đi tiếp.
 * Vẽ trạng thái escrow lên từng tin đăng là bịa dữ liệu (tin chưa bán
 * thì chưa có escrow), nên tuyệt đối không làm.
 */
export function EscrowCoin({
  progress,
  className = '',
  size = 64,
}: {
  progress: number;
  className?: string;
  size?: number;
}) {
  // Xu lật theo hành trình để thấy nó là vật thể, không phải chấm tròn.
  // PHẢI là bội số của 360. rotateY không có perspective thì bề rộng bị nhân
  // cos(góc); kết thúc ở 540deg (=180deg, cos=-1) làm xu hạ cánh LẬT GƯƠNG,
  // ký hiệu ₫ hiện ngược đúng lúc nó đậu xuống một mức giá thật.
  const spin = progress * 720;
  return (
    <span
      data-escrow-coin
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} style={{ transform: `rotateY(${spin}deg)` }}>
        <circle cx="32" cy="32" r="30" fill="var(--brand-solid)" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="var(--brand-accent-solid)" strokeWidth="3" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.5" />
        <text
          x="32"
          y="43"
          textAnchor="middle"
          fill="#fff"
          fontSize="30"
          fontWeight="700"
          fontFamily="var(--font-archivo), sans-serif"
        >
          ₫
        </text>
      </svg>
    </span>
  );
}
```

- [ ] **Step 4: Thêm biến màu đặc cho SVG**

SVG không đọc được class Tailwind, cần biến CSS. Thêm vào `:root` trong `globals.css`, ngay dưới các token đã thêm ở Task 1:

```css
    --brand-solid: #2C67C8;
    --brand-accent-solid: #14708A;
```

- [ ] **Step 5: Gắn tạm vào page.tsx để kiểm tra**

Trong `src/app/page.tsx`, thêm import và đặt tạm ngay dưới thẻ `<h1>` hiện có:

```tsx
import { EscrowCoin } from '@/components/home/EscrowCoin';
```

```tsx
<EscrowCoin progress={0} />
```

- [ ] **Step 6: Chạy lại bài kiểm tra**

```bash
node check-coin.mjs
```

Kỳ vọng: `PASS`.

- [ ] **Step 7: Typecheck và commit**

```bash
npx tsc --noEmit
git add src/components/home/EscrowCoin.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat(home): component đồng xu ký quỹ"
```

---

## Task 4: Hero

**Files:**
- Create: `src/components/home/HomeHero.tsx`
- Modify: `src/app/page.tsx` (thay `<h1>` hiện tại bằng `<HomeHero />`)

**Interfaces:**
- Consumes: `EscrowCoin` từ Task 3
- Produces: `export function HomeHero(props: { coinProgress: number }): JSX.Element`

- [ ] **Step 1: Viết bài kiểm tra sẽ trượt**

Tạo `scratchpad/check-hero.mjs`. Kiểm 4 điều: có đúng một `h1`; chữ display không tràn ngang ở mọi breakpoint; dấu tiếng Việt không bị cắt ở mép trên; hai CTA có tên đọc được.

```js
import puppeteer from 'puppeteer-core';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS=[320,390,768,1440];
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox']});
let ok=true;
for(const w of WIDTHS){
  const p=await b.newPage();
  await p.setViewport({width:w,height:900});
  await p.goto('http://localhost:3000/',{waitUntil:'networkidle2',timeout:60000});
  await p.evaluate(()=>document.fonts.ready);
  await new Promise(r=>setTimeout(r,1200));
  const r=await p.evaluate(()=>{
    const h1=document.querySelectorAll('h1');
    const d=document.querySelector('.hero-display');
    const de=document.documentElement;
    const dr=d?d.getBoundingClientRect():null;
    const ctas=[...document.querySelectorAll('[data-hero-cta]')].map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim());
    return {
      h1Count:h1.length,
      overflowX: de.scrollWidth > de.clientWidth+1,
      displayTop: dr?+dr.top.toFixed(1):null,
      clippedTop: dr ? dr.top < 0 : null,
      ctas,
    };
  });
  const pass = r.h1Count===1 && !r.overflowX && r.clippedTop===false && r.ctas.length===2 && r.ctas.every(Boolean);
  if(!pass) ok=false;
  console.log(w, JSON.stringify(r), pass?'ok':'FAIL');
  await p.close();
}
console.log(ok?'PASS':'FAIL');
await b.close();
process.exit(ok?0:1);
```

- [ ] **Step 2: Chạy để xác nhận trượt**

```bash
node check-hero.mjs
```

Kỳ vọng: `FAIL` vì chưa có `.hero-display` và chưa có `[data-hero-cta]`.

- [ ] **Step 3: Viết HomeHero.tsx**

Chữ tràn mép trái là điểm phá bố cục (Gate B): container hero dùng lề âm ở bên trái từ `md` trở lên, và `overflow-x: clip` ở khối cha để không sinh thanh cuộn ngang.

Task 4 **chưa** gắn đồng xu. Nó chỉ để sẵn một `<span>` neo có `position: relative` để Task 6
đặt xu vào. Không tạo component ẩn hay prop chết chỉ để "chuẩn bị".

```tsx
import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative overflow-x-clip pt-10 pb-14 md:pt-16 md:pb-20">
      <p className="label-condensed text-ink-muted mb-5">Đồ cũ, vẫn chất</p>

      {/* Điểm phá bố cục: chữ tràn khỏi mép trái canvas từ md trở lên. */}
      <h1 className="hero-display text-ink md:-ml-[7vw] lg:-ml-[9vw]">
        <span data-coin-anchor className="relative inline-flex items-baseline">GIỮ</span>
        <br />
        TIỀN HỘ
      </h1>

      <p className="mt-7 max-w-[46ch] text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55] text-ink-muted [text-wrap:pretty]">
        Bạn chuyển tiền cho Zoldify, không chuyển cho người lạ. Trong lúc hàng đang đi, người bán không rút được đồng nào.
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href="/search"
          data-hero-cta
          className="px-6 py-3 bg-brand text-white rounded-sm font-medium hover:bg-brand-dark transition-colors"
        >
          Tìm giáo trình, đồ dùng
        </Link>
        <Link
          href="/product/create"
          data-hero-cta
          className="px-6 py-3 border border-ink/25 text-ink rounded-sm font-medium hover:bg-ink/5 transition-colors"
        >
          Đăng bán đồ của bạn
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Gắn vào page.tsx**

Trong `src/app/page.tsx`, xoá thẻ `<h1>` hiện tại và khối `<EscrowCoin progress={0} />` gắn tạm ở Task 3 (giàn giáo của Task 3, tới đây là hết nhiệm vụ). Xoá luôn import `EscrowCoin` khỏi `page.tsx`. Thay bằng:

```tsx
import { HomeHero } from '@/components/home/HomeHero';
```

```tsx
<HomeHero />
```

- [ ] **Step 5: Chạy lại bài kiểm tra**

```bash
node check-hero.mjs
```

Kỳ vọng: `PASS` ở cả 4 chiều rộng. Nếu `overflowX` true, giảm giá trị lề âm; nếu `clippedTop` true, tăng `padding-top` của `.hero-display`.

- [ ] **Step 6: Đo contrast bằng lấy mẫu pixel**

Chữ hero nằm trên nền phẳng nên đọc computed-style là đủ, nhưng CTA `bg-brand` phải đo pixel vì nếu sau này đổi sang gradient thì detector sẽ mù. Dùng `grad.mjs` đã có ở scratchpad phiên trước, đổi selector sang `[data-hero-cta]`.

Kỳ vọng: chữ trắng trên CTA đạt ≥ 4.5:1.

- [ ] **Step 7: Typecheck và commit**

```bash
npx tsc --noEmit
git add src/components/home/HomeHero.tsx src/app/page.tsx
git commit -m "feat(home): hero Giữ tiền hộ, chữ display tràn mép trái"
```

---

## Task 5: Mục "Tiền đi đường nào"

**Files:**
- Create: `src/components/home/EscrowStages.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: không
- Produces: `export function EscrowStages(props: { firstPrice?: string }): JSX.Element`

- [ ] **Step 1: Viết bài kiểm tra sẽ trượt**

Tạo `scratchpad/check-stages.mjs`:

```js
import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle2',timeout:60000});
await new Promise(r=>setTimeout(r,2000));
const r=await p.evaluate(()=>{
  const st=[...document.querySelectorAll('[data-escrow-stage]')];
  return { count:st.length, labels:st.map(e=>e.textContent.replace(/\s+/g,' ').trim().slice(0,40)) };
});
console.log(JSON.stringify(r,null,1));
const ok = r.count===3;
console.log(ok?'PASS':'FAIL');
await b.close();
process.exit(ok?0:1);
```

- [ ] **Step 2: Chạy để xác nhận trượt**

```bash
node check-stages.mjs
```

Kỳ vọng: `count: 0`, `FAIL`.

- [ ] **Step 3: Viết EscrowStages.tsx**

Ba chặng lấy nguyên từ mã nguồn backend: tạo khi đơn `PAID`, `RELEASED` khi giao xong, `REFUNDED` khi huỷ. Câu chữ mô tả cơ chế, không hứa chính sách.

```tsx
const STAGES = [
  {
    key: 'pay',
    title: 'Bạn trả tiền',
    body: 'Tiền vào Zoldify khi đơn được thanh toán, không vào thẳng túi người bán.',
  },
  {
    key: 'hold',
    title: 'Zoldify giữ',
    body: 'Trong lúc hàng đang đi, tiền đứng lại ở đây. Người bán thấy đơn nhưng chưa rút được.',
  },
  {
    key: 'refund',
    title: 'Huỷ đơn, tiền quay lại',
    body: 'Khi đơn còn ở bước chờ xác nhận hoặc đã xác nhận, bạn bấm huỷ là tiền hoàn về tài khoản của bạn.',
  },
];

export function EscrowStages({ firstPrice }: { firstPrice?: string }) {
  return (
    <section aria-labelledby="escrow-how" className="py-14 md:py-20">
      <h2 id="escrow-how" className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-extrabold text-ink [text-wrap:balance]" style={{ fontVariationSettings: "'wdth' 112" }}>
        Tiền đi đường nào
      </h2>

      <ol className="mt-9 grid gap-6 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <li
            key={s.key}
            data-escrow-stage={s.key}
            className="relative rounded-sm bg-surface-card p-6 shadow-sm"
          >
            <span className="label-condensed text-brand">Chặng {i + 1}</span>
            <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            {i === 2 && firstPrice && (
              <p className="mt-4 text-sm text-ink">
                Ví dụ với món rẻ nhất đang bán: <span className="price-figure text-brand">{firstPrice}</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 4: Gắn vào page.tsx**

```tsx
import { EscrowStages } from '@/components/home/EscrowStages';
```

Đặt ngay sau `<HomeHero />`:

```tsx
<EscrowStages firstPrice={latestProducts[0] ? formatPrice(latestProducts[0].price) : undefined} />
```

Thêm lại import `formatPrice` vào `page.tsx` nếu đã xoá ở Task 2.

- [ ] **Step 5: Chạy lại bài kiểm tra**

```bash
node check-stages.mjs
```

Kỳ vọng: `count: 3`, `PASS`.

- [ ] **Step 6: Kiểm câu chữ không hứa quá**

Đọc to ba đoạn body. Không được xuất hiện: "cam kết", "đảm bảo", "bảo hiểm", "100%", hay bất kỳ mốc thời gian hoàn tiền nào. Nếu có, sửa lại thành mô tả cơ chế.

- [ ] **Step 7: Typecheck và commit**

```bash
npx tsc --noEmit
git add src/components/home/EscrowStages.tsx src/app/page.tsx
git commit -m "feat(home): mục Tiền đi đường nào, ba chặng ký quỹ"
```

---

## Task 6: Hành trình đồng xu theo cuộn

**Files:**
- Create: `src/components/home/useCoinJourney.ts`
- Modify: `src/components/home/HomeHero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `EscrowCoin` (Task 3)
- Produces: `export function useCoinJourney(): { progress: number; reduced: boolean }`

- [ ] **Step 1: Viết bài kiểm tra sẽ trượt**

Tạo `scratchpad/check-journey.mjs`. Kiểm 3 điều: cuộn làm progress đổi; bật reduced-motion thì xu không di chuyển; tắt JS thì hero vẫn đủ chữ và CTA.

```js
import puppeteer from 'puppeteer-core';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox']});
let ok=true;

// 1. cuộn thì xu di chuyển
{
  const p=await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.goto('http://localhost:3000/',{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  const top=await p.evaluate(()=>{const e=document.querySelector('[data-escrow-coin]');return e?e.getBoundingClientRect().top:null;});
  await p.evaluate(()=>window.scrollTo(0,900));
  await new Promise(r=>setTimeout(r,900));
  const after=await p.evaluate(()=>{const e=document.querySelector('[data-escrow-coin]');return e?e.getBoundingClientRect().top:null;});
  const moved = top!==null && after!==null && Math.abs(after-top)>4;
  console.log('scroll moves coin:', top, '->', after, moved?'ok':'FAIL'); if(!moved) ok=false;
  await p.close();
}

// 2. reduced-motion thì xu đứng yên
{
  const p=await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.goto('http://localhost:3000/',{waitUntil:'networkidle2',timeout:60000});
  await new Promise(r=>setTimeout(r,2000));
  const t1=await p.evaluate(()=>{const e=document.querySelector('[data-escrow-coin]');return e?e.getBoundingClientRect().top:null;});
  await p.evaluate(()=>window.scrollTo(0,900));
  await new Promise(r=>setTimeout(r,900));
  const t2=await p.evaluate(()=>{const e=document.querySelector('[data-escrow-coin]');return e?e.getBoundingClientRect().top:null;});
  // xu neo trong dòng chữ nên vẫn trôi theo trang; điều cần là nó KHÔNG bị dịch thêm
  const style=await p.evaluate(()=>{const e=document.querySelector('[data-escrow-coin]');return e?getComputedStyle(e).transform:null;});
  const still = style==='none'||style==='matrix(1, 0, 0, 1, 0, 0)';
  console.log('reduced-motion keeps coin untranslated:', style, still?'ok':'FAIL'); if(!still) ok=false;
  await p.close();
}

// 3. tắt JS vẫn thấy hero
{
  const p=await b.newPage(); await p.setViewport({width:1440,height:900});
  await p.setJavaScriptEnabled(false);
  await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded',timeout:60000});
  await new Promise(r=>setTimeout(r,1500));
  const r=await p.evaluate(()=>({
    text:(document.querySelector('h1')?.innerText||'').replace(/\s+/g,' ').trim(),
    ctas:document.querySelectorAll('[data-hero-cta]').length,
  })).catch(()=>({text:'',ctas:0}));
  const pass = r.text.includes('GIỮ') && r.ctas===2;
  console.log('no-JS hero visible:', JSON.stringify(r), pass?'ok':'FAIL'); if(!pass) ok=false;
  await p.close();
}

console.log(ok?'PASS':'FAIL');
await b.close();
process.exit(ok?0:1);
```

- [ ] **Step 2: Chạy để xác nhận trượt**

```bash
node check-journey.mjs
```

Kỳ vọng: `FAIL` ở mục 1 (xu chưa di chuyển vì `size={0}`, `hidden`).

- [ ] **Step 3: Viết useCoinJourney.ts**

```ts
"use client";

import { useEffect, useState } from 'react';

/**
 * Tiến độ hành trình của đồng xu, 0 ở đỉnh trang và 1 khi tới đích.
 * Đích là phần tử [data-coin-target] (giá của thẻ sản phẩm đầu tiên).
 * Không có đích thì hành trình kết thúc ở cuối mục ba chặng.
 */
export function useCoinJourney() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced) { setProgress(0); return; }

    let raf = 0;
    const compute = () => {
      raf = 0;
      const target =
        document.querySelector('[data-coin-target]') ||
        document.querySelector('[data-escrow-stage="refund"]');
      if (!target) { setProgress(0); return; }
      const start = 0;
      const end = window.scrollY + target.getBoundingClientRect().top - window.innerHeight * 0.55;
      const span = Math.max(end - start, 1);
      const p = Math.min(Math.max((window.scrollY - start) / span, 0), 1);
      setProgress(p);
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return { progress, reduced };
}
```

- [ ] **Step 4: Cho đồng xu hiện thật trong hero**

Trong `HomeHero.tsx`, thêm `"use client"` ở dòng đầu, thêm import, đổi chữ ký, và đặt xu vào
span neo đã có sẵn từ Task 4:

```tsx
"use client";

import Link from 'next/link';
import { EscrowCoin } from './EscrowCoin';

export function HomeHero({ coinProgress, reduced }: { coinProgress: number; reduced: boolean }) {
```

Thay `<span data-coin-anchor className="relative inline-flex items-baseline">GIỮ</span>` bằng:

```tsx
        <span data-coin-anchor className="relative inline-flex items-baseline">
          GIỮ
          <EscrowCoin
            progress={reduced ? 0 : coinProgress}
            size={0}
            className="!w-[0.62em] !h-[0.62em] absolute -right-[0.72em] top-[0.16em]"
            style={
              reduced
                ? undefined
                : { transform: `translate3d(0, ${coinProgress * 62}vh, 0)` }
            }
          />
        </span>
```

Và trong `EscrowCoin.tsx`, nhận thêm `style`:

```tsx
export function EscrowCoin({
  progress,
  className = '',
  size = 64,
  style,
}: {
  progress: number;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
```

```tsx
    <span
      data-escrow-coin
      aria-hidden="true"
      className={`inline-block will-change-transform ${className}`}
      style={{ width: size || undefined, height: size || undefined, ...style }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ transform: `rotateY(${spin}deg)` }}>
```

- [ ] **Step 5: Nối hook vào page.tsx**

```tsx
import { useCoinJourney } from '@/components/home/useCoinJourney';
```

Trong `HomePage`:

```tsx
  const { progress: coinProgress, reduced } = useCoinJourney();
```

```tsx
<HomeHero coinProgress={coinProgress} reduced={reduced} />
```

- [ ] **Step 6: Chạy lại bài kiểm tra**

```bash
node check-journey.mjs
```

Kỳ vọng: `PASS` cả ba mục.

- [ ] **Step 7: Xem bằng mắt xem hành trình có nghĩa không**

Chụp 4 mốc cuộn (0, 25%, 60%, 100%) và xem đồng xu có thật sự đi từ chữ xuống tới giá không. Nếu nó chỉ trôi vô nghĩa hoặc bị che khuất, **cắt bỏ Task 6** thay vì giữ làm trang trí (rủi ro #3 trong spec). Ghi lại quyết định.

- [ ] **Step 8: Typecheck và commit**

```bash
npx tsc --noEmit
git add src/components/home/
git commit -m "feat(home): hành trình đồng xu theo cuộn, tôn trọng reduced-motion"
```

---

## Task 7: Ghép trang và gộp hai mục sản phẩm trùng nhau

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: tất cả component từ Task 2-6
- Produces: trang chủ hoàn chỉnh

- [ ] **Step 1: Viết bài kiểm tra tổng sẽ trượt**

Tạo `scratchpad/check-home.mjs`:

```js
import puppeteer from 'puppeteer-core';
const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox'],defaultViewport:{width:1440,height:900}});
const p=await b.newPage();
await p.goto('http://localhost:3000/',{waitUntil:'networkidle2',timeout:60000});
await new Promise(r=>setTimeout(r,2500));
const r=await p.evaluate(()=>{
  const heads=[...document.querySelectorAll('h1,h2')].map(e=>e.tagName+':'+e.textContent.trim().slice(0,32));
  const grids=[...document.querySelectorAll('[data-product-grid]')];
  return { heads, gridCount:grids.length, cardCount:document.querySelectorAll('[data-coin-target]').length };
});
console.log(JSON.stringify(r,null,1));
// đúng 1 lưới sản phẩm (đã gộp), đúng 1 đích cho đồng xu
const ok = r.gridCount===1 && r.cardCount===1 && r.heads.filter(h=>h.startsWith('H1')).length===1;
console.log(ok?'PASS':'FAIL');
await b.close();
process.exit(ok?0:1);
```

- [ ] **Step 2: Chạy để xác nhận trượt**

```bash
node check-home.mjs
```

Kỳ vọng: `gridCount: 0` (chưa gắn `data-product-grid`), `FAIL`.

- [ ] **Step 3: Thêm đích hạ cánh cho đồng xu vào ProductCard**

Đây là chỗ `data-coin-target` được thêm (cố ý hoãn từ Task 2 để giữ Task 2 là refactor thuần).

Trong `src/components/home/ProductCard.tsx`, đổi chữ ký:

```tsx
export function ProductCard({ item, isFirst = false }: { item: any; isFirst?: boolean }) {
```

và thẻ giá:

```tsx
          <span
            className="text-red-600 text-base price-figure"
            {...(isFirst ? { 'data-coin-target': 'true' } : {})}
          >
            {formatPrice(item.price)}
          </span>
```

- [ ] **Step 4: Gộp hai mục sản phẩm thành một**

Trong `src/app/page.tsx`: xoá hẳn khối `<section aria-labelledby="home-featured">`, giữ khối `home-latest` và đổi tiêu đề. Bản audit 05-08 đã chứng minh hai mục này render trùng dữ liệu.

Xoá luôn state `topProducts` và `topState` cùng lời gọi API `sort: 'featured'` — không còn ai dùng.

Khối còn lại:

```tsx
        <section aria-labelledby="home-listings" className="bg-surface-card rounded-sm shadow-sm p-5">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h2
              id="home-listings"
              className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-extrabold text-ink"
              style={{ fontVariationSettings: "'wdth' 112" }}
            >
              Đang bán ở Zoldify
            </h2>
          </div>

          {latestState !== 'ready' || latestProducts.length === 0 ? (
            <SectionState state={latestState} empty={latestProducts.length === 0} />
          ) : (
            <>
              <div data-product-grid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {latestProducts.map((item, i) => (
                  <ProductCard key={item.id} item={item} isFirst={i === 0} />
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <Link href="/search" className="bg-surface-card border border-ink/20 text-ink px-10 py-2.5 hover:bg-ink/5 transition-colors rounded-sm text-sm">
                  Xem thêm sản phẩm
                </Link>
              </div>
            </>
          )}
        </section>
```

- [ ] **Step 5: Đổi nền trang sang token**

Đổi `className="bg-gray-100 min-h-screen pb-20 md:pb-10"` ở khối ngoài cùng thành:

```tsx
    <div className="bg-surface-page min-h-screen pb-20 md:pb-10">
```

- [ ] **Step 6: Chạy lại bài kiểm tra tổng**

```bash
node check-home.mjs
```

Kỳ vọng: `PASS`.

- [ ] **Step 7: Chạy lại toàn bộ bài kiểm tra của các task trước**

```bash
node check-type.mjs && node check-coin.mjs && node check-hero.mjs && node check-stages.mjs && node check-journey.mjs && node check-home.mjs
```

Kỳ vọng: tất cả `PASS`. Nếu task nào trượt, sửa trước khi đi tiếp.

- [ ] **Step 8: Kiểm khi API chết**

Dùng `fail.mjs` đã có ở scratchpad phiên trước (chặn `localhost:8080` trả 500).

Kỳ vọng: hero và ba chặng vẫn hiện đủ (chúng là nội dung tĩnh), mục sản phẩm hiện đúng dòng "Không tải được dữ liệu", không có khối trắng rỗng nào.

- [ ] **Step 9: Kiểm bàn phím**

Tab từ đầu trang. Kỳ vọng: chặng đầu là "Tới nội dung chính", mọi control có tên đọc được, focus nhìn thấy ở từng chặng, hai CTA hero nằm đúng thứ tự thị giác.

- [ ] **Step 10: Chụp desktop và mobile để lưu hồ sơ**

```bash
node ../../d1002517-a6a6-4c39-8569-95fe541e1b71/scratchpad/audit.mjs '[["home","/"]]' 1440 900 final-desktop
node ../../d1002517-a6a6-4c39-8569-95fe541e1b71/scratchpad/audit.mjs '[["home","/"]]' 390 844 final-mobile mobile
```

Kỳ vọng từ output: `tiny: 0`, `overflowX: false`, `h1 = 1`. Mọi cảnh báo contrast trên nền gradient hoặc nền inline-style **phải đo lại bằng lấy mẫu pixel** trước khi kết luận là dương tính giả.

- [ ] **Step 11: Build sạch**

Dừng dev server trước, rồi:

```bash
npm run build
```

Kỳ vọng: `✓ Compiled successfully`, không lỗi prerender. Khởi động lại dev server sau khi build xong.

- [ ] **Step 12: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): ghép trang chủ Giữ tiền hộ, gộp hai mục sản phẩm trùng nhau"
```

- [ ] **Step 13: Ghi run-log**

Lần này CÓ khoá hướng sáng tạo (khác đợt polish 05-08), nên phải ghi. Thêm vào cuối mảng `runs` trong `C:/Users/tvmar/.premium-web/log.json`, giữ tối đa 20 mục:

```json
{
  "date": "2026-08-06",
  "project": "zoldify-frontend",
  "surface_route": "LANDING_BRAND",
  "work_mode": "REDESIGN",
  "macrostructure": "Marquee Hero",
  "palette_family": "restrained-cool-offwhite",
  "display_family": "grotesque",
  "accent_hue_band": "violet-blue",
  "signature": "Dong xu ky quy di tu chu GIU xuong gia san pham that",
  "status": "CREATIVE REVIEW READY",
  "notes": "Archivo mot ho (loai Bricolage/Anybody sau khi render thay chu so quai); line-height 0.92 vi 0.84 lam mu Viet dung dong tren; media-free theo lua chon chu du an du harness co tool sinh anh; luoi the giu theo yeu cau chu du an, ghi ro nua duoi trang giong cac san khac"
}
```

---

## Self-Review

**Spec coverage:**

| Mục spec | Task |
|----------|------|
| 3.1 Marquee Hero | 4, 7 |
| 3.2 Bảng màu OKLCH | 1, 7 |
| 3.3 Archivo + clamp + leading 0.92 | 1, 4 |
| 3.4 Chữ nghĩa | 4, 5, 7 |
| Gate A media-free | toàn bộ (không dùng ảnh) |
| Gate B tràn mép trái | 4 |
| Gate C display 9vw | 1, 4 |
| Gate D motion 3 lớp | 4 (arrival qua transition), 6 (scroll), 2+4 (micro-interaction hover) |
| Gate E signature | 3, 6 |
| 4.1 ràng buộc trung thực | 3 (comment trong code), 5 (step 6 kiểm câu chữ) |
| 5 cấu trúc trang | 7 |
| 6 trạng thái và biên | 2, 7 (step 7, 8) |
| 9 nghiệm thu | 7 (step 6-10) |

**Điểm cần chú ý khi thực thi:**

- Gate D đòi ba lớp motion. Task 4 và 6 phủ hai lớp (arrival, scroll-linked). Lớp thứ ba là micro-interaction: `hover:shadow-md` trên thẻ và `hover:bg-brand-dark` trên CTA đã có sẵn từ Task 2 và 4. Nếu khi review thấy đây chỉ là đổi màu hover mặc định, phải thêm một micro-interaction thật ở CTA chính và ghi vào critique ledger.
- `formatPrice` bị xoá import ở Task 2 rồi thêm lại ở Task 5. Cố ý, vì Task 2 là refactor thuần và lúc đó `page.tsx` chưa cần nó.
- `EscrowCoin` đổi chữ ký ở Task 6 (thêm `style`). Ai làm Task 6 phải sửa cả file component, không chỉ chỗ gọi.
