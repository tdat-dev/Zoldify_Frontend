import http from '@/lib/http';

export interface CreateAddressData {
  recipient_name: string;
  phone_number: string;
  label?: string;
  province: string;
  district: string;
  ward?: string;
  street: string;
  is_default?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export interface Address extends CreateAddressData {
  id: number;
  created_at: string;
  updated_at: string;
}

export const addressService = {
  getAll() {
    return http.get('/addresses');
  },
  getById(id: number) {
    return http.get(`/addresses/${id}`);
  },
  create(data: CreateAddressData) {
    return http.post('/addresses', data);
  },
  update(id: number, data: UpdateAddressData) {
    return http.patch(`/addresses/${id}`, data);
  },
  setDefault(id: number) {
    return http.patch(`/addresses/${id}/default`);
  },
  delete(id: number) {
    return http.delete(`/addresses/${id}`);
  },
};
