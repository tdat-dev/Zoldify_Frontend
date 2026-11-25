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

function normalizeAdminName(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/^(thanh pho|tp\.?|tinh|quan|q\.?|huyen|h\.?|thi xa|tx\.?|phuong|p\.?|xa|thi tran|tt\.?)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findByName<T>(list: T[], rawName: string | undefined | null, getName: (item: T) => string): T | undefined {
  const target = normalizeAdminName(rawName);
  if (!target) return undefined;
  return list.find((item) => normalizeAdminName(getName(item)) === target);
}

export interface ResolvedGhnLocation {
  province?: GhnProvince;
  district?: GhnDistrict;
  ward?: GhnWard;
  districts: GhnDistrict[];
  wards: GhnWard[];
}

/**
 * Khớp một địa chỉ đã lưu sang danh mục GHN: ưu tiên mã GHN đã lưu,
 * nếu thiếu (địa chỉ cũ tạo trước khi AddressForm dùng GHN) thì khớp theo tên.
 */
export async function resolveGhnLocation(
  provinces: GhnProvince[],
  input: {
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    ghn_province_id?: number | null;
    ghn_district_id?: number | null;
    ghn_ward_code?: string | null;
  },
): Promise<ResolvedGhnLocation> {
  const province =
    (input.ghn_province_id
      ? provinces.find((p) => p.ProvinceID === Number(input.ghn_province_id))
      : undefined) ?? findByName(provinces, input.province, (p) => p.ProvinceName);

  if (!province) return { districts: [], wards: [] };

  const districts = await ghnService.getDistricts(province.ProvinceID).catch(() => []);
  const district =
    (input.ghn_district_id
      ? districts.find((d) => d.DistrictID === Number(input.ghn_district_id))
      : undefined) ?? findByName(districts, input.district, (d) => d.DistrictName);

  if (!district) return { province, districts, wards: [] };

  const wards = await ghnService.getWards(district.DistrictID).catch(() => []);
  const ward =
    (input.ghn_ward_code
      ? wards.find((w) => w.WardCode === String(input.ghn_ward_code))
      : undefined) ?? findByName(wards, input.ward, (w) => w.WardName);

  return { province, district, ward, districts, wards };
}
