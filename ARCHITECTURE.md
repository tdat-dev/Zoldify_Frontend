# Kiến trúc dự án UniMarket

## 📋 Tổng quan

Dự án sử dụng **PHP thuần** với pattern **MVC (Model-View-Controller)**, không dùng framework. Cấu trúc này giúp:

- ✅ Dễ hiểu và học tập
- ✅ Nhẹ, không phụ thuộc framework nặng
- ✅ Dễ migrate lên Laravel/CodeIgniter sau này
- ✅ Phù hợp cho sàn thương mại (e-commerce)

## 🏗️ Cấu trúc thư mục

```
UniMarket/
├── app/                    # Application code
│   ├── Controllers/        # Xử lý request, logic nghiệp vụ
│   │   ├── BaseController.php
│   │   ├── AuthController.php
│   │   ├── HomeController.php
│   │   └── ProductController.php
│   │
│   ├── Models/             # Tương tác với Database
│   │   ├── BaseModel.php
│   │   ├── User.php
│   │   └── Product.php
│   │
│   ├── Core/               # Core system (như framework core)
│   │   ├── App.php         # Bootstrap application
│   │   ├── Router.php      # Routing system
│   │   └── Database.php    # Database connection (PDO)
│   │
│   └── Services/           # Business logic, services
│       └── RecommendationService.php
│
├── config/                 # Cấu hình
│   ├── app.php
│   └── database.php
│
├── routes/                 # Định nghĩa routes
│   └── web.php
│
├── resources/              # Resources
│   ├── views/             # Templates/Views
│   │   ├── auth/
│   │   ├── home/
│   │   └── partials/
│   ├── css/
│   └── lang/
│
├── public/                # Public entry point
│   ├── index.php          # Entry point duy nhất
│   ├── .htaccess          # URL rewriting
│   ├── css/
│   ├── js/
│   └── images/
│
└── vendor/                # Composer dependencies
```

## 🔄 Luồng xử lý request

```
1. User truy cập URL
   ↓
2. .htaccess rewrite → public/index.php
   ↓
3. index.php → App::run()
   ↓
4. Router load routes/web.php
   ↓
5. Router dispatch → Controller
   ↓
6. Controller → Model (lấy data từ DB)
   ↓
7. Controller → View (render HTML)
   ↓
8. Response về browser
```

## 📦 Các thành phần chính

### 1. Router (`app/Core/Router.php`)

- Xử lý routing (GET, POST)
- Map URL → Controller + Action
- Tương tự Laravel routes

### 2. Database (`app/Core/Database.php`)

- Singleton pattern (1 connection duy nhất)
- PDO với prepared statements (an toàn)
- Hỗ trợ transaction
- Dễ migrate lên Eloquent (Laravel) sau

### 3. BaseController (`app/Controllers/BaseController.php`)

- Method `view()` để load view
- Có thể thêm: `redirect()`, `json()`, `validate()`

### 4. BaseModel (`app/Models/BaseModel.php`)

- Tự động kết nối Database
- Các Model kế thừa để dùng chung connection

## 🛒 Tính năng sàn thương mại cần có

### Đã có:

- ✅ Authentication (Login/Register)
- ✅ Product Model
- ✅ Router system
- ✅ Database layer

### Cần thêm:

- [ ] Shopping Cart
- [ ] Order Management
- [ ] Payment Integration
- [ ] User Dashboard
- [ ] Product Search & Filter
- [ ] Category Management
- [ ] Image Upload
- [ ] Email Service
- [ ] Admin Panel

## 🚀 Cách migrate lên Framework sau

### Nếu chọn Laravel:

1. **Routes**: `routes/web.php` → Laravel routes (giống nhau)
2. **Controllers**: Giữ nguyên logic, chỉ đổi namespace
3. **Models**: Chuyển sang Eloquent ORM
4. **Views**: Blade syntax (tương tự PHP thuần)
5. **Database**: Dùng migration thay vì SQL file

### Nếu chọn CodeIgniter:

- Cấu trúc gần như giống hệt
- Chỉ cần đổi namespace và một số method

## 💡 Best Practices

### 1. Controller

```php
// ✅ Tốt: Controller chỉ xử lý request/response
public function index() {
    $products = (new Product())->all();
    $this->view('products/index', ['products' => $products]);
}

// ❌ Không tốt: Logic nghiệp vụ trong Controller
public function index() {
    // Tính toán phức tạp ở đây...
}
```

### 2. Model

```php
// ✅ Tốt: Model chỉ tương tác với DB
public function findByCategory($categoryId) {
    return $this->db->fetchAll(
        "SELECT * FROM products WHERE category_id = ?",
        [$categoryId]
    );
}
```

### 3. Service Layer

```php
// ✅ Tốt: Logic nghiệp vụ trong Service
class RecommendationService {
    public function getRecommendedProducts($userId) {
        // Logic phức tạp ở đây
    }
}
```

## 📝 Ghi chú

- Code hiện tại là **PHP thuần**, không phụ thuộc framework
- Cấu trúc MVC giúp code có tổ chức, dễ maintain
- Dễ dàng thêm tính năng mới
- Sẵn sàng để migrate lên framework khi cần
