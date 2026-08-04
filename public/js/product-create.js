/**
 * Product Create Form - JavaScript Logic
 * Handles: Condition cards, Price formatting, Image upload, Category picker
 */

document.addEventListener("DOMContentLoaded", function () {
  // --- VARIABLES ---
  let selectedFiles = [];
  const inputImage = document.getElementById("imageInput");
  const miniPreviewGrid = document.getElementById("imagePreviewGrid");
  const inputCondition = document.getElementById("inputCondition");
  const inputName = document.getElementById("inputName");
  const imgError = document.getElementById("imgError");

  // --- CONDITION SELECTION ---
  window.selectCondition = function (element, value) {
    // Get element directly to ensure it exists
    const conditionInput = document.getElementById("inputCondition");
    if (!conditionInput) {
      console.error("[selectCondition] inputCondition element not found!");
      return;
    }
    conditionInput.value = value;
    console.log("[selectCondition] Set condition to:", value);

    // Reset all
    document.querySelectorAll(".condition-card").forEach((card) => {
      card.classList.remove(
        "border-indigo-500",
        "ring-2",
        "ring-indigo-500/20",
        "bg-indigo-50/10",
      );
      card.classList.add("border-slate-200", "bg-white");
      const tick = card.querySelector(".check-mark");
      if (tick) tick.remove();
    });

    // Activate selected
    element.classList.remove("border-slate-200", "bg-white");
    element.classList.add(
      "border-indigo-500",
      "ring-2",
      "ring-indigo-500/20",
      "bg-indigo-50/10",
    );

    // Add Premium Tick
    element.insertAdjacentHTML(
      "beforeend",
      `
        <div class="check-mark absolute -top-1 -right-1">
            <div class="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                <i class="fa-solid fa-check text-white text-[10px]"></i>
            </div>
        </div>
    `,
    );
  };

  // --- QUANTITY ADJUST ---
  window.adjustQuantity = function (change) {
    const input = document.getElementById("inputQuantity");
    let val = parseInt(input.value) || 0;
    val += change;
    if (val < 1) val = 1;
    input.value = val;
  };

  // --- PRICE FORMATTING ---
  // --- PRICE FORMATTING & CALCULATOR ---
  const displayPrice = document.getElementById("displayPrice");
  const realPrice = document.getElementById("realPrice");
  const feeCalculator = document.getElementById("feeCalculator");
  const displayPriceLabel = document.getElementById("displayPriceLabel");
  const totalFeeAmount = document.getElementById("totalFeeAmount");
  const feeAmount = document.getElementById("feeAmount");
  const paymentFeeAmount = document.getElementById("paymentFeeAmount");
  const taxAmount = document.getElementById("taxAmount");
  const sellerReceive = document.getElementById("sellerReceive");

  // Toggle Details
  window.toggleFeeDetails = function () {
    const details = document.getElementById("feeDetails");
    if (details) details.classList.toggle("hidden");
  };

  function updateFeeCalculator(price) {
    if (!feeCalculator) return;

    const feePercent = 5;
    const paymentFeePercent = 2.5;
    const taxPercent = 1.5;

    const fee = Math.round((price * feePercent) / 100);
    const paymentFee = Math.round((price * paymentFeePercent) / 100);
    const tax = Math.round((price * taxPercent) / 100);
    const totalFee = fee + paymentFee + tax;

    const receive = price - totalFee;

    if (displayPriceLabel)
      displayPriceLabel.textContent = price.toLocaleString("vi-VN") + "đ";

    // Summary
    if (totalFeeAmount)
      totalFeeAmount.textContent = "-" + totalFee.toLocaleString("vi-VN") + "đ";

    // Details
    if (feeAmount)
      feeAmount.textContent = "-" + fee.toLocaleString("vi-VN") + "đ";
    if (paymentFeeAmount)
      paymentFeeAmount.textContent =
        "-" + paymentFee.toLocaleString("vi-VN") + "đ";
    if (taxAmount)
      taxAmount.textContent = "-" + tax.toLocaleString("vi-VN") + "đ";

    if (sellerReceive)
      sellerReceive.textContent = receive.toLocaleString("vi-VN") + "đ";

    feeCalculator.classList.remove("hidden");
  }

  window.setPrice = function (val) {
    realPrice.value = val;
    displayPrice.value = new Intl.NumberFormat("vi-VN").format(val);
    updateFeeCalculator(val);
  };

  displayPrice.addEventListener("input", function (e) {
    let rawValue = this.value.replace(/\D/g, "");
    if (rawValue === "") {
      this.value = "";
      realPrice.value = "";
      if (feeCalculator) feeCalculator.classList.add("hidden");
    } else {
      let numberValue = parseInt(rawValue, 10);
      this.value = new Intl.NumberFormat("vi-VN").format(numberValue);
      realPrice.value = numberValue;
      updateFeeCalculator(numberValue);
    }
  });

  // --- CHAR COUNT ---
  inputName.addEventListener("input", function () {
    document.getElementById("nameCount").textContent = this.value.length;
  });

  // --- IMAGE LOGIC ---
  const uploadContainer = document.getElementById("uploadContainer");
  const imgCount = document.getElementById("imgCount");

  function updateFileInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f.file));
    inputImage.files = dt.files;

    // Update count
    if (imgCount) imgCount.textContent = selectedFiles.length;
  }

  function renderPreview() {
    // Clear old previews (keep the last element which is the upload button)
    const uploadBtn = uploadContainer.lastElementChild;
    while (uploadContainer.firstElementChild !== uploadBtn) {
      uploadContainer.removeChild(uploadContainer.firstElementChild);
    }

    selectedFiles.forEach((fileData, index) => {
      const div = document.createElement("div");
      // Shopee style: square, fixed size matching upload button
      div.className =
        "relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden group border border-slate-200 shadow-sm flex-shrink-0";
      div.innerHTML = `
            <img src="${fileData.dataUrl}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1">
                ${index === 0 ? '<span class="text-[10px] text-white font-bold bg-red-500 px-1.5 rounded-sm mb-1">Ảnh bìa</span>' : ""}
                <button type="button" onclick="removeImage(${index})" class="text-white hover:text-red-400">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
      // Insert before upload button
      uploadContainer.insertBefore(div, uploadBtn);
    });

    // Hide upload button if max files reached
    if (selectedFiles.length >= 9) {
      uploadBtn.classList.add("hidden");
    } else {
      uploadBtn.classList.remove("hidden");
    }
  }

  window.removeImage = function (index) {
    selectedFiles.splice(index, 1);
    updateFileInput();
    renderPreview();
  };

  inputImage.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 9 - selectedFiles.length;
    const toAdd = files.slice(0, remaining);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (ev) {
        selectedFiles.push({ file: file, dataUrl: ev.target.result });
        updateFileInput();
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
    this.value = "";
  });

  // --- CATEGORY PICKER ---
  initCategoryPicker();
});

/**
 * Initialize Category Picker
 * Requires: window.categoryData to be set from PHP
 */
function initCategoryPicker() {
  const categoryData = window.categoryData || [];

  const categoryTrigger = document.getElementById("categoryTrigger");
  const categoryPanel = document.getElementById("categoryPanel");
  const categoryDisplay = document.getElementById("categoryDisplay");
  const inputCategoryId = document.getElementById("inputCategoryId");
  const categoryArrow = document.getElementById("categoryArrow");
  const parentList = document.getElementById("parentCategoryList");
  const childList = document.getElementById("childCategoryList");
  const categoryContainer = document.getElementById("categoryContainer");

  if (!categoryTrigger || !categoryPanel) return;

  categoryTrigger.addEventListener("click", (e) => {
    categoryPanel.classList.toggle("hidden");
    categoryArrow.classList.toggle("rotate-180");
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!categoryContainer.contains(e.target)) {
      categoryPanel.classList.add("hidden");
      categoryArrow.classList.remove("rotate-180");
    }
  });

  function renderParents() {
    parentList.innerHTML = "";
    categoryData.forEach((parent) => {
      const div = document.createElement("div");
      const hasChildren = parent.children && parent.children.length > 0;
      div.className =
        "flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer group transition-all border-b border-slate-50";

      // Icon Logic
      let iconHtml = "";
      if (parent.image) {
        iconHtml = `<img src="${parent.image}" class="w-8 h-8 object-contain rounded-full bg-indigo-50 p-1">`;
      } else if (parent.icon) {
        iconHtml = `<div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center"><i class="fa-solid ${parent.icon} text-sm text-indigo-400"></i></div>`;
      } else {
        iconHtml = `<div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><i class="fa-solid fa-folder text-sm text-slate-400"></i></div>`;
      }

      // Show arrow only if has children, otherwise show check icon on hover
      const rightIcon = hasChildren
        ? '<i class="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-400"></i>'
        : '<i class="fa-solid fa-check text-xs text-indigo-500 opacity-0 group-hover:opacity-100"></i>';

      div.innerHTML = `
                ${iconHtml}
                <span class="flex-1 text-sm text-slate-700 group-hover:text-indigo-700 font-medium">${parent.name}</span>
                ${rightIcon}
            `;

      div.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Highlight selected parent
        Array.from(parentList.children).forEach((c) =>
          c.classList.remove("bg-indigo-50", "border-l-2", "border-indigo-500"),
        );
        div.classList.add("bg-indigo-50", "border-l-2", "border-indigo-500");

        // Check if parent has children
        if (hasChildren) {
          renderChildren(parent);
        } else {
          // No children - select parent directly
          categoryDisplay.value = parent.name;
          inputCategoryId.value = parent.id;
          categoryPanel.classList.add("hidden");
          categoryArrow.classList.remove("rotate-180");
        }
      });
      parentList.appendChild(div);
    });
  }

  function renderChildren(parent) {
    childList.innerHTML = "";

    // Header showing parent name
    const header = document.createElement("div");
    header.className =
      "px-2 py-2 text-xs font-bold text-indigo-600 border-b border-slate-100 mb-2";
    header.textContent = parent.name;
    childList.appendChild(header);

    parent.children.forEach((child) => {
      const div = document.createElement("div");
      div.className =
        "p-2.5 hover:text-indigo-600 hover:bg-white cursor-pointer rounded-lg text-sm text-slate-600 transition-colors flex items-center justify-between mb-1 group";
      div.innerHTML = `
                <span>${child.name}</span>
                <i class="fa-solid fa-check text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            `;

      div.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        categoryDisplay.value = `${parent.name} > ${child.name}`;
        inputCategoryId.value = child.id;
        categoryPanel.classList.add("hidden");
        categoryArrow.classList.remove("rotate-180");
      });
      childList.appendChild(div);
    });
  }

  renderParents();
}
