/**
 * Zoldify Notification Toast
 * Hiển thị popup thông báo tin nhắn mới
 * 
 * Features:
 * - Toast hiển thị góc dưới phải
 * - Max 3 toast cùng lúc
 * - Âm thanh notification
 * - Tự động ẩn sau 8 giây
 * - Click để mở chat
 * - Nút X để dismiss
 */

class NotificationToast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 3;
        this.autoHideDelay = 8000; // 8 giây
        this.notificationSound = null;
        
        this._init();
    }
    
    /**
     * Khởi tạo container và audio
     */
    _init() {
        // Tạo container cho toasts
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
        
        // Preload âm thanh
        this.notificationSound = new Audio('/sounds/notification.mp3');
        this.notificationSound.volume = 0.5;
        
        // Inject CSS nếu chưa có
        this._injectStyles();
    }
    
    /**
     * Inject CSS styles
     */
    _injectStyles() {
        if (document.getElementById('toast-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-item {
                pointer-events: auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1);
                padding: 16px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid #2C67C8;
                transform-origin: right center;
            }
            
            .toast-item.hiding {
                animation: slideOutRight 0.3s ease-in forwards;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
            
            .toast-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                flex-shrink: 0;
            }
            
            .toast-content {
                flex: 1;
                min-width: 0;
            }
            
            .toast-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .toast-sender {
                font-weight: 600;
                color: #1f2937;
                font-size: 14px;
            }
            
            .toast-time {
                font-size: 11px;
                color: #9ca3af;
            }
            
            .toast-message {
                color: #6b7280;
                font-size: 13px;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .toast-actions {
                display: flex;
                gap: 8px;
                margin-top: 10px;
            }
            
            .toast-btn {
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
            }
            
            .toast-btn-primary {
                background: #2C67C8;
                color: white;
            }
            
            .toast-btn-primary:hover {
                background: #1e4fa8;
            }
            
            .toast-btn-secondary {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .toast-btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .toast-close {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #f3f4f6;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #9ca3af;
                transition: all 0.2s;
            }
            
            .toast-close:hover {
                background: #e5e7eb;
                color: #6b7280;
            }
        `;
        document.head.appendChild(styles);
    }
    
    /**
     * Hiển thị toast notification
     * @param {Object} data - Dữ liệu tin nhắn
     */
    show(data) {
        const { senderId, senderName, senderAvatar, message, messageId } = data;
        
        // Giới hạn max toast
        while (this.toasts.length >= this.maxToasts) {
            this._removeToast(this.toasts[0]);
        }
        
        // Tạo toast element
        const toastId = `toast-${Date.now()}`;
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = 'toast-item relative';
        
        // Avatar URL
        const avatarUrl = senderAvatar 
            ? `/uploads/avatars/${senderAvatar}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=2C67C8&color=fff&size=96`;
        
        toast.innerHTML = `
            <button class="toast-close" data-action="close">&times;</button>
            <img src="${avatarUrl}" alt="${this._escapeHtml(senderName)}" class="toast-avatar">
            <div class="toast-content">
                <div class="toast-header">
                    <span class="toast-sender">${this._escapeHtml(senderName)}</span>
                    <span class="toast-time">Vừa xong</span>
                </div>
                <p class="toast-message">${this._escapeHtml(message)}</p>
                <div class="toast-actions">
                    <button class="toast-btn toast-btn-primary" data-action="open">Trả lời</button>
                    <button class="toast-btn toast-btn-secondary" data-action="read">Đánh dấu đã đọc</button>
                </div>
            </div>
        `;
        
        // Event listeners
        toast.querySelector('[data-action="close"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this._removeToast(toast);
        });
        
        toast.querySelector('[data-action="open"]').addEventListener('click', () => {
            window.location.href = `/chat?user_id=${senderId}`;
        });
        
        toast.querySelector('[data-action="read"]').addEventListener('click', (e) => {
            e.stopPropagation();
            // Đánh dấu đã đọc qua socket
            if (window.chatSocket && messageId) {
                window.chatSocket.markAsRead([messageId]);
            }
            this._removeToast(toast);
        });
        
        // Thêm vào container
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // Phát âm thanh
        this._playSound();
        
        // Auto hide sau 8 giây
        setTimeout(() => {
            if (document.getElementById(toastId)) {
                this._removeToast(toast);
            }
        }, this.autoHideDelay);
    }
    
    /**
     * Xóa toast với animation
     */
    _removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('hiding');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }
    
    /**
     * Xóa tất cả toasts
     */
    dismissAll() {
        [...this.toasts].forEach(toast => this._removeToast(toast));
    }
    
    /**
     * Phát âm thanh notification
     */
    _playSound() {
        try {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(() => {
                // Browser chặn autoplay - bỏ qua
            });
        } catch (e) {
            console.warn('[Toast] Cannot play sound');
        }
    }
    
    /**
     * Escape HTML để tránh XSS
     */
    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Tạo instance global
window.notificationToast = new NotificationToast();
