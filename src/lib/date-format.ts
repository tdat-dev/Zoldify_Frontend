/**
 * Kiểu hiện ngày giờ dùng chung, truyền vào `useFormatter().dateTime` của next-intl.
 *
 * Trước 12/11 các trang gọi `toLocaleDateString()` không kèm locale, nên ngày đi
 * theo ngôn ngữ của TRÌNH DUYỆT chứ không theo ngôn ngữ trang: Chrome tiếng Anh
 * hiện đơn đặt 12/11 thành "11/12/2026". next-intl lấy locale của trang (vi ra
 * 12/11/2026), và server lẫn client cùng một kết quả.
 */
export const DATE = { day: '2-digit', month: '2-digit', year: 'numeric' } as const;
export const DATE_TIME = { ...DATE, hour: '2-digit', minute: '2-digit' } as const;
