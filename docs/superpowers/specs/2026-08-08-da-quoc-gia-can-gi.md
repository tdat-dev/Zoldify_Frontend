# Đưa Zoldify ra đa quốc gia — cần đổi những gì

Ngày: 2026-08-08
Bối cảnh: chủ dự án xác nhận định hướng là **đa quốc gia**, không phải sàn cho sinh viên.
`README.md` hiện mô tả sai ("dành cho sinh viên") — cần viết lại.

---

## 1. Đã làm hôm nay (thuộc giao diện)

| Việc | Chỗ |
|---|---|
| Gỡ khung sinh viên khỏi 7 chỗ chữ hiển thị | Header, layout metadata, trang đăng bán, chi tiết sản phẩm, admin settings |
| "Miễn phí giao trong trường" → "trong khu vực" | `product/create/page.tsx` |
| `formatPrice` nhận tham số tiền tệ thay vì gán chết `vi-VN`/`₫` | `lib/format.ts` |

`formatPrice` giờ có chữ ký `formatPrice(value, currency = 'VND')` và dùng
`Intl.NumberFormat`. Khi backend có cột tiền tệ thì chỗ phải sửa là **lời gọi**
(`formatPrice(item.price, item.currency)`), không phải bới lại toàn site.

Hàm này **không** tự quy đổi tỉ giá: quy đổi cần nguồn tỉ giá và thời điểm chốt
giá, đó là việc backend.

---

## 2. Chặn ở tầng dữ liệu — phải sửa backend trước

### 2.1 Không có cột `currency` ở bất kỳ đâu

Đã tìm toàn bộ `Zoldify_Backend/src`: **không có** cột nào tên `currency`,
`iso_code` hay `country_code`.

Giá sản phẩm là `decimal(15,2)` trần (`catalog/products/entities/product.entity.ts:50`).
Nghĩa là mọi con số trong hệ thống ngầm hiểu là đồng, và giao diện **không có
cách nào biết** một số tiền thuộc tiền tệ gì.

Hệ quả: hiển thị `$50` cho một bản ghi vốn là `50` đồng là sai dữ liệu, không
phải sai định dạng. Không thể vá ở frontend.

**Cần thêm cột `currency` cho ít nhất**: `products`, `orders`, `order_items`,
`wallet_transactions`, `escrows`, `withdrawals`.

### 2.2 Địa chỉ chỉ vừa mô hình hành chính Việt Nam

`identity/addresses/entities/address.entity.ts:31-37`:

```
province  varchar(100)  NOT NULL
district  varchar(100)  NOT NULL
ward      varchar(100)  nullable
```

Không có trường `country`. Ba cấp này là tỉnh/huyện/xã của Việt Nam; địa chỉ
Mỹ (street, city, state, ZIP), Nhật (prefecture, city, block) hay Anh (postcode)
không nhét vừa.

Frontend cũng đang chọn địa chỉ từ `services/province.service.ts` — danh sách
tỉnh thành Việt Nam.

**Cần**: thêm `country` (ISO 3166-1 alpha-2), thêm `postal_code`, và hoặc là đổi
ba cột kia thành `admin_area_1/2/3` trung tính, hoặc giữ chúng nullable rồi thêm
mô hình dòng địa chỉ tự do cho nước ngoài.

### 2.3 Tiền lẻ và làm tròn

`decimal(15,2)` hợp với USD/EUR (2 chữ số lẻ) nhưng thừa với đồng (0) và thiếu
với những tiền tệ 3 chữ số lẻ. Thẻ **"Ledger — viết lại lõi tiền theo sổ cái kép"**
trên board đã đề nghị chuyển sang `BIGINT` đơn vị nhỏ nhất; đa tiền tệ làm việc
đó thành bắt buộc chứ không còn là tuỳ chọn.

---

## 3. Chặn ở tích hợp — cần quyết định kinh doanh

| Hạng mục | Hiện tại | Vấn đề |
|---|---|---|
| Thanh toán | PayOS (`services/payos.service.ts`) | Chỉ hoạt động ở Việt Nam. Ra quốc tế cần Stripe/PayPal hoặc tương đương. |
| Vận chuyển | GHN (theo thẻ trên board) | Chỉ giao nội địa Việt Nam. |
| Ví & escrow | Số dư tính bằng đồng | Ví đa tiền tệ là bài toán khác hẳn: giữ nhiều số dư, hay quy đổi lúc nạp. |
| Thuế, hải quan | không có | Bán hàng xuyên biên giới kéo theo nghĩa vụ thuế và khai báo. Đây là việc pháp lý, tôi không tư vấn được. |

---

## 4. Việc thuộc giao diện, làm được khi có lệnh

| Việc | Ghi chú |
|---|---|
| i18n VI/EN | `next-intl`, tách toàn bộ chuỗi ra file. Đụng **mọi** trang. Board ước tính ~1,5 ngày. |
| `<html lang>` theo ngôn ngữ | `app/layout.tsx:31` đang gán cứng `"vi"`. |
| `timeAgo` đang trả chuỗi tiếng Việt gán cứng | `lib/format.ts` — phải i18n cùng lượt. |
| Biểu mẫu địa chỉ quốc tế | Phụ thuộc §2.2, chưa làm được. |
| Chọn tiền tệ / khu vực | Phụ thuộc §2.1, chưa làm được. |

---

## 5. Đề nghị thứ tự

1. **Backend thêm `currency` và `country`** — hai cột này chặn mọi thứ phía sau.
2. **Chốt cổng thanh toán quốc tế** — quyết định này đổi cả luồng đặt hàng.
3. **i18n VI/EN ở frontend** — làm được song song với 1 và 2, không phụ thuộc.
4. Biểu mẫu địa chỉ và chọn tiền tệ, sau khi 1 xong.

Trong lúc chờ, giao diện vẫn chạy đúng cho một thị trường một tiền tệ, và
`formatPrice` đã sẵn sàng nhận tiền tệ khi backend trả về.
