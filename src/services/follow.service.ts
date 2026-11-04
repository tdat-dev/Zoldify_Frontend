import http from '@/lib/http';

export const followService = {
  follow(sellerId: number) {
    return http.put(`/follows/${sellerId}`);
  },
  unfollow(sellerId: number) {
    return http.delete(`/follows/${sellerId}`);
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
