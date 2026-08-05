/**
 * Địa chỉ API. Trước đây hardcode 'http://localhost:3000' — trùng đúng cổng
 * mặc định của chính Next dev server, nên không deploy đi đâu được.
 * Đặt NEXT_PUBLIC_API_URL trong .env.local (hoặc biến môi trường khi build).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
