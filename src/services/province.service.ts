import axios from 'axios';

const PROVINCE_API = 'https://provinces.open-api.vn/api';

interface Province {
  code: number;
  name: string;
  districts: District[];
}

interface District {
  code: number;
  name: string;
  wards: Ward[];
}

interface Ward {
  code: number;
  name: string;
}

let cachedProvinces: Province[] | null = null;

export const provinceService = {
  async getProvinces() {
    if (cachedProvinces) return cachedProvinces;
    const res = await axios.get<Province[]>(`${PROVINCE_API}/?depth=3`);
    cachedProvinces = res.data;
    return res.data;
  },
  async getDistricts(provinceCode: number) {
    const provinces = await this.getProvinces();
    const province = provinces.find(p => p.code === provinceCode);
    return province?.districts || [];
  },
  async getWards(districtCode: number) {
    const provinces = await this.getProvinces();
    for (const p of provinces) {
      const district = p.districts.find(d => d.code === districtCode);
      if (district) return district.wards;
    }
    return [];
  },
};
