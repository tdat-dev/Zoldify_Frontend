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
  /**
   * Chuỗi 'true' / 'false', KHÔNG phải boolean — bảng settings lưu value dạng
   * text nên mọi thứ đi qua đây đều là chuỗi. Đọc bằng `=== 'true'`, đừng dùng
   * ép kiểu thật thà: chuỗi 'false' là truthy trong JavaScript, và đó là cách
   * một công tắc TẮT bật cả site lên.
   *
   * Ba chỗ cùng đọc khoá này, phải khớp nhau từng chữ:
   *   - middleware.ts (frontend, chuyển hướng)
   *   - common/guards/maintenance.guard.ts (backend, chặn thật)
   *   - trang này (bật/tắt)
   */
  maintenanceMode: 'maintenance_mode',
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
