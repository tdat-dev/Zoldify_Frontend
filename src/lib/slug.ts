/**
 * Tạo slug từ tên tiếng Việt.
 *
 * Bản cũ nằm trong trang đăng bán và lọc thẳng `[^a-z0-9-]`, nên chữ có dấu bị
 * xoá sạch: "Máy tính Casio" ra "my-tnh-casio". Phải tách dấu bằng NFD rồi mới
 * lọc, và đổi đ/Đ riêng vì NFD không tách được chữ đó.
 *
 * Đặt ở lib để trang sửa tin dùng chung, khỏi có hai bản lệch nhau.
 */
export function toSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // NFD tách được dấu thanh ra khỏi nguyên âm, nhưng đ/Đ là CHỮ CÁI riêng
    // trong bảng chữ cái tiếng Việt chứ không phải d có dấu — nó không tách ra,
    // phải thay tay. i18n-ignore: đây là dữ liệu chuyển tự, không phải giao diện.
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
