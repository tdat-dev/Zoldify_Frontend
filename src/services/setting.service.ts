import http from '@/lib/http';

/**
 * Cài đặt hệ thống — kho khoá–giá trị chung.
 *
 * Backend không định nghĩa sẵn khoá nào (settings.controller.ts:30 nhận
 * Record<string, string>), và bảng đang rỗng. Nên danh sách khoá phải do phía
 * dùng nó khai ra, và khai ở MỘT chỗ — nếu không thì trang này ghi `site_name`
 * còn chỗ khác đọc `siteName` và không ai phát hiện.
 */
export const SETTING_KEYS = {
  siteName: 'site_name',
  siteDescription: 'site_description',
} as const;

export const settingService = {
  /** Toàn bộ cài đặt (cần đăng nhập). Trả về mảng { key, value }. */
  getAll() {
    return http.get('/settings');
  },
  /** Cài đặt công khai, không cần đăng nhập. */
  getPublic() {
    return http.get('/settings/public');
  },
  update(updates: Record<string, string>) {
    return http.patch('/settings', updates);
  },
};
