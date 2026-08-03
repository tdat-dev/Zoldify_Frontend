import http from '@/lib/http';

export const followService = {
  toggle(sellerId: number) {
    return http.post('/follows/toggle', { following_id: sellerId });
  },
  check(sellerId: number) {
    return http.get(`/follows/check/${sellerId}`);
  },
  count(sellerId: number) {
    return http.get(`/follows/${sellerId}/count`);
  },
  getFollowers(sellerId: number, page = 1) {
    return http.get(`/follows/${sellerId}/followers`, { params: { page } });
  },
  getFollowing(sellerId: number, page = 1) {
    return http.get(`/follows/${sellerId}/following`, { params: { page } });
  },
};
