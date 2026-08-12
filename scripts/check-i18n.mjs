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

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const THU_MUC = join(GOC, 'src');

const DAU = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/** Thuộc tính có chữ người dùng đọc được — chuỗi trong đó cũng phải qua i18n. */
const THUOC_TINH = /\b(placeholder|alt|title|aria-label|label)\s*=\s*["']/;

/**
 * Bóc chú thích, giữ nguyên chuỗi và template literal.
 *
 * Trả về mảng dòng đã sạch chú thích, giữ đúng số dòng để còn báo vị trí.
 */
function bocChuThich(ma) {
  let ra = '';
  let i = 0;
  // trang thai: 0 thuong, 1 trong chuoi ' " `, 2 chu thich //, 3 chu thich /* */
  let trong = null; // ky tu mo chuoi
  while (i < ma.length) {
    const c = ma[i];
    const sau = ma[i + 1];
    if (trong) {
      if (c === '\\') {
        ra += '  ';
        i += 2;
        continue;
      }
      if (c === trong) trong = null;
      ra += c;
      i++;
      continue;
    }
    if (c === '/' && sau === '/') {
      while (i < ma.length && ma[i] !== '\n') {
        ra += ' ';
        i++;
      }
      continue;
    }
    if (c === '/' && sau === '*') {
      while (i < ma.length && !(ma[i] === '*' && ma[i + 1] === '/')) {
        // Giữ lại xuống dòng để số dòng không lệch.
        ra += ma[i] === '\n' ? '\n' : ' ';
        i++;
      }
      ra += '  ';
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') trong = c;
    ra += c;
    i++;
  }
  return ra.split('\n');
}

async function quet(thuMuc, ra = []) {
  for (const m of await readdir(thuMuc, { withFileTypes: true })) {
    const duong = join(thuMuc, m.name);
    if (m.isDirectory()) {
      // messages/ CHÍNH LÀ nơi chữ tiếng Việt phải nằm.
      if (m.name === 'messages' || m.name === 'node_modules') continue;
      await quet(duong, ra);
    } else if (/\.tsx?$/.test(m.name)) {
      ra.push(duong);
    }
  }
  return ra;
}

/**
 * Đánh dấu mọi dòng nằm trong một lời gọi console.*, kể cả khi nó trải nhiều
 * dòng.
 *
 * Bắt theo từng dòng là hỏng: một console.warn xuống dòng thì chỉ dòng ĐẦU có
 * chữ "console", các dòng chuỗi phía sau trông y hệt chữ giao diện. Nên phải
 * đếm ngoặc từ chỗ mở cho tới lúc cân bằng.
 *
 * Chữ trong console là cho người dựng máy đọc trong terminal, không phải cho
 * người mua hàng. Bắt nó qua next-intl còn tệ hơn: thông báo lỗi lại đi phụ
 * thuộc vào chính hệ thống i18n có nạp được hay không.
 */
function dongTrongConsole(nguon) {
  const trong = new Set();
  const re = /\bconsole\.(log|warn|error|info|debug)\s*\(/g;
  let m;
  while ((m = re.exec(nguon))) {
    let sau = 0;
    let i = m.index + m[0].length - 1;
    for (; i < nguon.length; i++) {
      if (nguon[i] === '(') sau++;
      else if (nguon[i] === ')') {
        sau--;
        if (sau === 0) break;
      }
    }
    const dauDong = nguon.slice(0, m.index).split('\n').length;
    const cuoiDong = nguon.slice(0, i).split('\n').length;
    for (let d = dauDong; d <= cuoiDong; d++) trong.add(d);
  }
  return trong;
}

const tep = await quet(THU_MUC);
const thay = [];

for (const duong of tep) {
  const nguon = readFileSync(duong, 'utf8');
  // Dòng GỐC để tìm dấu i18n-ignore: dấu đó nằm trong chú thích, mà chú thích
  // thì bị bóc mất trước khi kiểm — tìm trên bản đã bóc thì không bao giờ thấy.
  const dongGoc = nguon.split('\n');
  // Dấu cấp TỆP, cho những file mà cả nội dung là ngoại lệ có lý do (ví dụ
  // global-error.tsx chạy khi provider i18n đã chết). Dấu cấp dòng đặt trong
  // một khối chú thích ở đầu tệp thì không với tới được chỗ vi phạm ở cuối.
  if (/i18n-ignore-file/.test(nguon)) continue;
  const daBoc = bocChuThich(nguon);
  const trongConsole = dongTrongConsole(daBoc.join('\n'));

  daBoc.forEach((d, idx) => {
    if (!DAU.test(d)) return;
    if (trongConsole.has(idx + 1)) return;

    const cat = d.trim();
    if (/^import\b/.test(cat)) return;

    // Đánh dấu tay cho những chỗ chữ tiếng Việt là DỮ LIỆU chứ không phải giao
    // diện — ví dụ bảng chuyển tự bỏ dấu trong lib/slug.ts. Nhận dấu trên chính
    // dòng đó hoặc trên ba dòng ngay trước (để đặt được trong khối chú thích
    // giải thích lý do).
    const quanh = dongGoc.slice(Math.max(0, idx - 3), idx + 1).join('\n');
    if (/i18n-ignore/.test(quanh)) return;

    thay.push({
      tep: relative(GOC, duong).replace(/\\/g, '/'),
      dong: idx + 1,
      noiDung: cat.length > 110 ? cat.slice(0, 110) + '…' : cat,
      thuocTinh: THUOC_TINH.test(d),
    });
  });
}

if (!thay.length) {
  console.log('Khong con chuoi tieng Viet viet cung ngoai messages/.');
  process.exit(0);
}

const theoTep = new Map();
for (const t of thay) {
  if (!theoTep.has(t.tep)) theoTep.set(t.tep, []);
  theoTep.get(t.tep).push(t);
}

console.log(`CHUOI TIENG VIET VIET CUNG: ${thay.length} dong, ${theoTep.size} tep`);
console.log('(Chu thich da duoc boc. Con lai la chu CO THE hien ra man hinh.)\n');

for (const [tepDuong, ds] of [...theoTep].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${tepDuong}  (${ds.length})`);
  for (const d of ds) {
    console.log(`  ${String(d.dong).padStart(4)}  ${d.thuocTinh ? '[attr] ' : ''}${d.noiDung}`);
  }
  console.log('');
}

process.exit(1);
