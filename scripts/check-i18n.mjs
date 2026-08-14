/**
 * Tìm chữ tiếng Việt viết cứng trong mã, tức là chỗ next-intl bị đi vòng.
 *
 * Vì sao cần máy soát chứ không soi mắt: chuỗi cứng không tự lộ ra. Trang hiển
 * thị vẫn đẹp, vẫn đúng — cho tới khi ai đó bấm sang tiếng Anh và một nửa màn
 * hình đứng yên. Đúng cách câu slogan ở trang đăng nhập lọt qua nhiều đợt sửa.
 *
 * CHỖ KHÓ: mã nguồn này CỐ Ý viết chú thích bằng tiếng Việt, rất nhiều. Quét
 * thô sẽ ra hàng nghìn kết quả rác. Nên phải bóc chú thích trước, và bóc bằng
 * máy trạng thái chứ không bằng regex — `'https://a//b'` có hai dấu gạch chéo
 * nằm trong chuỗi, regex ngây thơ sẽ cắt mất nửa dòng.
 *
 *   npm run check:i18n
 */
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC_DIR = join(ROOT, 'src');

const DIACRITIC = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/** Thuộc tính có chữ người dùng đọc được — chuỗi trong đó cũng phải qua i18n. */
const TEXT_ATTR = /\b(placeholder|alt|title|aria-label|label)\s*=\s*["']/;

/**
 * Ký tự có nghĩa cuối cùng trước vị trí i, bỏ qua khoảng trắng.
 *
 * Dùng để phân biệt `/` mở regex với `/` phép chia: sau một GIÁ TRỊ (tên biến,
 * số, ngoặc đóng) thì `/` là chia; sau một TOÁN TỬ hay dấu mở thì `/` là regex.
 */
function lastMeaningful(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  return j >= 0 ? src[j] : '';
}

/**
 * Bóc chú thích, giữ nguyên chuỗi và template literal.
 *
 * Trả về mảng dòng đã sạch chú thích, giữ đúng số dòng để còn báo vị trí.
 *
 * PHẢI HIỂU CẢ REGEX, không chỉ chuỗi. Lỗi này bắt được bằng phép thử chứ không
 * bằng đọc: một regex như /\b(alt|title)\s*=\s*["']/ có dấu nháy kép NẰM TRONG
 * nó. Máy trạng thái chỉ biết chuỗi sẽ tưởng dấu `"` đó mở một chuỗi mới, rồi
 * kẹt ở trạng thái "đang trong chuỗi" tới hết tệp — nên mọi chú thích phía sau
 * KHÔNG được bóc, và bộ soát báo chính chú thích tiếng Việt là vi phạm.
 * Trớ trêu là chính tệp này có một regex như vậy.
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  let inString = null; // ký tự đã mở chuỗi: ' " hoặc `

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    // Regex literal: nuốt trọn, kể cả dấu nháy bên trong. Trong lớp ký tự
    // [...] thì `/` không kết thúc regex, nên phải theo dõi riêng.
    if (!inString && c === '/' && next !== '/' && next !== '*') {
      const before = lastMeaningful(src, i);
      const isRegex = before === '' || '(,=:[!&|?{};+-*%~^<>'.includes(before);
      if (isRegex) {
        out += c;
        i++;
        let inClass = false;
        while (i < src.length) {
          const r = src[i];
          if (r === '\\') {
            out += '  ';
            i += 2;
            continue;
          }
          if (r === '[') inClass = true;
          else if (r === ']') inClass = false;
          else if (r === '/' && !inClass) {
            out += r;
            i++;
            break;
          } else if (r === '\n') break; // regex không xuống dòng: coi như đoán nhầm
          out += r;
          i++;
        }
        continue;
      }
    }

    if (inString) {
      if (c === '\\') {
        out += '  ';
        i += 2;
        continue;
      }
      if (c === inString) inString = null;
      out += c;
      i++;
      continue;
    }

    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }

    if (c === '/' && next === '*') {
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        // Giữ lại xuống dòng để số dòng không lệch.
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += '  ';
      i += 2;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') inString = c;
    out += c;
    i++;
  }

  return out.split('\n');
}

/**
 * Đánh dấu mọi dòng nằm trong một lời gọi console.*, kể cả khi nó trải nhiều dòng.
 *
 * Bắt theo từng dòng là hỏng: một console.warn xuống dòng thì chỉ dòng ĐẦU có
 * chữ "console", các dòng chuỗi phía sau trông y hệt chữ giao diện. Nên phải
 * đếm ngoặc từ chỗ mở cho tới lúc cân bằng.
 *
 * Chữ trong console là cho người dựng máy đọc trong terminal, không phải cho
 * người mua hàng. Bắt nó qua next-intl còn tệ hơn: thông báo lỗi lại đi phụ
 * thuộc vào chính hệ thống i18n có nạp được hay không.
 */
function consoleLines(src) {
  const marked = new Set();
  const re = /\bconsole\.(log|warn|error|info|debug)\s*\(/g;
  let match;

  while ((match = re.exec(src))) {
    let depth = 0;
    let i = match.index + match[0].length - 1;
    for (; i < src.length; i++) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    const firstLine = src.slice(0, match.index).split('\n').length;
    const lastLine = src.slice(0, i).split('\n').length;
    for (let n = firstLine; n <= lastLine; n++) marked.add(n);
  }

  return marked;
}

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // messages/ CHÍNH LÀ nơi chữ tiếng Việt phải nằm.
      if (entry.name === 'messages' || entry.name === 'node_modules') continue;
      await walk(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = await walk(SRC_DIR);
const hits = [];

for (const full of files) {
  const source = readFileSync(full, 'utf8');

  // Dấu cấp TỆP, cho những file mà cả nội dung là ngoại lệ có lý do (ví dụ
  // global-error.tsx chạy khi provider i18n đã chết). Dấu cấp dòng đặt trong
  // một khối chú thích ở đầu tệp thì không với tới được chỗ vi phạm ở cuối.
  if (/i18n-ignore-file/.test(source)) continue;

  // Dòng GỐC để tìm dấu i18n-ignore: dấu đó nằm trong chú thích, mà chú thích
  // thì bị bóc mất trước khi kiểm — tìm trên bản đã bóc thì không bao giờ thấy.
  const srcLines = source.split('\n');
  const stripped = stripComments(source);
  const inConsole = consoleLines(stripped.join('\n'));

  stripped.forEach((line, idx) => {
    if (!DIACRITIC.test(line)) return;
    if (inConsole.has(idx + 1)) return;

    const trimmed = line.trim();
    if (/^import\b/.test(trimmed)) return;

    // Nhận dấu i18n-ignore trên chính dòng đó hoặc trên ba dòng ngay trước (để
    // đặt được trong khối chú thích giải thích lý do).
    const around = srcLines.slice(Math.max(0, idx - 3), idx + 1).join('\n');
    if (/i18n-ignore/.test(around)) return;

    hits.push({
      file: relative(ROOT, full).replace(/\\/g, '/'),
      line: idx + 1,
      text: trimmed.length > 110 ? `${trimmed.slice(0, 110)}…` : trimmed,
      isAttr: TEXT_ATTR.test(line),
    });
  });
}

if (!hits.length) {
  console.log('Khong con chuoi tieng Viet viet cung ngoai messages/.');
  process.exit(0);
}

const byFile = new Map();
for (const hit of hits) {
  if (!byFile.has(hit.file)) byFile.set(hit.file, []);
  byFile.get(hit.file).push(hit);
}

console.log(`CHUOI TIENG VIET VIET CUNG: ${hits.length} dong, ${byFile.size} tep`);
console.log('(Chu thich da duoc boc. Con lai la chu CO THE hien ra man hinh.)\n');

for (const [filePath, list] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${filePath}  (${list.length})`);
  for (const hit of list) {
    console.log(`  ${String(hit.line).padStart(4)}  ${hit.isAttr ? '[attr] ' : ''}${hit.text}`);
  }
  console.log('');
}

process.exit(1);
