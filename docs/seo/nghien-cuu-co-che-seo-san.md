# Nghiên cứu cơ chế SEO của các sàn và cách áp dụng cho Zoldify

Ngày thực hiện: 05/11/2026. Phạm vi: Shopee, Lazada, Amazon và Chợ Tốt. Chợ Tốt được thêm vào vì là chợ đồ cũ gần với Zoldify nhất.

## 1. Kết luận

Zoldify nên học **cấu trúc trang đích và cách xử lý tin của Chợ Tốt**, **cách chia sitemap của Lazada và Shopee**, và **thang tình trạng hàng của Amazon**. Không nên học cách render của Shopee và Lazada, vì các sàn này có sẵn uy tín tên miền còn Zoldify thì chưa.

Ba việc mang lại nhiều giá trị nhất:

1. Render phía server cho trang sản phẩm, danh mục và shop, kèm metadata và JSON-LD riêng từng trang.
2. Xây hệ thống trang đích theo danh mục, thương hiệu, tầm giá và địa điểm, chỉ mở trang khi có đủ tin thật.
3. Quy định vòng đời tin: đang bán, đã bán, bị gỡ thì URL phản hồi ra sao.

## 2. Phương pháp và độ tin cậy

| Nguồn | Cách lấy | Độ tin cậy |
|---|---|---|
| Lazada | `robots.txt`, sitemap, khoảng 30 request và 4 trang Playwright | Cao với mẫu nhỏ; không biết Googlebot nhận gì |
| Shopee | `robots.txt`, sitemap, blog công khai | Cao với sitemap và `robots.txt`; thấp với nội dung trang |
| Chợ Tốt | 2 trang qua Chrome của chủ dự án, tài liệu `trogiup.chotot.com`, `robots.txt` | Trung bình, mẫu rất nhỏ |
| Amazon | 2 trang qua Chrome của chủ dự án, nguồn công khai | Trung bình đến thấp, phần lớn là blog cho người bán |
| Google | Tài liệu Search Central, đọc qua tóm tắt kết quả tìm kiếm | Cao, nhưng nên đọc lại nguyên văn trước khi triển khai |

**Dữ liệu đã loại bỏ:**

- Agent nghiên cứu đã tải trang Amazon và Chợ Tốt bằng curl trong khi `robots.txt` của hai site này chặn bot Claude. Toàn bộ phát hiện từ các lượt đó không được dùng trong báo cáo này.
- Bản chụp trang sản phẩm Shopee cũng không được dùng, vì hệ thống chống bot đã chấm dứt phiên đó.
- Theo quyết định của chủ dự án, Chợ Tốt và Amazon được xem lại qua Chrome. Shopee cũng thử lại nhưng chuyển sang CAPTCHA nên đã dừng, không giải CAPTCHA.

Dữ liệu qua Chrome là DOM sau khi render, không chứng minh được HTML ban đầu gửi cho Googlebot.

## 3. So sánh cơ chế

| Cơ chế | Chợ Tốt | Lazada | Shopee | Amazon |
|---|---|---|---|---|
| URL sản phẩm | `/mua-ban-{danh mục}-{quận}-{tỉnh}/{id}.htm` | `/products/{slug}-i{id}.html` | `/{slug}-i.{shopid}.{itemid}` | `/{slug}/dp/{ASIN}` |
| Tiêu đề sản phẩm | `{tên tin} - {id}` | `{tên} \| Lazada Việt Nam` | Chưa xác minh | `Amazon.com: {tên} : {danh mục}` |
| Tiêu đề danh mục | Có địa điểm, ngày cập nhật; H1 có số tin thật | Viết tay hoặc theo mẫu `Mua {danh mục} {hãng} Online, Giá Tốt` | Chưa xác minh | Theo mẫu cho trang Best Sellers |
| JSON-LD sản phẩm | `Product`, `Offer`, `BreadcrumbList` | `Product`, `AggregateOffer`, mẫu đã xem thiếu giá | Chưa xác minh | Không có trên trang đã xem |
| JSON-LD danh mục | `BreadcrumbList`, `ItemList` | Có sau khi render, còn lỗi dữ liệu | Chưa xác minh | Không có trên trang đã xem |
| Lọc và sắp xếp | Chặn tham số thô trong `robots.txt` | Canonical về danh mục gốc | Chặn một số tham số lọc và theo dõi | Chưa xác minh |
| Sitemap | Khai báo trong `robots.txt` | Chia theo tín hiệu: có đơn 30 ngày, có đánh giá, tag | Chia theo danh mục, có sitemap ảnh và shop | Không khai báo trong `robots.txt` |
| Trang đích | Danh mục x địa điểm x hãng, trang tag theo tầm giá | `/tag/`, danh mục x hãng, `/trending/` | Sitemap từ khoá tuyển chọn | Chưa xác minh ngoài Best Sellers |
| Tin không còn | Ẩn thay vì xoá, lưu 60 ngày | ID không tồn tại trả 404 thật | Chưa xác minh | Trang vẫn sống với "Currently unavailable", theo nguồn người bán |
| Chất lượng tin | Công thức tiêu đề, ảnh thật, từ chối tin trùng | Điểm nội dung theo thuộc tính | Thuộc tính phải khớp, hàng đã dùng phải ghi tình trạng | Thang tình trạng cố định kèm ghi chú |

## 4. Đề xuất áp dụng cho Zoldify

### 4.1 URL

Dùng ID làm định danh, slug chỉ để đọc và chứa từ khoá.

| Loại trang | Hiện tại | Đề xuất |
|---|---|---|
| Sản phẩm | `/product/{id}` | `/product/{slug}-i{id}` |
| Danh mục | `/category/{slug}` | Giữ nguyên |
| Danh mục x hãng | Chưa có | `/category/{slug}/{hang}` |
| Danh mục x tầm giá | Chưa có | `/category/{slug}/gia-duoi-1-trieu` |
| Danh mục x địa điểm | Chưa có | `/category/{slug}/tai-{tinh}`, cần dữ liệu địa điểm |
| Shop | `/shop?seller={id}` | `/shop/{seller-slug}-{id}` |

Sai slug hoặc URL cũ theo ID thì chuyển hướng 301 về URL chuẩn. Lazada giữ 200 và dùng canonical, nhưng chuyển hướng gọn hơn.

### 4.2 Tiêu đề và mô tả

| Loại trang | Tiêu đề | Mô tả |
|---|---|---|
| Sản phẩm | `{tên} ({tình trạng}) giá {giá} \| Zoldify` | Sinh từ tên, tình trạng, giá và nơi bán; không lấy nguyên văn lời người bán |
| Danh mục | `{Danh mục} cũ giá tốt, {số tin} tin đang bán \| Zoldify` | Số tin thật và tầm giá thật |
| Danh mục x hãng | `{Hãng} {danh mục} cũ, {số tin} tin \| Zoldify` | Giá thấp nhất và tầm giá thật |
| Shop | `{Tên shop}, {số tin} món đang bán \| Zoldify` | Điểm đánh giá và số món đã bán, nếu có |

Không đưa nguyên mô tả người bán vào thẻ meta, vì mẫu của Lazada và Chợ Tốt đã lộ số điện thoại hoặc emoji. Mẫu tiêu đề hiện dùng trong `layout.tsx` cũng cần đổi dấu phân cách cho thống nhất.

### 4.3 Dữ liệu có cấu trúc

- Trang sản phẩm: `Product`, `Offer` (giá, `VND`, `availability`, `itemCondition`, người bán) và `BreadcrumbList`.
- Trang danh mục, trang đích: `BreadcrumbList` và `ItemList`.
- Trang chủ: `Organization` và `WebSite` kèm `SearchAction`.
- `aggregateRating` chỉ dùng khi đánh giá thật sự dành cho món hàng đó. Không dùng điểm của người bán, và không dùng cho dữ liệu thử.

Ánh xạ giá trị đang có trong code:

| Zoldify | schema.org |
|---|---|
| `condition = new` | `NewCondition` |
| `condition = like_new`, `good`, `fair` | `UsedCondition` |
| `status = active`, còn tồn kho | `InStock` |
| `status = sold` | `SoldOut` |

### 4.4 Quy tắc index

Theo tài liệu Google: `robots.txt` kiểm soát thu thập, không kiểm soát index. URL bị chặn thì Google không đọc được `noindex`, nên **không dùng cả hai trên cùng một URL**.

| Loại URL | Xử lý | Sitemap |
|---|---|---|
| Sản phẩm thật đang bán | `index`, canonical về chính nó | Có |
| Sản phẩm thử (`sp-1m-*`) | `noindex`, không chặn trong `robots.txt` | Không |
| Danh mục, trang đích đủ tin | `index` | Có |
| Trang đích không đủ tin | 404, hoặc `noindex` nếu còn ít tin | Không |
| Trang phân trang | Canonical về chính nó, không gộp về trang 1 | Không |
| Bộ lọc tự do, sắp xếp, `utm_` | Chặn trong `robots.txt`, không gắn `noindex` | Không |
| Tìm kiếm nội bộ | `noindex`, chống URL rác từ từ khoá spam | Không |
| Giỏ hàng, thanh toán, tài khoản | Chặn trong `robots.txt` | Không |

Mọi sản phẩm phải có ít nhất một đường liên kết từ trang được phép thu thập, vì sitemap của Zoldify không thay thế được liên kết nội bộ.

### 4.5 Vòng đời tin

Đây là chỗ Zoldify khác các sàn lớn: mỗi món đồ cũ chỉ có một cái, bán xong là hết. Code đã có `ProductStatus.SOLD`.

| Trạng thái | Phản hồi | Ghi chú |
|---|---|---|
| Đang bán | 200, `InStock` | Có trong sitemap |
| Đã bán, dưới 60 ngày | 200, `SoldOut`, gợi ý món tương tự | Rời sitemap, giữ để người xem không gặp trang chết |
| Đã bán, trên 60 ngày | 410 | Mốc 60 ngày là giả định khởi đầu, cần điều chỉnh theo dữ liệu thật |
| Bị gỡ, bị từ chối, đã xoá | 404 | Không chuyển hướng hàng loạt về trang chủ hay danh mục |
| Có món thay thế thật | 301 | Hiếm khi áp dụng với đồ cũ |

Google khuyên không chuyển hướng tới trang chỉ na ná, và coi 200 kèm "không tìm thấy" là soft 404.

### 4.6 Sitemap

- `sitemap.xml` là file index, trỏ tới các file con: sản phẩm, danh mục, trang đích, shop.
- Mỗi file tối đa 50.000 URL hoặc 50 MB chưa nén.
- `lastmod` phải là thời điểm nội dung đổi thật, không đóng dấu ngày hiện tại như phần lớn sitemap mẫu của Lazada.
- Có thể tách riêng tin chất lượng cao theo cách của Lazada khi có đủ dữ liệu thật.

### 4.7 Trang đích

Lazada có tag và danh mục x hãng; Chợ Tốt ghép danh mục với địa điểm, hãng và tầm giá. Chất lượng không đồng đều: mẫu của Lazada có trang `/dien-thoai-di-dong/samsung/` là soft 404 dù được trang chủ liên kết tới.

Zoldify cần cổng chất lượng:

- Chỉ mở trang khi có đủ tin thật. Đề xuất bắt đầu từ 5 tin, đây là giả định cần chỉnh sau.
- Tiêu đề, H1 và số tin phản ánh dữ liệu thật tại thời điểm render.
- Có đoạn nội dung riêng, ví dụ tầm giá thực tế, không sinh văn bản rỗng.
- Liên kết chéo: danh mục tới hãng, hãng tới tầm giá, sản phẩm tới trang đích liên quan.

### 4.8 Chất lượng tin đăng

- **Thang tình trạng:** định nghĩa rõ `new`, `like_new`, `good`, `fair`; bắt buộc ghi chú khi không phải hàng mới.
- **Công thức tiêu đề:** gợi ý `{hãng} {model} {dung lượng hoặc màu} {tình trạng}`, cần tiếng Việt có dấu.
- **Thuộc tính bắt buộc theo danh mục:** ví dụ pin và dung lượng cho điện thoại. Hiện `spec` là văn bản tự do nên chưa lọc được.
- **Từ chối tin trùng:** kể cả trùng với tin đã ẩn, gợi ý khôi phục thay vì đăng lại.
- **Không cho sửa tin thành món khác:** giữ đúng nội dung URL đã được index.

## 5. Dữ liệu Zoldify còn thiếu

| Thiếu | Ảnh hưởng | Hướng xử lý |
|---|---|---|
| Sản phẩm chưa có trường địa điểm | Không làm được trang theo tỉnh | Thêm tỉnh, quận khi đăng tin, lấy mặc định từ địa chỉ người bán |
| 9 danh mục phẳng, không có danh mục cha | Quá ít trang đích | Thiết kế cây danh mục 2 cấp |
| Thông số là văn bản tự do | Không lọc được theo thuộc tính | Thuộc tính có cấu trúc theo danh mục |
| Shop chưa có URL riêng | Google khó index trang shop | Thêm route theo slug người bán |
| Dữ liệu thử chiếm gần hết kho | Có thể bị đánh giá là nội dung rác | `noindex`, loại khỏi sitemap |

Ví dụ dữ liệu thử sai lệch: Galaxy S4 Active ra mắt 2013 ghi `condition: new`, tồn kho 100.

## 6. Không nên học theo

- Khung JS rỗng của Shopee và danh mục chỉ có nội dung sau khi chạy JS của Lazada.
- Lazada gộp trang 2 về canonical trang 1, và để trang tìm kiếm được index.
- Lấy nguyên mô tả người bán làm thẻ meta.
- JSON-LD thiếu giá hoặc sai dữ liệu.
- Đóng dấu `lastmod` bằng ngày hiện tại.
- Trang báo không tìm thấy nhưng vẫn trả 200 (soft 404), như mẫu của Lazada.
- Bỏ JSON-LD như Amazon: Zoldify chưa có uy tín tên miền để làm vậy.

## 7. Chưa xác minh được

- HTML mà Googlebot thực sự nhận trên cả bốn sàn.
- Mã trạng thái khi tin đã bán hoặc hết hàng trên Chợ Tốt, Shopee và Amazon.
- Tiêu đề, JSON-LD, canonical và phân trang của Shopee.
- Hiệu quả thực tế của từng cơ chế: không có dữ liệu traffic hay thứ hạng.
- Lý do trang Amazon đã xem có canonical trỏ về `/clp/{ASIN}`. Mới thấy trên một trang, chưa coi là quy luật.
- Số lượng trang Zoldify đã được Google index: chưa có quyền xem Search Console.

## 8. Nguồn

- [Quản lý thu thập URL điều hướng theo bộ lọc](https://developers.google.com/crawling/docs/faceted-navigation)
- [Chặn index bằng noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Phân trang](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading?hl=en)
- [Dữ liệu có cấu trúc cho merchant listing](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Dữ liệu có cấu trúc cho product snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google SEO Office Hours tháng 8/2024](https://developers.google.com/search/help/office-hours/2024/august)
- [Tạo và gửi sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Quy định đăng tin Chợ Tốt](https://trogiup.chotot.com/nguoi-ban/dang-tin/)
- [Ẩn tin Chợ Tốt](https://trogiup.chotot.com/nguoi-ban/an-tin-da-dang/)
- [Lý do tin bị từ chối trên Chợ Tốt](https://trogiup.chotot.com/nguoi-ban/tai-sao-tin-cua-toi-bi-tu-choi/)
- [Hướng dẫn mô tả sản phẩm của Shopee](https://shopee.vn/blog/mo-ta-san-pham-shopee/)
