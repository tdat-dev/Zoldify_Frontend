-- ============================================================================
-- FIX PRODUCT CATEGORIES - Sửa TẤT CẢ dựa trên TÊN SẢN PHẨM
-- ============================================================================
-- Script này sẽ tự động phân loại lại products dựa trên pattern matching tên
-- Bỏ qua điều kiện category hiện tại, chỉ dựa trên TÊN
-- ============================================================================

-- ĐIỆN THOẠI (Category 38)
UPDATE products SET category_id = 38 
WHERE name LIKE '%iPhone%' 
   OR name LIKE '%Samsung Galaxy%'
   OR name LIKE '%Xiaomi%'
   OR name LIKE '%OPPO%'
   OR name LIKE '%Vivo%'
   OR name LIKE '%Realme%'
   OR name LIKE '%OnePlus%'
   OR name LIKE '%Google Pixel%'
   OR name LIKE '%điện thoại%'
   OR name LIKE '%smartphone%';

-- LAPTOP (Category 39) - ƯU TIÊN CAO
UPDATE products SET category_id = 39
WHERE name LIKE '%MacBook%'
   OR name LIKE '%Laptop%'
   OR name LIKE '%Dell%'
   OR name LIKE '%HP%'
   OR name LIKE '%Lenovo%'
   OR name LIKE '%ThinkPad%'
   OR name LIKE '%Asus%'
   OR name LIKE '%Acer%'
   OR name LIKE '%MSI%'
   OR name LIKE '%Surface%'
   OR name LIKE '%XPS%'
   OR name LIKE '%ROG%'
   OR name LIKE '%Spectre%';

-- MÁY ẢNH (Category 40)
UPDATE products SET category_id = 40
WHERE (name LIKE '%Canon%'
   OR name LIKE '%Sony A%'
   OR name LIKE '%Nikon%'
   OR name LIKE '%Fujifilm%'
   OR name LIKE '%GoPro%'
   OR name LIKE '%DJI%'
   OR name LIKE '%Osmo%'
   OR name LIKE '%máy ảnh%'
   OR name LIKE '%camera%'
   OR (name LIKE '%Sony%' AND (name LIKE '%A7%' OR name LIKE '%ZV%')))
   AND name NOT LIKE '%hành trình%';

-- ĐỒNG HỒ (Category 41)
UPDATE products SET category_id = 41
WHERE (name LIKE '%Apple Watch%'
   OR name LIKE '%Galaxy Watch%'
   OR name LIKE '%Garmin%'
   OR name LIKE '%Rolex%'
   OR name LIKE '%Omega%'
   OR name LIKE '%Casio%'
   OR name LIKE '%Seiko%'
   OR name LIKE '%Tissot%'
   OR name LIKE '%đồng hồ%')
   AND name NOT LIKE '%camera%'
   AND name NOT LIKE '%máy ảnh%'
   AND name NOT LIKE '%Forerunner%';

-- ÂM THANH (Category 51) - CHẠY TRƯỚC GIÀY DÉP
UPDATE products SET category_id = 51
WHERE name LIKE '%AirPods%'
   OR name LIKE '%tai nghe%'
   OR name LIKE '%loa%'
   OR name LIKE '%Sony WH%'
   OR name LIKE '%Sony WF%'
   OR name LIKE '%Bose%'
   OR name LIKE '%JBL%'
   OR name LIKE '%Marshall%'
   OR name LIKE '%Sennheiser%'
   OR name LIKE '%FiiO%'
   OR name LIKE '%soundbar%'
   OR name LIKE '%headphone%'
   OR name LIKE '%speaker%'
   OR name LIKE '%DAC%';

-- GIÀY DÉP (Category 42)
UPDATE products SET category_id = 42
WHERE (name LIKE '%Nike%'
   OR name LIKE '%Adidas%'
   OR name LIKE '%Jordan%'
   OR name LIKE '%Yeezy%'
   OR name LIKE '%New Balance%'
   OR name LIKE '%Converse%'
   OR name LIKE '%Vans%'
   OR name LIKE '%Puma%'
   OR name LIKE '%Birkenstock%'
   OR name LIKE '%giày%'
   OR name LIKE '%dép%')
   AND name NOT LIKE '%balo%'
   AND name NOT LIKE '%túi%'
   AND name NOT LIKE '%chạy bộ%';

-- TÚI XÁCH & VÍ (Category 43) - BAO GỒM BALO
UPDATE products SET category_id = 43
WHERE (name LIKE '%Louis Vuitton%'
   OR name LIKE '%Gucci%'
   OR name LIKE '%Coach%'
   OR name LIKE '%Prada%'
   OR name LIKE '%Hermès%'
   OR name LIKE '%Montblanc%'
   OR name LIKE '%Peak Design%'
   OR name LIKE '%túi%'
   OR name LIKE '%ví%'
   OR name LIKE '%balo%'
   OR name LIKE '%backpack%'
   OR name LIKE '%bag%')
   AND name NOT LIKE '%học sinh%'
   AND name NOT LIKE '%giày%'
   AND name NOT LIKE '%máy ảnh%';

-- NHÀ CỬA & ĐỜI SỐNG (Category 44)
UPDATE products SET category_id = 44
WHERE name LIKE '%Robot hút%'
   OR name LIKE '%Roborock%'
   OR name LIKE '%iRobot%'
   OR name LIKE '%lọc không khí%'
   OR name LIKE '%nồi chiên%'
   OR name LIKE '%Air Fryer%'
   OR name LIKE '%pha cà phê%'
   OR name LIKE '%DeLonghi%'
   OR name LIKE '%Dyson%'
   OR name LIKE '%Vitamix%'
   OR name LIKE '%chăn ga%'
   OR name LIKE '%Everon%'
   OR name LIKE '%bình giữ nhiệt%'
   OR name LIKE '%gương%'
   OR name LIKE '%đồ gia dụng%';

-- THỂ THAO & DU LỊCH (Category 45)
UPDATE products SET category_id = 45
WHERE (name LIKE '%xe đạp%'
   OR name LIKE '%Giant%'
   OR name LIKE '%vợt%'
   OR name LIKE '%golf%'
   OR name LIKE '%Callaway%'
   OR name LIKE '%vali%'
   OR name LIKE '%Rimowa%'
   OR name LIKE '%lều%'
   OR name LIKE '%cắm trại%'
   OR name LIKE '%bóng đá%'
   OR name LIKE '%yoga%'
   OR name LIKE '%thảm tập%'
   OR name LIKE '%thể thao%'
   OR name LIKE '%Hydro Flask%'
   OR name LIKE '%Yeti%'
   OR name LIKE '%The North Face%'
   OR name LIKE '%Patagonia%')
   AND name NOT LIKE '%giày%'
   AND name NOT LIKE '%đồng hồ%'
   AND name NOT LIKE '%máy chạy bộ%';

-- SẮC ĐẸP (Category 46)
UPDATE products SET category_id = 46
WHERE name LIKE '%son%'
   OR name LIKE '%Dior%'
   OR name LIKE '%Chanel%'
   OR name LIKE '%nước hoa%'
   OR name LIKE '%kem chống nắng%'
   OR name LIKE '%Anessa%'
   OR name LIKE '%Foreo%'
   OR name LIKE '%serum%'
   OR name LIKE '%Laneige%'
   OR name LIKE '%cọ trang điểm%'
   OR name LIKE '%Sigma%'
   OR name LIKE '%phấn%'
   OR name LIKE '%makeup%';

-- SỨC KHỎE (Category 47)
UPDATE products SET category_id = 47
WHERE name LIKE '%máy chạy bộ%'
   OR name LIKE '%treadmill%'
   OR name LIKE '%ghế massage%'
   OR name LIKE '%Ogawa%'
   OR name LIKE '%huyết áp%'
   OR name LIKE '%Omron%'
   OR name LIKE '%Whey%'
   OR name LIKE '%Protein%'
   OR name LIKE '%Vitamin%'
   OR name LIKE '%Omega%'
   OR name LIKE '%Centrum%'
   OR name LIKE '%Kirkland%';

-- MẸ & BÉ (Category 48)
UPDATE products SET category_id = 48
WHERE name LIKE '%xe đẩy%'
   OR name LIKE '%Combi%'
   OR name LIKE '%ghế ngồi ô tô%'
   OR name LIKE '%Joie%'
   OR name LIKE '%hút sữa%'
   OR name LIKE '%Medela%'
   OR name LIKE '%bỉm%'
   OR name LIKE '%Merries%'
   OR name LIKE '%Pampers%'
   OR name LIKE '%Huggies%'
   OR name LIKE '%sữa%Aptamil%'
   OR name LIKE '%địu em bé%'
   OR name LIKE '%Ergobaby%'
   OR name LIKE '%bình sữa%'
   OR name LIKE '%Comotomo%';

-- XE CỘ (Category 49)
UPDATE products SET category_id = 49
WHERE name LIKE '%xe máy%'
   OR name LIKE '%Honda SH%'
   OR name LIKE '%Vespa%'
   OR name LIKE '%mũ bảo hiểm%'
   OR name LIKE '%Arai%'
   OR name LIKE '%áo giáp%'
   OR name LIKE '%Dainese%'
   OR name LIKE '%camera hành trình%'
   OR name LIKE '%70mai%'
   OR name LIKE '%lốp xe%'
   OR name LIKE '%Michelin%';

-- THÚ CƯNG (Category 50)
UPDATE products SET category_id = 50
WHERE name LIKE '%Royal Canin%'
   OR name LIKE '%Hill\'s Science%'
   OR name LIKE '%Purina%'
   OR name LIKE '%Blue Buffalo%'
   OR name LIKE '%Meow Mix%'
   OR name LIKE '%chuồng mèo%'
   OR name LIKE '%lọc nước%mèo%'
   OR name LIKE '%Petkit%'
   OR name LIKE '%cát vệ sinh%'
   OR name LIKE '%Kit Cat%'
   OR name LIKE '%dây dắt%chó%'
   OR name LIKE '%Flexi%'
   OR name LIKE '%balo phi hành gia%';

-- ============================================================================
-- VERIFY RESULTS
-- ============================================================================

-- Kiểm tra kết quả sau khi chạy:
-- SELECT p.id, p.name, p.category_id, c.name as category_name 
-- FROM products p 
-- LEFT JOIN categories c ON p.category_id = c.id 
-- WHERE p.id BETWEEN 1 AND 129 
-- ORDER BY p.id;

-- Đếm products theo category:
-- SELECT c.id, c.name, COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- WHERE c.parent_id IS NULL
-- GROUP BY c.id, c.name
-- ORDER BY c.id;
