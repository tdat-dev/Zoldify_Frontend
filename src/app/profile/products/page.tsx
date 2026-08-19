import { redirect } from 'next/navigation';

/**
 * "Tin đã đăng" đã gộp vào trang "Đơn bán của tôi" (/shop/orders) làm một tab.
 * Giữ route cũ để mọi link/redirect đang trỏ tới /profile/products (vd sau khi
 * sửa sản phẩm) vẫn về đúng chỗ, thay vì 404.
 */
export default function MyProductsRedirect() {
  redirect('/shop/orders?tab=listings');
}
