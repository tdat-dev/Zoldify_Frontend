import http from '@/lib/http';

/**
 * Danh mục địa chỉ GHN — dùng cho địa chỉ LẤY HÀNG của người bán.
 *
 * KHÁC với province.service (provinces.open-api.vn) đang dùng cho địa chỉ người
 * mua: chỗ này phải là danh mục của GHN, vì id của nó (ProvinceID / DistrictID /
 * WardCode) là thứ GHN cần để tính phí và tạo vận đơn. Mã của open-api.vn KHÔNG
 * khớp GHN, nên hai nguồn không thể thay cho nhau.
 *
 * Backend đã cache 24h; ở client cache thêm theo phiên để đổi tỉnh/quận không
 * gọi lại mạng.
 */
export interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
}
export interface GhnDistrict {
  DistrictID: number;
  DistrictName: string;
}
export interface GhnWard {
  WardCode: string;
  WardName: string;
}

let provincesCache: GhnProvince[] | null = null;
const districtsCache = new Map<number, GhnDistrict[]>();
const wardsCache = new Map<number, GhnWard[]>();

export const ghnService = {
  async getProvinces(): Promise<GhnProvince[]> {
    if (provincesCache) return provincesCache;
    const res = await http.get('/ghn/provinces');
    const list: GhnProvince[] = res.data?.data || [];
    provincesCache = list;
    return list;
  },
  async getDistricts(provinceId: number): Promise<GhnDistrict[]> {
    if (districtsCache.has(provinceId)) return districtsCache.get(provinceId)!;
    const res = await http.get('/ghn/districts', { params: { province_id: provinceId } });
    const list: GhnDistrict[] = res.data?.data || [];
    districtsCache.set(provinceId, list);
    return list;
  },
  async getWards(districtId: number): Promise<GhnWard[]> {
    if (wardsCache.has(districtId)) return wardsCache.get(districtId)!;
    const res = await http.get('/ghn/wards', { params: { district_id: districtId } });
    const list: GhnWard[] = res.data?.data || [];
    wardsCache.set(districtId, list);
    return list;
  },
};
