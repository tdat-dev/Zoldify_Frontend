/**
 * Cổng kiểm: các file dùng chung phải giống hệt bản sao bên `Zoldify_Admin`.
 *
 *   npm run check:shared
 *
 * Chạy trong CI của CẢ HAI repo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHARED_FILES } from './shared-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPLICA = path.resolve(ROOT, '../Zoldify_Admin');

if (!fs.existsSync(REPLICA)) {
  console.log(`Bỏ qua: không thấy repo admin tại ${REPLICA}.`);
  console.log('Muốn kiểm thật thì checkout cả Zoldify_Admin cạnh repo này.');
  process.exit(0);
}

const drifted = [];
const missing = [];

for (const rel of SHARED_FILES) {
  const from = path.join(ROOT, rel);
  const to = path.join(REPLICA, rel);

  if (!fs.existsSync(from)) {
    missing.push(`${rel}  (thiếu ở repo này)`);
    continue;
  }
  if (!fs.existsSync(to)) {
    missing.push(`${rel}  (thiếu ở repo admin)`);
    continue;
  }
  if (!fs.readFileSync(from).equals(fs.readFileSync(to))) {
    drifted.push(rel);
  }
}

if (missing.length === 0 && drifted.length === 0) {
  console.log(`${SHARED_FILES.length} file dùng chung khớp nhau.`);
  process.exit(0);
}

if (missing.length > 0) {
  console.error(`\nThiếu ${missing.length} file:`);
  for (const m of missing) console.error(`  ${m}`);
}

if (drifted.length > 0) {
  console.error(`\n${drifted.length} file ĐÃ LỆCH khỏi bản sao:`);
  for (const d of drifted) console.error(`  ${d}`);
  console.error('\nNếu bạn thay đổi file dùng chung, hãy copy sang Zoldify_Admin hoặc chạy `npm run sync:shared` bên đó.');
}

process.exit(1);
