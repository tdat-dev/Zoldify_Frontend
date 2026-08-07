import type { components } from './schema';

/**
 * Lớp tiện dụng nằm trên file schema.d.ts sinh tự động.
 *
 * KHÔNG sửa schema.d.ts bằng tay — chạy `npm run gen:api` để sinh lại từ
 * openapi.json của backend. File này mới là nơi để đặt tên cho dễ dùng.
 */

type Schemas = components['schemas'];

/**
 * Mọi response của backend đều bị TransformInterceptor bọc trong lớp này.
 * Dữ liệu thật nằm ở `data`.
 */
export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
}

/** Khuôn danh sách có phân trang mà mọi endpoint trả danh sách đều dùng. */
export interface Paginated<T> {
  meta: Schemas['PaginationMetaDto'];
  result: T[];
}

// Kiểu dữ liệu nghiệp vụ, đặt tên ngắn cho gọn khi import
export type User = Schemas['User'];
export type Product = Schemas['Product'];
export type Category = Schemas['Category'];
/** Dòng trong danh sách danh mục — projection 7 field, có product_count */
export type CategoryListItem = Schemas['CategoryListItemDto'];
export type Order = Schemas['Order'];
export type OrderItem = Schemas['OrderItem'];
export type Cart = Schemas['Cart'];
export type Payment = Schemas['Payment'];
export type Escrow = Schemas['Escrow'];
export type Wallet = Schemas['Wallet'];
export type WalletTransaction = Schemas['WalletTransaction'];
export type Withdrawal = Schemas['Withdrawal'];
export type Notification = Schemas['Notification'];
export type Conversation = Schemas['Conversation'];
export type Message = Schemas['Message'];
export type Review = Schemas['Review'];
export type Shop = Schemas['Shop'];
export type Address = Schemas['Address'];
export type FileEntity = Schemas['FileEntity'];

// Kiểu cho request và response của luồng đăng nhập
export type LoginUserDto = Schemas['LoginUserDto'];
export type RegisterUserDto = Schemas['RegisterUserDto'];
export type LoginResponse = Schemas['LoginResponseDto'];
export type AuthUser = Schemas['AuthUserDto'];
export type MessageResponse = Schemas['MessageResponseDto'];

// Kiểu cho các thao tác tạo mới
export type CreateProductDto = Schemas['CreateProductDto'];
export type CreateOrderDto = Schemas['CreateOrderDto'];
export type CreateCartDto = Schemas['CreateCartDto'];
export type CreatePaymentDto = Schemas['CreatePaymentDto'];
export type TopupDto = Schemas['TopupDto'];
export type TransferDto = Schemas['TransferDto'];
