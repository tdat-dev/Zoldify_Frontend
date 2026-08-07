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
const ALPHA_CLASS =
  /\b((?:bg|text|border|ring|divide|outline|from|via|to|shadow|fill|stroke|placeholder|accent|caret)-[a-z][a-z0-9-]*)\/(\d{1,3})\b/g;

const used = new Set();
for (const file of walk(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(ALPHA_CLASS)) used.add(`${m[1]}/${m[2]}`);
}

const out = join(mkdtempSync(join(tmpdir(), 'zoldify-tokens-')), 'out.css');
execSync(`npx tailwindcss -i src/app/globals.css -o "${out}"`, { stdio: 'pipe' });
const css = readFileSync(out, 'utf8');

/**
 * Một lớp có thể xuất hiện trong CSS ở hai dạng:
 *   .border-ink\/8 { ... }                              — dùng trần
 *   .focus-within\:ring-brand\/15:focus-within { ... }  — dùng kèm variant
 * Bản đầu của hàm này chỉ tìm dạng thứ nhất nên báo 5 lỗi ảo cho những lớp chỉ
 * dùng sau hover:/focus-within:. Phải chấp nhận cả hai tiền tố, và chặn biên
 * phía sau để `/8` không khớp nhầm vào `/80`.
 */
function generated(cssText, cls) {
  const literal = cls.replace(/\//g, '\\/'); // Tailwind escape / thành \/
  for (const prefix of ['.', '\\:']) {
    let i = -1;
    while ((i = cssText.indexOf(prefix + literal, i + 1)) !== -1) {
      const after = cssText[i + prefix.length + literal.length];
      if (!/[\w-]/.test(after ?? '')) return true;
    }
  }
  return false;
}

const dropped = [...used].filter((cls) => !generated(css, cls));

// --- 2. Contrast cặp màu phẳng -------------------------------------------
function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
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
  ['ink', 'surface-page'],
  ['ink', 'surface-card'],
  ['ink-muted', 'surface-page'],
  ['ink-muted', 'surface-card'],
  ['ink-faint', 'surface-page'],
  ['ink-faint', 'surface-card'],
  ['price', 'surface-card'],
  ['price', 'price-bg'],
  ['state-pending-fg', 'state-pending-bg'],
  ['state-progress-fg', 'state-progress-bg'],
  ['state-success-fg', 'state-success-bg'],
  ['state-danger-fg', 'state-danger-bg'],
  ['state-neutral-fg', 'state-neutral-bg'],
];

const lowContrast = [];
const measured = [];
for (const [fg, bg] of PAIRS) {
  let r;
  try {
    r = ratio(token(fg), token(bg));
  } catch (e) {
    lowContrast.push(`${fg}/${bg}: ${e.message}`);
    continue;
  }
  measured.push([`${fg} tren ${bg}`, r]);
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
if (!failed) {
  console.log(`OK — ${used.size} lop co bo ngu do mo deu sinh ra CSS.\n`);
  const pad = Math.max(...measured.map(([name]) => name.length));
  for (const [name, r] of measured) {
    console.log(`  ${name.padEnd(pad)}  ${r.toFixed(2)}:1`);
  }
  console.log(
    '\nLuu y: chi do duoc mau PHANG. Gradient va anh nen phai lay mau pixel tren\ntrang da render — getComputedStyle tra ve mau nen trong suot va bo sot loi that.',
  );
}
process.exit(failed ? 1 : 0);
