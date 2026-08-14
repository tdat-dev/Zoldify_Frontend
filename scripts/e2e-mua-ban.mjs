/**
 * Chạy trọn một vòng mua–bán qua API thật, kiểm từng mắt xích.
 *
 * Mục đích: những mảnh tôi sửa (giỏ, đặt hàng, chuỗi trạng thái, phân trang,
 * tên trường) đều được kiểm RIÊNG LẺ. Chỗ chưa ai kiểm là các khớp nối giữa
 * chúng.
 */
const API = 'http://localhost:3000/api/v1';
let pass = 0, fail = 0;

function check(label, ok, detail = '') {
  if (ok) { pass++; console.log(`  OK   ${label}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${label}${detail ? ' — ' + detail : ''}`); }
  return ok;
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, body: json };
}

async function login(email, password = '123456') {
  const r = await call('POST', '/auth/login', { body: { email, password } });
  return r.body?.data?.access_token ? { token: r.body.data.access_token, user: r.body.data.user } : null;
}

console.log('== 1. Đăng nhập ==');
const buyer = await login('buyer@zoldify.com');
const seller = await login('seller@zoldify.com');
check('người mua đăng nhập', !!buyer, buyer ? buyer.user.email : 'THẤT BẠI');
check('người bán đăng nhập', !!seller, seller ? seller.user.email : 'THẤT BẠI');
if (!buyer || !seller) { console.log('\nDừng: không đăng nhập được.'); process.exit(1); }

console.log('\n== 2. Chọn một món còn hàng của người bán ==');
const list = await call('GET', '/products?current=1&pageSize=50', { token: buyer.token });
const items = list.body?.data?.result || [];
const target = items.find((p) => Number(p.stock) > 0);
check('có món còn hàng để mua', !!target, target ? `#${target.id} ${target.name} (còn ${target.stock})` : 'không tìm thấy');
if (!target) process.exit(1);
const stockBefore = Number(target.stock);

console.log('\n== 3. Thêm vào giỏ ==');
const add = await call('POST', '/cart', { token: buyer.token, body: { product_id: target.id, quantity: 1 } });
check('POST /cart', add.status === 201 || add.status === 200, 'HTTP ' + add.status);
const cart = await call('GET', '/cart', { token: buyer.token });
const cartItems = cart.body?.data?.result || [];
const line = cartItems.find((i) => i.product?.id === target.id);
check('món có trong giỏ', !!line, line ? `cart item #${line.id}` : 'không thấy');
if (!line) process.exit(1);

console.log('\n== 4. Đặt hàng ==');
const order = await call('POST', '/orders', {
  token: buyer.token,
  body: {
    receiver_name: 'Nguyen Van Mua',
    receiver_phone: '0901234567',
    shipping_address: '12 Nguyen Trai',
    province: 'Thành phố Hà Nội',
    district: 'Quận Ba Đình',
    note: 'kiem end-to-end',
    payment_method: 'cod',
    cart_item_ids: [line.id],
  },
});
const orderId = order.body?.data?.id;
check('POST /orders', !!orderId, orderId ? `đơn #${orderId}, HTTP ${order.status}` : 'HTTP ' + order.status + ' ' + JSON.stringify(order.body).slice(0, 160));
if (!orderId) process.exit(1);

console.log('\n== 5. Hệ quả sau khi đặt ==');
const cartAfter = await call('GET', '/cart', { token: buyer.token });
const stillThere = (cartAfter.body?.data?.result || []).some((i) => i.id === line.id);
check('món đã rời khỏi giỏ', !stillThere);
const prodAfter = await call('GET', `/products/${target.id}`, { token: buyer.token });
const stockAfter = Number((prodAfter.body?.data || prodAfter.body)?.stock);
check('tồn kho giảm 1', stockAfter === stockBefore - 1, `${stockBefore} -> ${stockAfter}`);

console.log('\n== 6. Người bán đẩy đơn qua trọn chuỗi trạng thái ==');
// Ai duoc dat trang thai nao la theo bang phan quyen cua backend:
// nguoi ban dua den 'shipping', chinh NGUOI MUA xac nhan 'delivered'.
const FLOW = [
  ['confirmed', seller, 'người bán'],
  ['processing', seller, 'người bán'],
  ['shipping', seller, 'người bán'],
  ['delivered', buyer, 'NGƯỜI MUA'],
];
// GET /orders/:id chi danh cho nguoi mua; doc trang thai qua danh sach cho chac.
async function statusOf(id) {
  const l = await call('GET', '/orders?current=1&limit=50', { token: buyer.token });
  return (l.body?.data?.result || []).find((o) => o.id === id)?.status;
}
// Chan tren nguoi ban PHAI thu truoc khi don sang delivered, khong thi tu-choi
// se la "sai trang thai nguon" (400) chu khong phai "sai vai" (403).
let sellerBlocked = null;
for (const [next, who, label] of FLOW) {
  if (next === 'delivered') {
    sellerBlocked = await call('PATCH', `/orders/${orderId}/status`, { token: seller.token, body: { status: 'delivered' } });
  }
  const r = await call('PATCH', `/orders/${orderId}/status`, { token: who.token, body: { status: next } });
  const now = await statusOf(orderId);
  // Xet TRANG THAI THAT, khong xet ma HTTP: backend co y tra 400 kem giai thich
  // khi trang thai da luu nhung buoc giai ngan ky quy hong (don COD khong co ky quy).
  check(`${label} chuyển sang ${next}`, now === next,
    `HTTP ${r.status}${r.status >= 300 ? ' — ' + String(r.body?.message).slice(0, 90) : ''}`);
}

console.log('\n== 6b. Người bán KHÔNG được tự đánh dấu đã giao ==');
// Dùng kết quả đã thử Ở ĐÚNG LÚC đơn còn `shipping`. Thử lại bây giờ thì đơn
// đã `delivered`, và bị từ chối vì SAI TRẠNG THÁI NGUỒN (400) chứ không phải
// vì sai vai (403) — một phép thử đúng chỗ nhưng sai thời điểm.
check('backend chặn người bán đặt delivered', sellerBlocked?.status === 403,
  'HTTP ' + sellerBlocked?.status + ' — ' + String(sellerBlocked?.body?.message).slice(0, 70));

console.log('\n== 7. Đơn hiện đúng ở cả ba màn ==');
const asBuyer = await call('GET', '/orders?current=1&limit=50', { token: buyer.token });
const asSeller = await call('GET', '/orders?as=seller&currentPage=1&limit=50', { token: seller.token });
const inBuyer = (asBuyer.body?.data?.result || []).some((o) => o.id === orderId);
const inSeller = (asSeller.body?.data?.result || []).some((o) => o.id === orderId);
check('đơn nằm trong danh sách người mua', inBuyer);
check('đơn nằm trong danh sách người bán', inSeller);
const sm = asSeller.body?.data?.meta;
const sr = asSeller.body?.data?.result || [];
check('meta.total khớp số đơn trả về', sm?.total === sr.length, `total=${sm?.total}, tra ve=${sr.length}`);

console.log('\n== 8. Đánh giá sau khi nhận hàng ==');
const rev = await call('POST', '/interactions', {
  token: buyer.token,
  body: { product_id: target.id, order_id: orderId, rating: 5, comment: 'Kiem end-to-end, hang dung mo ta.' },
});
// "Đã đánh giá rồi" là backend ĐÚNG (mỗi người một đánh giá cho mỗi món), chỉ
// là phép thử chạy lại trên cùng món. Coi đó là đạt, đừng báo như lỗi sản phẩm.
const already = String(rev.body?.message || '').includes('đã đánh giá');
check('POST đánh giá', rev.status < 300 || already,
  'HTTP ' + rev.status + (already ? ' — đã đánh giá từ lần chạy trước' : rev.status >= 300 ? ' ' + JSON.stringify(rev.body).slice(0, 120) : ''));
const revList = await call('GET', `/interactions/product/${target.id}`, { token: buyer.token });
const revs = revList.body?.data?.result || revList.body?.data || [];
check('đánh giá hiện trên trang sản phẩm', Array.isArray(revs) && revs.some((x) => x.order?.id === orderId || x.rating === 5));

console.log(`\n===== KẾT QUẢ: ${pass} đạt, ${fail} hỏng =====`);
process.exit(fail > 0 ? 1 : 0);
