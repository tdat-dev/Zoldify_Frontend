"use client";

/**
 * Lưới an toàn cuối cùng: bắt cả lỗi ném ra từ root layout (ví dụ Firebase
 * thiếu biến môi trường), thay vì để người dùng nhìn trang trắng.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f9fafb' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: 460, textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem' }}>
              Zoldify tạm thời không tải được
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Ứng dụng gặp lỗi khi khởi động. Bạn thử tải lại trang; nếu vẫn vậy thì báo cho
              {' '}<a href="mailto:admin@zoldify.com" style={{ color: '#2C67C8' }}>admin@zoldify.com</a>.
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.65rem 1.25rem', background: '#2C67C8', color: '#fff', border: 0, borderRadius: 4, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              Tải lại
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
