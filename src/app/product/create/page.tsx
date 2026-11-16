import { CreateProductForm } from '@/components/sell/CreateProductForm';
import { SellerPickupGate } from '@/components/sell/SellerPickupGate';

// Biểu mẫu đăng tin nằm sau cổng địa chỉ lấy hàng: chưa khai thì được dẫn sang
// Cài đặt shop trước, không phải điền xong mới bị backend từ chối.
export default function CreateProductPage() {
  return (
    <SellerPickupGate>
      <CreateProductForm />
    </SellerPickupGate>
  );
}
