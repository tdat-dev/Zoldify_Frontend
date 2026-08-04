<?php
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<!-- Main Layout -->
<main class="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen pb-32 font-sans">
    <div class="max-w-4xl mx-auto pt-8 px-4 sm:px-6">

        <!-- Progress Indicator -->
        <div class="mb-8">
            <div class="flex items-center justify-center">
                <!-- Step 1 -->
                <div class="flex items-center">
                    <div id="stepIndicator1"
                        class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/30">
                        1
                    </div>
                    <span id="stepLabel1" class="ml-3 text-sm font-semibold text-indigo-600 hidden sm:block">Thông tin
                        sản phẩm</span>
                </div>

                <!-- Arrow -->
                <div class="mx-4 sm:mx-8 flex items-center text-slate-300">
                    <div class="w-12 sm:w-24 h-0.5 bg-slate-200" id="stepLine"></div>
                    <i class="fa-solid fa-chevron-right ml-2 text-xs"></i>
                </div>

                <!-- Step 2 -->
                <div class="flex items-center">
                    <div id="stepIndicator2"
                        class="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition-all">
                        2
                    </div>
                    <span id="stepLabel2" class="ml-3 text-sm font-medium text-slate-400 hidden sm:block">Chi tiết bán
                        hàng</span>
                </div>
            </div>
        </div>

        <!-- Page Header -->
        <div class="mb-6 text-center">
            <h1 id="pageTitle" class="text-2xl font-extrabold text-slate-800 tracking-tight">Thông tin sản phẩm</h1>
            <p id="pageSubtitle" class="text-slate-500 mt-1 text-sm">Điền thông tin cơ bản về sản phẩm của bạn</p>
        </div>

        <form id="productForm" action="/products/store" method="POST" enctype="multipart/form-data">

            <!-- Alert Errors -->
            <?php if (isset($errors) && !empty($errors)): ?>
            <div class="bg-red-50/80 border border-red-100 rounded-xl p-4 mb-6 shadow-sm">
                <div class="flex">
                    <i class="fa-solid fa-circle-exclamation text-red-500 text-lg"></i>
                    <div class="ml-3">
                        <h3 class="text-sm font-semibold text-red-800">Vui lòng kiểm tra lại:</h3>
                        <ul class="mt-1 text-sm text-red-600 list-disc list-inside">
                            <?php foreach ($errors as $error): ?>
                            <li><?= htmlspecialchars($error) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                </div>
            </div>
            <?php endif; ?>

            <!-- ============================================== -->
            <!-- STEP 1: THÔNG TIN SẢN PHẨM -->
            <!-- ============================================== -->
            <div id="step1" class="step-content">
                <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">

                    <!-- Section: Hình ảnh -->
                    <div class="p-6 sm:p-8 border-b border-slate-100">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <i class="fa-solid fa-images text-indigo-500"></i> Hình ảnh sản phẩm
                                    <span class="text-red-500">*</span>
                                </h2>
                                <p class="text-sm text-slate-400 mt-1">Tối đa 9 ảnh. Ảnh đầu tiên sẽ là ảnh bìa.</p>
                            </div>
                        </div>

                        <!-- Upload Container (Shopee Style) -->
                        <div class="flex flex-wrap gap-3" id="uploadContainer">
                            <!-- Preview Images will be inserted here by JS -->

                            <!-- Upload Button (Always last) -->
                            <div class="relative group w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                                <input type="file" name="images[]" id="imageInput" accept="image/*" multiple
                                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                <div
                                    class="border-2 border-dashed border-red-300 rounded-lg w-full h-full flex flex-col items-center justify-center bg-red-50/10 hover:bg-red-50 hover:border-red-500 transition-all text-red-400 hover:text-red-500">
                                    <i class="fa-solid fa-camera text-xl mb-1"></i>
                                    <span class="text-[10px] font-medium">Thêm ảnh</span>
                                    <span class="text-[9px] opacity-70">(<span id="imgCount">0</span>/9)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="text-sm text-red-500 mt-3 hidden font-medium" id="imgError">
                        <i class="fa-solid fa-circle-xmark"></i> Vui lòng chọn ít nhất 1 ảnh sản phẩm.
                    </p>

                <!-- Section: Tên sản phẩm -->
                <div class="p-6 sm:p-8 border-b border-slate-100">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-bold text-slate-700">Tên sản phẩm <span
                                class="text-red-500">*</span></label>
                        <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            <span id="nameCount">0</span>/90
                        </span>
                    </div>
                    <input type="text" name="name" id="inputName" maxlength="90" required
                        value="<?= htmlspecialchars($old['name'] ?? '') ?>"
                        placeholder="Ví dụ: iPhone 14 Pro Max 256GB - Like New 99%"
                        class="w-full h-12 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium placeholder-slate-400 transition-all">
                </div>

                <!-- Section: Danh mục -->
                <div class="p-6 sm:p-8 border-b border-slate-100 relative z-50" id="categoryContainer">
                    <label class="block text-sm font-bold text-slate-700 mb-2">Danh mục sản phẩm <span
                            class="text-red-500">*</span></label>

                    <div class="relative cursor-pointer group" id="categoryTrigger">
                        <input type="text" id="categoryDisplay" readonly placeholder="Chọn danh mục phù hợp..."
                            class="w-full h-12 pl-4 pr-10 border border-slate-200 rounded-xl bg-white focus:border-indigo-500 outline-none text-sm text-slate-700 cursor-pointer hover:border-indigo-300">
                        <div class="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <i class="fa-solid fa-chevron-down text-xs" id="categoryArrow"></i>
                        </div>
                        <input type="hidden" name="category_id" id="inputCategoryId" required>

                        <!-- Category Dropdown Panel - inside trigger for proper positioning -->
                        <div id="categoryPanel"
                            class="hidden absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[9999]">
                            <div class="flex">
                                <div class="w-1/2 border-r border-slate-100 bg-white">
                                    <div class="p-3 border-b border-slate-100 bg-white">
                                        <span class="text-xs font-bold text-slate-400 uppercase">Danh mục chính</span>
                                    </div>
                                    <div id="parentCategoryList" class="max-h-[300px] overflow-y-auto bg-white"></div>
                                </div>
                                <div class="w-1/2 bg-slate-50">
                                    <div class="p-3 border-b border-slate-100 bg-slate-50">
                                        <span class="text-xs font-bold text-slate-400 uppercase">Danh mục con</span>
                                    </div>
                                    <div id="childCategoryList" class="max-h-[300px] overflow-y-auto p-2 bg-slate-50">
                                        <div
                                            class="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                                            <i class="fa-solid fa-arrow-left text-xl mb-2"></i>
                                            <span class="text-sm">Chọn danh mục bên trái</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section: Tình trạng -->
                <div class="p-6 sm:p-8 relative z-10">
                    <label class="block text-sm font-bold text-slate-700 mb-4">Tình trạng sản phẩm <span
                            class="text-red-500">*</span></label>
                    <input type="hidden" name="product_condition" id="inputCondition" required>

                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <?php
                        $conditions = \App\Models\Product::getConditions();
                        foreach ($conditions as $key => $cond):
                            ?>
                        <div class="condition-card group cursor-pointer border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:border-indigo-500 hover:shadow-lg transition-all bg-white relative"
                            data-condition="<?= $key ?>" onclick="selectCondition(this, '<?= $key ?>')">
                            <div
                                class="w-9 h-9 rounded-full <?= $cond['color_bg'] ?> <?= $cond['color_text'] ?> flex items-center justify-center <?= $cond['hover_bg'] ?> group-hover:text-white transition-colors">
                                <i class="<?= $cond['icon'] ?>"></i>
                            </div>
                            <span class="text-sm font-bold text-slate-700"><?= $cond['label'] ?></span>
                            <span class="text-[10px] text-slate-400 leading-relaxed"><?= $cond['description'] ?></span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Step 1 Actions -->
                <div class="p-6 sm:p-8 border-t border-slate-100 flex items-center justify-between">
                    <button type="button" onclick="history.back()"
                        class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">
                        <i class="fa-solid fa-arrow-left mr-2"></i> Hủy
                    </button>
                    <button type="button" onclick="goToStep2()"
                        class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2">
                        Tiếp tục <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
                </div> <!-- End bg-white -->
            </div> <!-- End step1 -->

    <!-- ============================================== -->
    <!-- STEP 2: CHI TIẾT BÁN HÀNG -->
    <!-- ============================================== -->
    <div id="step2" class="step-content hidden">
        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">

            <!-- Section: Giá & Số lượng -->
            <div class="p-6 sm:p-8 border-b border-slate-100">
                <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-tag text-indigo-500"></i> Giá bán & Số lượng
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Số lượng -->
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Số lượng <span
                                class="text-red-500">*</span></label>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="adjustQuantity(-1)"
                                class="w-11 h-11 rounded-l-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 font-bold">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <input type="number" name="quantity" id="inputQuantity" min="1" value="1"
                                class="w-20 h-11 border-y border-slate-200 text-center font-bold text-lg text-slate-700 focus:outline-none">
                            <button type="button" onclick="adjustQuantity(1)"
                                class="w-11 h-11 rounded-r-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-600 font-bold">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Giá bán -->
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Giá bán <span
                                class="text-red-500">*</span></label>
                        <div
                            class="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all bg-white">
                            <div
                                class="w-12 h-11 flex items-center justify-center bg-slate-50 border-r border-slate-200 text-slate-500 font-bold">
                                ₫</div>
                            <input type="text" id="displayPrice" required placeholder="0"
                                class="flex-1 h-11 px-4 border-none outline-none text-lg font-bold text-slate-800 placeholder-slate-300 bg-transparent">
                            <input type="hidden" name="price" id="realPrice" required>
                        </div>
                        <!-- Quick Price Tags -->
                        <div class="mt-2 flex gap-2 flex-wrap">
                            <button type="button" onclick="setPrice(50000)"
                                class="text-xs border border-slate-200 rounded-full px-3 py-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">50k</button>
                            <button type="button" onclick="setPrice(100000)"
                                class="text-xs border border-slate-200 rounded-full px-3 py-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">100k</button>
                            <button type="button" onclick="setPrice(200000)"
                                class="text-xs border border-slate-200 rounded-full px-3 py-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">200k</button>
                            <button type="button" onclick="setPrice(500000)"
                                class="text-xs border border-slate-200 rounded-full px-3 py-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">500k</button>
                        </div>
                    </div>
                </div>

                <!-- Shipping Fee Payer -->
                <div class="mt-6 border-t border-slate-100 pt-6">
                    <label class="block text-sm font-bold text-slate-700 mb-4">Phí vận chuyển <span class="text-red-500">*</span></label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Option: Buyer Pays -->
                        <div id="shipOption0" onclick="selectShipping(0)" 
                             class="cursor-pointer p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 hover:bg-slate-50 transition-all flex items-start gap-3">
                            <input type="radio" name="is_freeship" value="0" id="radioShip0" class="hidden" checked>
                            <div id="shipTick0" class="w-5 h-5 rounded-full border border-indigo-500 bg-indigo-500 flex items-center justify-center mt-0.5">
                                <i class="fa-solid fa-check text-white text-[10px]"></i>
                            </div>
                            <div>
                                <div class="text-sm font-bold text-slate-700">Người mua trả phí</div>
                                <div class="text-xs text-slate-500 mt-1">Người mua sẽ thanh toán phí ship khi nhận hàng.</div>
                            </div>
                        </div>
                        
                        <!-- Option: Seller Pays -->
                        <div id="shipOption1" onclick="selectShipping(1)" 
                             class="cursor-pointer p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-start gap-3 group">
                            <input type="radio" name="is_freeship" value="1" id="radioShip1" class="hidden">
                            <div id="shipTick1" class="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center mt-0.5">
                                <i class="fa-solid fa-check text-white text-[10px] hidden"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <div class="text-sm font-bold text-slate-700">Người bán trả phí</div>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">Freeship</span>
                                </div>
                                <div class="text-xs text-slate-500 mt-1">Bạn sẽ chịu phí ship. Thu hút người mua hơn!</div>
                            </div>
                        </div>
                    </div>
                </div>

                <script>
                function selectShipping(val) {
                    // Set radio value
                    document.getElementById('radioShip' + val).checked = true;

                    // Reset styling
                    [0, 1].forEach(v => {
                        const opt = document.getElementById('shipOption' + v);
                        const tick = document.getElementById('shipTick' + v);
                        const icon = tick.querySelector('i');

                        if (v === val) {
                            // Active state
                            opt.classList.remove('border-slate-200');
                            opt.classList.add('border-2', 'border-indigo-500', 'bg-indigo-50/50');
                            tick.classList.remove('border-slate-300');
                            tick.classList.add('border-indigo-500', 'bg-indigo-500');
                            icon.classList.remove('hidden');
                        } else {
                            // Inactive state
                            opt.classList.add('border-slate-200');
                            opt.classList.remove('border-2', 'border-indigo-500', 'bg-indigo-50/50');
                            tick.classList.add('border-slate-300');
                            tick.classList.remove('border-indigo-500', 'bg-indigo-500');
                            icon.classList.add('hidden');
                        }
                    });
                }
                </script>

                <!-- Fee Calculator -->
                <div id="feeCalculator"
                    class="mt-6 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl p-4 border border-slate-200 hidden">
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between text-slate-600">
                            <span>Giá bán</span>
                            <span id="displayPriceLabel" class="font-semibold">0đ</span>
                        </div>
                        <!-- Summary Line -->
                        <div class="flex justify-between text-slate-500 cursor-pointer group"
                            onclick="toggleFeeDetails()">
                            <span
                                class="border-b border-dashed border-slate-300 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-colors">
                                (-) Tổng phí & Thuế ước tính <i class="fa-solid fa-circle-info text-xs ml-1"></i>
                            </span>
                            <span id="totalFeeAmount" class="text-red-500 font-medium">-0đ</span>
                        </div>

                        <!-- Detailed Breakdown (Hidden by default) -->
                        <div id="feeDetails"
                            class="hidden pl-4 border-l-2 border-slate-100 my-2 space-y-1 bg-slate-50/50 rounded-r-lg p-2 text-xs">
                            <div class="flex justify-between text-slate-400">
                                <span>• Phí dịch vụ (5%)</span>
                                <span id="feeAmount">-0đ</span>
                            </div>
                            <div class="flex justify-between text-slate-400">
                                <span>• Phí thanh toán (2.5%)</span>
                                <span id="paymentFeeAmount">-0đ</span>
                            </div>
                            <div class="flex justify-between text-slate-400">
                                <span>• Thuế khấu trừ (1.5%)</span>
                                <span id="taxAmount">-0đ</span>
                            </div>
                        </div>
                        <div class="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                            <span>Bạn nhận được</span>
                            <span id="sellerReceive" class="text-green-600 text-lg">0đ</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section: Mô tả -->
            <div class="p-6 sm:p-8 border-b border-slate-100">
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-bold text-slate-700">Mô tả sản phẩm</label>
                    <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        <span id="descCount">0</span>/2000
                    </span>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2">
                        <textarea name="description" id="inputDescription" rows="6" maxlength="2000"
                            class="w-full p-4 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-slate-700 placeholder-slate-400 resize-none"
                            placeholder="Mô tả chi tiết về sản phẩm của bạn..."></textarea>
                    </div>
                    <div class="bg-indigo-50/50 rounded-xl p-4 text-xs text-indigo-700 leading-relaxed">
                        <p class="font-bold mb-2"><i class="fa-solid fa-lightbulb mr-1"></i> Mô tả nên có:</p>
                        <ul class="space-y-1 text-indigo-600">
                            <li>• Loại sản phẩm, tên sản phẩm</li>
                            <li>• Thương hiệu, xuất xứ</li>
                            <li>• Chất liệu, màu sắc</li>
                            <li>• Kích cỡ/Size (nếu có)</li>
                            <li>• Tình trạng chi tiết</li>
                            <li>• Chính sách bảo hành, đổi trả</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Section: Thông tin khác (Optional) -->
            <div class="p-6 sm:p-8 border-b border-slate-100">
                <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-circle-info text-indigo-500"></i> Thông tin khác
                    <span class="text-xs font-normal text-slate-400">(Tùy chọn)</span>
                </h2>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- Màu sắc -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Màu sắc</label>
                        <select name="color"
                            class="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm text-slate-700 bg-white">
                            <option value="">Chọn màu sắc</option>
                            <option value="Đen">Đen</option>
                            <option value="Trắng">Trắng</option>
                            <option value="Xám">Xám</option>
                            <option value="Đỏ">Đỏ</option>
                            <option value="Xanh dương">Xanh dương</option>
                            <option value="Xanh lá">Xanh lá</option>
                            <option value="Vàng">Vàng</option>
                            <option value="Hồng">Hồng</option>
                            <option value="Tím">Tím</option>
                            <option value="Nâu">Nâu</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <!-- Thương hiệu -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Thương hiệu</label>
                        <input type="text" name="brand" placeholder="Nhập thương hiệu"
                            class="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm text-slate-700">
                    </div>

                    <!-- Kích cỡ -->
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-2">Kích cỡ / Size</label>
                        <input type="text" name="size" placeholder="VD: XL, 42, 100ml..."
                            class="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm text-slate-700">
                    </div>
                </div>
            </div>

            <!-- Section: Địa chỉ lấy hàng -->
            <div class="p-6 sm:p-8 border-b border-slate-100">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-location-dot text-indigo-500"></i> Địa chỉ lấy hàng
                        <span class="text-red-500">*</span>
                    </h2>
                    <a href="/addresses" class="text-sm text-indigo-600 hover:underline">Quản lý</a>
                </div>

                <?php if (!empty($addresses)): ?>
                <div class="space-y-3">
                    <?php foreach ($addresses as $addr):
                            $hasGHN = !empty($addr['ghn_district_id']) && !empty($addr['ghn_ward_code']);
                            ?>
                    <label
                        class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:border-indigo-400 transition-all <?= $addr['is_default'] ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200' ?> <?= !$hasGHN ? 'opacity-60' : '' ?>">
                        <input type="radio" name="pickup_address_id" value="<?= $addr['id'] ?>"
                            class="mt-1 text-indigo-600" <?= $addr['is_default'] ? 'checked' : '' ?>
                            <?= !$hasGHN ? 'disabled' : '' ?>>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                    class="font-semibold text-slate-800"><?= htmlspecialchars($addr['recipient_name']) ?></span>
                                <span class="text-slate-400">|</span>
                                <span
                                    class="text-slate-600 text-sm"><?= htmlspecialchars($addr['phone_number']) ?></span>
                                <?php if ($addr['is_default']): ?>
                                <span class="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">Mặc
                                    định</span>
                                <?php endif; ?>
                                <?php if (!$hasGHN): ?>
                                <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">Chưa
                                    có mã GHN</span>
                                <?php endif; ?>
                            </div>
                            <div class="text-sm text-slate-600">
                                <?= htmlspecialchars($addr['full_address'] ?: $addr['street_address']) ?>
                            </div>
                        </div>
                    </label>
                    <?php endforeach; ?>
                </div>
                <div class="mt-4">
                    <a href="/addresses/create?redirect_to=<?= urlencode('/products/create') ?>"
                        class="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline font-medium">
                        <i class="fa-solid fa-plus"></i> Thêm địa chỉ mới
                    </a>
                </div>
                <?php else: ?>
                <div class="text-center py-8 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                    <i class="fa-solid fa-location-dot text-3xl text-slate-300 mb-3"></i>
                    <p class="text-slate-600 font-medium mb-2">Chưa có địa chỉ lấy hàng</p>
                    <a href="/addresses/create?redirect_to=<?= urlencode('/products/create') ?>"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <i class="fa-solid fa-plus"></i> Thêm địa chỉ
                    </a>
                </div>
                <?php endif; ?>
            </div>

            <!-- Step 2 Actions -->
            <div class="p-6 sm:p-8 flex items-center justify-between">
                <button type="button" onclick="goToStep1()"
                    class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-arrow-left"></i> Quay lại
                </button>
                <button type="submit"
                    class="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                    <i class="fa-solid fa-paper-plane"></i> Đăng bán ngay
                </button>
            </div>
        </div>
    </div>

    </form>
    </div>
</main>

<!-- JS -->
<script>
window.categoryData = <?= json_encode($categories) ?>;
</script>
<script src="/js/product-create.js?v=<?= time() ?>"></script>

<script>
// ===== STEP NAVIGATION =====
function goToStep2() {
    // Validate Step 1
    const images = document.getElementById('imageInput').files;
    const name = document.getElementById('inputName').value.trim();
    const category = document.getElementById('inputCategoryId').value;
    const condition = document.getElementById('inputCondition').value;

    if (images.length === 0) {
        document.getElementById('imgError').classList.remove('hidden');
        return;
    }
    document.getElementById('imgError').classList.add('hidden');

    if (!name) {
        alert('Vui lòng nhập tên sản phẩm');
        document.getElementById('inputName').focus();
        return;
    }

    if (!category) {
        alert('Vui lòng chọn danh mục sản phẩm');
        return;
    }

    if (!condition) {
        alert('Vui lòng chọn tình trạng sản phẩm');
        return;
    }

    // Switch to Step 2
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');

    // Update indicators
    document.getElementById('stepIndicator1').classList.remove('bg-indigo-600', 'text-white', 'shadow-lg',
        'shadow-indigo-500/30');
    document.getElementById('stepIndicator1').classList.add('bg-green-500', 'text-white');
    document.getElementById('stepIndicator1').innerHTML = '<i class="fa-solid fa-check"></i>';

    document.getElementById('stepIndicator2').classList.remove('bg-slate-200', 'text-slate-500');
    document.getElementById('stepIndicator2').classList.add('bg-indigo-600', 'text-white', 'shadow-lg',
        'shadow-indigo-500/30');

    document.getElementById('stepLabel1').classList.remove('text-indigo-600');
    document.getElementById('stepLabel1').classList.add('text-green-600');

    document.getElementById('stepLabel2').classList.remove('text-slate-400');
    document.getElementById('stepLabel2').classList.add('text-indigo-600', 'font-semibold');

    document.getElementById('stepLine').classList.add('bg-green-500');

    // Update header
    document.getElementById('pageTitle').textContent = 'Chi tiết bán hàng';
    document.getElementById('pageSubtitle').textContent = 'Đặt giá và thông tin vận chuyển';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function goToStep1() {
    // Switch to Step 1
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');

    // Reset indicators
    document.getElementById('stepIndicator1').classList.add('bg-indigo-600', 'text-white', 'shadow-lg',
        'shadow-indigo-500/30');
    document.getElementById('stepIndicator1').classList.remove('bg-green-500');
    document.getElementById('stepIndicator1').innerHTML = '1';

    document.getElementById('stepIndicator2').classList.add('bg-slate-200', 'text-slate-500');
    document.getElementById('stepIndicator2').classList.remove('bg-indigo-600', 'text-white', 'shadow-lg',
        'shadow-indigo-500/30');

    document.getElementById('stepLabel1').classList.add('text-indigo-600');
    document.getElementById('stepLabel1').classList.remove('text-green-600');

    document.getElementById('stepLabel2').classList.add('text-slate-400');
    document.getElementById('stepLabel2').classList.remove('text-indigo-600', 'font-semibold');

    document.getElementById('stepLine').classList.remove('bg-green-500');

    // Update header
    document.getElementById('pageTitle').textContent = 'Thông tin sản phẩm';
    document.getElementById('pageSubtitle').textContent = 'Điền thông tin cơ bản về sản phẩm của bạn';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== DESCRIPTION COUNTER =====
document.getElementById('inputDescription')?.addEventListener('input', function(e) {
    document.getElementById('descCount').textContent = e.target.value.length;
});
</script>

<?php include __DIR__ . '/../partials/footer.php'; ?>