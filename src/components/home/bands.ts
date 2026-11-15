/**
 * Bốn tầm tiền của trang chủ. Tách khỏi HomeView vì server cũng cần danh sách
 * này: thứ export từ file "use client" không đọc được ở phía server.
 */
export const BANDS = [
  { key: 'b1', max: 100000, params: { price_max: 100000 }, qs: 'price_max=100000' },
  { key: 'b2', min: 100000, max: 300000, params: { price_min: 100000, price_max: 300000 }, qs: 'price_min=100000&price_max=300000' },
  { key: 'b3', min: 300000, max: 1000000, params: { price_min: 300000, price_max: 1000000 }, qs: 'price_min=300000&price_max=1000000' },
  { key: 'b4', min: 1000000, params: { price_min: 1000000 }, qs: 'price_min=1000000' },
];
