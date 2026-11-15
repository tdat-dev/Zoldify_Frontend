import http from '@/lib/http';

/** Địa chỉ lấy hàng của người bán — nguồn gửi cho vận đơn GHN. Lưu cả id lẫn
 *  tên vì GHN cần district_id/ward_code khi tính phí và tên khi tạo đơn. */
export interface ShopPickup {
  pickup_name?: string;
  pickup_phone?: string;
  pickup_address?: string;
  pickup_province_name?: string;
  pickup_district_id?: number;
  pickup_district_name?: string;
  pickup_ward_code?: string;
  pickup_ward_name?: string;
}

export const shopService = {
  getMyShop() {
    return http.get('/shop/me');
  },
  /** Mở shop. Web trước đây không có đường gọi này: người bán mới bị kẹt giữa
   *  "tạo shop trước" ở Cài đặt shop và "khai địa chỉ lấy hàng trước" ở Đăng tin. */
  create(data: ShopPickup & { name: string; slug: string }) {
    return http.post('/shop', data);
  },
  update(data: Record<string, unknown>) {
    return http.patch('/shop', data);
  },
  updatePickup(pickup: ShopPickup) {
    return http.patch('/shop', pickup);
  },
};
