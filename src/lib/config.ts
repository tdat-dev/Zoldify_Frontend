/**
 * Địa chỉ backend.
 *
 * Chỉ khai một biến môi trường là gốc của backend, rồi suy ra hai đường
 * dẫn con — vì REST và WebSocket đi hai lối khác nhau:
 *
 *  - REST     đi qua global prefix + version  ->  /api/v1/...
 *  - Socket.IO KHÔNG đi qua prefix (Nest không áp prefix cho gateway),
 *              nên nó nằm thẳng ở gốc  ->  /chat
 *
 * Đặt NEXT_PUBLIC_API_ORIGIN trong .env.local khi chạy máy, hoặc biến môi
 * trường lúc build cho production.
 */
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:3000';

/** Gốc cho mọi request REST. Service chỉ cần viết '/products', '/orders'. */
export const API_URL = `${API_ORIGIN}/api/v1`;

/** Namespace chat của Socket.IO gateway bên backend. */
export const SOCKET_URL = `${API_ORIGIN}/chat`;
