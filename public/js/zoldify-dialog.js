/**
 * Zoldify Custom Dialog System
 * Thay thế alert() và confirm() mặc định bằng giao diện đẹp
 * 
 * Cách dùng:
 * - ZDialog.alert('Thông báo', 'Nội dung thông báo');
 * - ZDialog.success('Thành công', 'Đã lưu thành công!');
 * - ZDialog.error('Lỗi', 'Có lỗi xảy ra!');
 * - ZDialog.warning('Cảnh báo', 'Bạn chắc chắn chứ?');
 * - ZDialog.confirm('Xác nhận', 'Bạn có chắc muốn xóa?').then(result => { ... });
 * - ZDialog.toast('Đã sao chép!', 'success');
 */

const ZDialog = (function () {
    'use strict';

    // ============================================================
    // CẤU HÌNH ICONS VÀ MÀU SẮC
    // ============================================================
    const CONFIG = {
        icons: {
            success: `<svg class="zdialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
            </svg>`,
            error: `<svg class="zdialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg class="zdialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg class="zdialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`,
            confirm: `<svg class="zdialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        },
        colors: {
            success: { bg: '#10B981', light: '#D1FAE5', text: '#065F46' },
            error: { bg: '#EF4444', light: '#FEE2E2', text: '#991B1B' },
            warning: { bg: '#F59E0B', light: '#FEF3C7', text: '#92400E' },
            info: { bg: '#2C67C8', light: '#DBEAFE', text: '#1E40AF' },
            confirm: { bg: '#2C67C8', light: '#DBEAFE', text: '#1E40AF' }
        },
        // Thời gian animation (ms)
        animationDuration: 200,
        // Thời gian toast tự động ẩn (ms)
        toastDuration: 3000
    };

    // ============================================================
    // TẠO STYLES (inject vào head 1 lần)
    // ============================================================
    function injectStyles() {
        if (document.getElementById('zdialog-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'zdialog-styles';
        styles.textContent = `
            /* ===== OVERLAY ===== */
            .zdialog-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 0;
                transition: opacity ${CONFIG.animationDuration}ms ease;
                padding: 16px;
            }
            .zdialog-overlay.show {
                opacity: 1;
            }

            /* ===== MODAL BOX ===== */
            .zdialog-box {
                background: white;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 400px;
                width: 100%;
                transform: scale(0.9) translateY(20px);
                transition: transform ${CONFIG.animationDuration}ms ease;
                overflow: hidden;
            }
            .zdialog-overlay.show .zdialog-box {
                transform: scale(1) translateY(0);
            }

            /* ===== HEADER với icon ===== */
            .zdialog-header {
                padding: 24px 24px 0;
                text-align: center;
            }
            .zdialog-icon-wrapper {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
            }
            .zdialog-icon {
                width: 32px;
                height: 32px;
            }
            .zdialog-title {
                font-size: 20px;
                font-weight: 700;
                color: #1F2937;
                margin: 0;
                font-family: 'Quicksand', sans-serif;
            }

            /* ===== BODY ===== */
            .zdialog-body {
                padding: 12px 24px 24px;
                text-align: center;
            }
            .zdialog-message {
                color: #6B7280;
                font-size: 15px;
                line-height: 1.6;
                margin: 0;
                font-family: 'Quicksand', sans-serif;
            }

            /* ===== FOOTER với buttons ===== */
            .zdialog-footer {
                padding: 0 24px 24px;
                display: flex;
                gap: 12px;
            }
            .zdialog-btn {
                flex: 1;
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                font-family: 'Quicksand', sans-serif;
            }
            .zdialog-btn:hover {
                transform: translateY(-1px);
            }
            .zdialog-btn:active {
                transform: translateY(0);
            }
            .zdialog-btn-cancel {
                background: #F3F4F6;
                color: #4B5563;
            }
            .zdialog-btn-cancel:hover {
                background: #E5E7EB;
            }
            .zdialog-btn-confirm {
                color: white;
                box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.2);
            }
            .zdialog-btn-confirm:hover {
                box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.25);
            }

            /* ===== SINGLE BUTTON (alert mode) ===== */
            .zdialog-footer.single-btn .zdialog-btn {
                max-width: 200px;
                margin: 0 auto;
            }

            /* ===== TOAST NOTIFICATIONS ===== */
            .ztoast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            @media (max-width: 640px) {
                .ztoast-container {
                    top: auto;
                    bottom: 80px; /* Tránh bottom nav */
                    right: 16px;
                    left: 16px;
                }
            }
            .ztoast {
                background: white;
                padding: 14px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                font-family: 'Quicksand', sans-serif;
            }
            @media (max-width: 640px) {
                .ztoast {
                    transform: translateY(120%);
                }
            }
            .ztoast.show {
                transform: translateX(0);
            }
            @media (max-width: 640px) {
                .ztoast.show {
                    transform: translateY(0);
                }
            }
            .ztoast-icon {
                width: 24px;
                height: 24px;
                flex-shrink: 0;
            }
            .ztoast-message {
                font-size: 14px;
                font-weight: 600;
                color: #1F2937;
            }
            .ztoast-close {
                margin-left: auto;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: #9CA3AF;
                transition: color 0.2s;
            }
            .ztoast-close:hover {
                color: #4B5563;
            }

            /* ===== LOADING INDICATOR ===== */
            .zdialog-loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: zdialog-spin 0.8s linear infinite;
            }
            @keyframes zdialog-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styles);
    }

    // ============================================================
    // TẠO TOAST CONTAINER (nếu chưa có)
    // ============================================================
    function getToastContainer() {
        let container = document.querySelector('.ztoast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'ztoast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // ============================================================
    // HÀM CHÍNH: TẠO DIALOG
    // ============================================================
    function createDialog(options) {
        injectStyles();

        return new Promise((resolve) => {
            const {
                type = 'info',
                title = '',
                message = '',
                confirmText = 'Đồng ý',
                cancelText = 'Hủy',
                showCancel = false,
                onConfirm = null,
                onCancel = null
            } = options;

            const color = CONFIG.colors[type] || CONFIG.colors.info;
            const icon = CONFIG.icons[type] || CONFIG.icons.info;

            // Tạo overlay
            const overlay = document.createElement('div');
            overlay.className = 'zdialog-overlay';
            overlay.innerHTML = `
                <div class="zdialog-box" role="dialog" aria-modal="true">
                    <div class="zdialog-header">
                        <div class="zdialog-icon-wrapper" style="background: ${color.light}; color: ${color.bg}">
                            ${icon}
                        </div>
                        <h3 class="zdialog-title">${escapeHtml(title)}</h3>
                    </div>
                    <div class="zdialog-body">
                        <p class="zdialog-message">${escapeHtml(message)}</p>
                    </div>
                    <div class="zdialog-footer ${showCancel ? '' : 'single-btn'}">
                        ${showCancel ? `<button class="zdialog-btn zdialog-btn-cancel">${escapeHtml(cancelText)}</button>` : ''}
                        <button class="zdialog-btn zdialog-btn-confirm" style="background: ${color.bg}">
                            ${escapeHtml(confirmText)}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animation show
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });

            // Xử lý click
            const confirmBtn = overlay.querySelector('.zdialog-btn-confirm');
            const cancelBtn = overlay.querySelector('.zdialog-btn-cancel');

            function closeDialog(result) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    if (result && onConfirm) onConfirm();
                    if (!result && onCancel) onCancel();
                    resolve(result);
                }, CONFIG.animationDuration);
            }

            confirmBtn.addEventListener('click', () => closeDialog(true));

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => closeDialog(false));
            }

            // Đóng khi click overlay (chỉ cho alert, không cho confirm)
            if (!showCancel) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) closeDialog(true);
                });
            }

            // Xử lý phím Enter và Escape
            function handleKeydown(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    closeDialog(true);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDialog(showCancel ? false : true);
                }
            }
            document.addEventListener('keydown', handleKeydown);

            // Cleanup keydown listener khi dialog đóng
            const originalResolve = resolve;
            resolve = (result) => {
                document.removeEventListener('keydown', handleKeydown);
                originalResolve(result);
            };

            // Focus vào confirm button
            confirmBtn.focus();
        });
    }

    // ============================================================
    // HELPER: Escape HTML để tránh XSS
    // ============================================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    // PUBLIC API
    // ============================================================
    return {
        /**
         * Hiển thị thông báo info (thay thế alert)
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @returns {Promise<boolean>}
         */
        alert: function (title, message = '') {
            return createDialog({ type: 'info', title, message, confirmText: 'Đã hiểu' });
        },

        /**
         * Hiển thị thông báo thành công
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @returns {Promise<boolean>}
         */
        success: function (title, message = '') {
            return createDialog({ type: 'success', title, message, confirmText: 'Tuyệt vời!' });
        },

        /**
         * Hiển thị thông báo lỗi
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @returns {Promise<boolean>}
         */
        error: function (title, message = '') {
            return createDialog({ type: 'error', title, message, confirmText: 'Đã hiểu' });
        },

        /**
         * Hiển thị cảnh báo
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @returns {Promise<boolean>}
         */
        warning: function (title, message = '') {
            return createDialog({ type: 'warning', title, message, confirmText: 'Đã hiểu' });
        },

        /**
         * Hiển thị hộp thoại xác nhận (thay thế confirm)
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @param {Object} options - Tùy chọn (confirmText, cancelText)
         * @returns {Promise<boolean>} - true nếu đồng ý, false nếu hủy
         */
        confirm: function (title, message = '', options = {}) {
            return createDialog({
                type: 'confirm',
                title,
                message,
                showCancel: true,
                confirmText: options.confirmText || 'Đồng ý',
                cancelText: options.cancelText || 'Hủy'
            });
        },

        /**
         * Hiển thị confirm với nút xóa (màu đỏ, nguy hiểm)
         * @param {string} title - Tiêu đề
         * @param {string} message - Nội dung
         * @returns {Promise<boolean>}
         */
        confirmDelete: function (title, message = '') {
            return createDialog({
                type: 'error',
                title,
                message,
                showCancel: true,
                confirmText: 'Xóa',
                cancelText: 'Hủy'
            });
        },

        /**
         * Hiển thị toast notification (thông báo ngắn, tự động ẩn)
         * @param {string} message - Nội dung
         * @param {string} type - Loại: 'success', 'error', 'warning', 'info'
         * @param {number} duration - Thời gian hiển thị (ms), mặc định 3000
         */
        toast: function (message, type = 'success', duration = CONFIG.toastDuration) {
            injectStyles();

            const container = getToastContainer();
            const color = CONFIG.colors[type] || CONFIG.colors.success;
            const icon = CONFIG.icons[type] || CONFIG.icons.success;

            const toast = document.createElement('div');
            toast.className = 'ztoast';
            toast.innerHTML = `
                <span class="ztoast-icon" style="color: ${color.bg}">${icon}</span>
                <span class="ztoast-message">${escapeHtml(message)}</span>
                <button class="ztoast-close" aria-label="Đóng">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;

            container.appendChild(toast);

            // Animation show
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Tự động ẩn
            const autoHide = setTimeout(() => removeToast(toast), duration);

            // Click để đóng
            toast.querySelector('.ztoast-close').addEventListener('click', () => {
                clearTimeout(autoHide);
                removeToast(toast);
            });
        },

        /**
         * Hiển thị loading dialog
         * @param {string} message - Nội dung đang load
         * @returns {Function} - Hàm để đóng loading
         */
        loading: function (message = 'Đang xử lý...') {
            injectStyles();

            const overlay = document.createElement('div');
            overlay.className = 'zdialog-overlay';
            overlay.innerHTML = `
                <div class="zdialog-box" style="padding: 32px; text-align: center;">
                    <div class="zdialog-loading" style="width: 40px; height: 40px; border-width: 3px; border-color: #E5E7EB; border-top-color: #2C67C8; margin: 0 auto 16px;"></div>
                    <p class="zdialog-message">${escapeHtml(message)}</p>
                </div>
            `;

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('show'));

            // Return hàm để đóng loading
            return function close() {
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), CONFIG.animationDuration);
            };
        }
    };

    // Helper function for toast removal
    function removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
})();

// ============================================================
// GHI ĐÈ alert() và confirm() TOÀN CỤC (Tùy chọn)
// Uncomment nếu muốn tự động thay thế tất cả alert/confirm
// ============================================================
// window._originalAlert = window.alert;
// window._originalConfirm = window.confirm;
// 
// window.alert = function(message) {
//     ZDialog.alert('Thông báo', message);
// };
// 
// window.confirm = function(message) {
//     console.warn('confirm() đã được gọi nhưng ZDialog.confirm() trả về Promise. Vui lòng sử dụng ZDialog.confirm() trực tiếp.');
//     return true;
// };
