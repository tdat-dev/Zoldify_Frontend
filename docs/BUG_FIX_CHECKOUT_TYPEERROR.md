# 🐛 Bug Fix: TypeError trong Checkout

## ❌ Lỗi Gặp Phải

```
Fatal error: Uncaught TypeError: Unsupported operand types: string * array
in checkout.php on line 10
```

## 🔍 Nguyên Nhân

### Vấn đề chính:

Session cart lưu dữ liệu dạng **array** nhưng code checkout expect **số**.

### Chi tiết:

**CartController.php** lưu cart như sau:

```php
// Dòng 54
$_SESSION['cart'][$productId] = ['quantity' => $quantity];
```

**CheckoutController.php** lấy ra như sau (SAI):

```php
// Dòng 33 - TRƯỚC KHI FIX
$p['cart_quantity'] = $allCart[$id]; // Gán cả array!
```

**checkout.php** tính toán:

```php
// Dòng 10
$grandTotal += $item['price'] * $item['cart_quantity'];
// Lỗi: $item['price'] (số) * ['quantity' => 2] (array) ❌
```

---

## ✅ Cách Fix

### 1. CheckoutController.php (Dòng 28-37)

**Trước:**

```php
foreach ($selectedIds as $id) {
    if (isset($allCart[$id])) {
         $p = $productModel->find($id);
         if ($p) {
             $p['cart_quantity'] = $allCart[$id]; // ❌ Gán array
             $products[] = $p;
         }
    }
}
```

**Sau:**

```php
foreach ($selectedIds as $id) {
    if (isset($allCart[$id])) {
         $p = $productModel->find($id);
         if ($p) {
             // ✅ Xử lý cả array và số
             $qty = is_array($allCart[$id])
                 ? ($allCart[$id]['quantity'] ?? 1)
                 : $allCart[$id];
             $p['cart_quantity'] = (int)$qty;
             $products[] = $p;
         }
    }
}
```

### 2. checkout.php (Dòng 5-13)

**Trước:**

```php
if (!empty($products)) {
    foreach ($products as $item) {
        if (isset($item['cart_quantity'])) {
            $grandTotal += $item['price'] * $item['cart_quantity']; // ❌ Không validate
        }
    }
}
```

**Sau:**

```php
if (!empty($products)) {
    foreach ($products as $item) {
        if (isset($item['cart_quantity']) && isset($item['price'])) {
            // ✅ Validate và type cast
            $price = is_numeric($item['price']) ? (float)$item['price'] : 0;
            $qty = is_numeric($item['cart_quantity']) ? (int)$item['cart_quantity'] : 0;
            $grandTotal += $price * $qty;
        }
    }
}
```

### 3. checkout.php (Dòng 57-59)

**Trước:**

```php
<?php foreach ($products as $item):
    $itemTotal = $item['price'] * $item['cart_quantity']; // ❌ Không validate
?>
```

**Sau:**

```php
<?php foreach ($products as $item):
    $price = is_numeric($item['price']) ? (float)$item['price'] : 0;
    $qty = is_numeric($item['cart_quantity']) ? (int)$item['cart_quantity'] : 0;
    $itemTotal = $price * $qty; // ✅ An toàn
?>
```

---

## 🎯 Bài Học

### 1. Luôn Validate Dữ Liệu

```php
// ❌ BAD
$total = $price * $quantity;

// ✅ GOOD
$price = is_numeric($price) ? (float)$price : 0;
$qty = is_numeric($quantity) ? (int)$quantity : 0;
$total = $price * $qty;
```

### 2. Xử Lý Mixed Data Types

Khi dữ liệu có thể là array hoặc số:

```php
// ✅ GOOD
$value = is_array($data) ? ($data['key'] ?? default) : $data;
```

### 3. Type Casting

Luôn cast về đúng type trước khi tính toán:

```php
$price = (float)$price;
$quantity = (int)$quantity;
```

---

## 🔍 Debug Tips

### Kiểm tra kiểu dữ liệu:

```php
var_dump($item['cart_quantity']); // Xem type
var_dump(is_array($item['cart_quantity'])); // true/false
var_dump(is_numeric($item['price'])); // true/false
```

### Kiểm tra session cart:

```php
echo '<pre>';
print_r($_SESSION['cart']);
echo '</pre>';
```

---

## ✅ Checklist Fix

- [x] Sửa CheckoutController.php - Xử lý array/number
- [x] Sửa checkout.php - Validate ở đầu file
- [x] Sửa checkout.php - Validate trong loop
- [x] Test lại checkout flow
- [ ] Clear session cart cũ (nếu cần)

---

## 🚀 Test

1. Thêm sản phẩm vào giỏ
2. Chọn sản phẩm và checkout
3. Kiểm tra trang checkout hiển thị đúng
4. Kiểm tra tổng tiền tính đúng

---

**Trạng thái:** ✅ Fixed  
**Commit message:** `fix: resolve TypeError in checkout calculation`
