import { redirect } from 'next/navigation';

/**
 * Trang này KHÔNG THỂ đứng riêng.
 *
 * Backend đặt lại mật khẩu bằng một lần gọi cần đủ ba thứ cùng lúc: email, mã
 * OTP và mật khẩu mới (auth.controller.ts:152). Không có endpoint nào nhận một
 * token trong đường dẫn, nên một trang /reset-password mở thẳng từ email sẽ
 * không có email lẫn OTP trong tay và không gọi được gì.
 *
 * Bản trước là một biểu mẫu chết: hai ô mật khẩu không có state, <form> không
 * có onSubmit, nút không có handler, file không import service nào. Nó là mắt
 * xích cuối của một luồng khôi phục mật khẩu giả từ đầu đến cuối.
 *
 * Cả hai bước nay nằm trong /forgot-password. Giữ đường dẫn này và chuyển
 * hướng, vì có thể còn dấu vết trong lịch sử trình duyệt hoặc email đã gửi.
 */
export default function ResetPasswordPage() {
  redirect('/forgot-password');
}
