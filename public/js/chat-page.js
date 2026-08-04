/**
 * Chat Page Handler
 * Xử lý giao diện chat với Socket.IO
 */

(function () {
  "use strict";

  // ============ DEBUG HELPER - Chỉ log ở development ============
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local") ||
    window.location.hostname.endsWith(".test");
  const debug = {
    log: (...args) => isDev && console.log(...args),
    warn: (...args) => isDev && console.warn(...args),
    error: (...args) => console.error(...args), // Errors luôn log
  };

  // ============ LẤY CONFIG TỪ HTML ============
  const chatContainer = document.getElementById("chat-container");
  if (!chatContainer) return; // Không phải trang chat

  const currentUserId = parseInt(chatContainer.dataset.userId) || null;
  const activePartnerId = parseInt(chatContainer.dataset.partnerId) || null;
  const partnerName = chatContainer.dataset.partnerName || "";

  const messagesContainer = document.getElementById("messages-container");
  const messageForm = document.querySelector('form[action="/chat/send"]');
  const messageInput = document.querySelector('input[name="content"]');
  const imageBtn = document.querySelector(".fa-image")?.closest("button");
  const fileBtn = document.querySelector(".fa-paperclip")?.closest("button");
  // ============ ONLINE STATUS ============
  let onlineUsersList = []; // Danh sách user đang online

  // ============ KHỞI TẠO ============
  document.addEventListener("DOMContentLoaded", function () {
    // Scroll to bottom
    scrollToBottom();

    // Set current chat user for Socket
    if (window.chatSocket && activePartnerId) {
      window.chatSocket.setCurrentChatUser(activePartnerId);
    }

    // Đăng ký callback nhận tin nhắn mới
    if (window.chatSocket) {
      window.chatSocket.onNewMessage(handleNewMessage);
    }

    // Setup file upload buttons
    setupFileUpload();

    // Setup emoji picker
    setupEmojiPicker();

    // Setup online status listener
    setupOnlineStatus();
  });

  // ============ XỬ LÝ GỬI TIN NHẮN ============
  if (messageForm) {
    messageForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const content = messageInput.value.trim();
      if (!content) return;

      // Tạo message object đầy đủ cho optimistic update
      const optimisticMessage = {
        content: content,
        sender_id: currentUserId,
        receiver_id: activePartnerId,
        created_at: new Date().toISOString(),
      };

      // Optimistic update - thêm vào UI ngay
      appendMessage(optimisticMessage, true);

      // Cập nhật sidebar ngay lập tức (optimistic)
      updateSidebarWithNewMessage(optimisticMessage, "sent");

      // Clear input ngay
      messageInput.value = "";
      messageInput.focus();

      // Gửi qua Socket.IO nếu connected
      if (window.chatSocket && window.chatSocket.isConnected) {
        window.chatSocket.sendMessage(activePartnerId, content);
        debug.log("[ChatPage] Sent via Socket.IO");

        // Báo ngừng typing
        window.chatSocket.sendTyping(activePartnerId, false);
      } else {
        // Fallback: Gửi qua AJAX (không reload trang)
        debug.log("[ChatPage] Socket not connected, using AJAX fallback");
        try {
          const formData = new FormData();
          formData.append("receiver_id", activePartnerId);
          formData.append("content", content);

          const response = await fetch("/api/chat/send.php", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            debug.error("[ChatPage] AJAX send failed");
          }
        } catch (error) {
          debug.error("[ChatPage] AJAX error:", error);
        }
      }
    });

    // ============ TYPING INDICATOR ============
    let typingTimer = null;

    messageInput.addEventListener("input", function () {
      if (!window.chatSocket || !window.chatSocket.isConnected) return;

      window.chatSocket.sendTyping(activePartnerId, true);

      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        window.chatSocket.sendTyping(activePartnerId, false);
      }, 2000);
    });

    // Enter to send, Shift+Enter for new line
    messageInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        messageForm.dispatchEvent(new Event("submit"));
      }
    });
  }

  // ============ FILE UPLOAD ============
  function setupFileUpload() {
    // Tạo hidden input cho file
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    fileInput.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";
    document.body.appendChild(fileInput);

    // Image button - chỉ cho phép ảnh
    if (imageBtn) {
      imageBtn.addEventListener("click", () => {
        fileInput.accept = "image/*";
        fileInput.click();
      });
    }

    // File button - cho phép tất cả file
    if (fileBtn) {
      fileBtn.addEventListener("click", () => {
        fileInput.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";
        fileInput.click();
      });
    }

    // Handle file selection
    fileInput.addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;

      // Validate size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File quá lớn! Tối đa 10MB");
        return;
      }

      try {
        // Show loading state
        if (messageInput) {
          messageInput.placeholder = "Đang tải file...";
          messageInput.disabled = true;
        }

        // Upload và gửi
        await window.chatSocket.sendFile(activePartnerId, file);

        // Optimistic update với attachment
        const isImage = file.type.startsWith("image/");
        appendMessage(
          {
            content: "",
            sender_id: currentUserId,
            created_at: new Date().toISOString(),
            has_attachment: true,
            attachment: {
              name: file.name,
              path: URL.createObjectURL(file), // Temporary URL
              type: file.type,
              is_image: isImage,
            },
          },
          true,
        );
      } catch (error) {
        alert("Lỗi tải file: " + error.message);
      } finally {
        // Reset
        this.value = "";
        if (messageInput) {
          messageInput.placeholder = "Nhập tin nhắn...";
          messageInput.disabled = false;
        }
      }
    });
  }

  // ============ EMOJI PICKER ============
  function setupEmojiPicker() {
    const emojiBtn = document.getElementById("emoji-btn");
    const emojiPicker = document.getElementById("emoji-picker");

    if (!emojiBtn || !emojiPicker) return;

    // Toggle emoji picker
    emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle("hidden");
    });

    // Click emoji to insert
    emojiPicker.querySelectorAll(".emoji-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const emoji = btn.textContent;
        if (messageInput) {
          // Insert emoji at cursor position
          const start = messageInput.selectionStart;
          const end = messageInput.selectionEnd;
          const text = messageInput.value;
          messageInput.value =
            text.substring(0, start) + emoji + text.substring(end);
          messageInput.focus();
          messageInput.selectionStart = messageInput.selectionEnd =
            start + emoji.length;
        }
        emojiPicker.classList.add("hidden");
      });
    });
    // Close picker when clicking outside
    document.addEventListener("click", (e) => {
      if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add("hidden");
      }
    });
  }

  // ============ NHẬN TIN NHẮN MỚI ============
  function handleNewMessage(message, type) {
    debug.log("[ChatPage] New message callback:", message, type);

    // Với tin nhắn 'sent': đã được optimistic update xử lý ở form submit
    // Chỉ cập nhật sidebar cho tin nhắn 'received' (từ người khác)
    if (type === "received") {
      updateSidebarWithNewMessage(message, type);

      // Append message vào chat area NẾU đang chat với người gửi
      if (message.sender_id == activePartnerId) {
        appendMessage(message, false);

        // Phát âm thanh thông báo nếu tab không active
        if (!document.hasFocus()) {
          playNotificationSound();
        }
      } else {
        // Không đang chat với người gửi -> chỉ cần cập nhật sidebar (đã làm ở trên)
        // và phát âm thanh thông báo
        playNotificationSound();
      }
    }
    // type === 'sent' đã được xử lý bởi optimistic update, không cần làm gì thêm
  }

  /**
   * Phát âm thanh thông báo tin nhắn mới
   */
  function playNotificationSound() {
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Browser chặn autoplay - bỏ qua
      });
    } catch (e) {
      debug.warn("[ChatPage] Cannot play notification sound");
    }
  }

  /**
   * Cập nhật sidebar khi có tin nhắn mới
   * - Di chuyển conversation lên đầu
   * - Cập nhật preview tin nhắn
   * - Cập nhật thời gian
   */
  function updateSidebarWithNewMessage(message, type) {
    const partnerId = type === "sent" ? message.receiver_id : message.sender_id;
    const sidebar = document.getElementById("chat-sidebar");
    if (!sidebar) {
      debug.log("[Sidebar] Sidebar not found");
      return;
    }

    const conversationList = sidebar.querySelector(".overflow-y-auto");
    if (!conversationList) {
      debug.log("[Sidebar] Conversation list not found");
      return;
    }

    // Tìm conversation hiện có - dùng class chat-conversation-link để tìm chính xác hơn
    // Tìm tất cả link rồi lọc theo partner_id trong data attribute hoặc href
    let existingLink = null;
    const allLinks = conversationList.querySelectorAll(
      "a.chat-conversation-link",
    );
    allLinks.forEach((link) => {
      if (link.getAttribute("href") === `/chat?user_id=${partnerId}`) {
        existingLink = link;
      }
    });

    debug.log(
      "[Sidebar] Looking for partner:",
      partnerId,
      "Found:",
      !!existingLink,
    );

    // Format thời gian
    const now = new Date();
    const timeStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    // Nội dung preview
    const previewContent =
      type === "sent" ? `Bạn: ${message.content}` : message.content;
    const truncatedContent =
      previewContent.length > 30
        ? previewContent.substring(0, 30) + "..."
        : previewContent;

    if (existingLink) {
      // Tìm span thời gian - nằm trong div có class text-[10px] và text-gray-400
      const timeEl = existingLink.querySelector("span.text-\\[10px\\]");
      // Fallback: tìm span có pattern HH:MM
      let timeElFallback = null;
      if (!timeEl) {
        existingLink.querySelectorAll("span").forEach((span) => {
          if (/^\d{2}:\d{2}$/.test(span.textContent.trim())) {
            timeElFallback = span;
          }
        });
      }

      // Tìm preview text - là thẻ <p> trong conversation item
      const previewEl = existingLink.querySelector("p");

      const actualTimeEl = timeEl || timeElFallback;
      debug.log(
        "[Sidebar] TimeEl found:",
        !!actualTimeEl,
        "PreviewEl found:",
        !!previewEl,
      );

      if (actualTimeEl) actualTimeEl.textContent = timeStr;
      if (previewEl) {
        previewEl.textContent = truncatedContent;
        // Highlight nếu là tin nhắn nhận (chưa đọc) và không phải conversation đang active
        if (type !== "sent" && partnerId != activePartnerId) {
          previewEl.classList.add("font-bold");
        } else {
          // Xóa bold nếu là tin mình gửi hoặc đang active conversation này
          previewEl.classList.remove("font-bold");
        }
      }

      // Di chuyển lên đầu danh sách
      conversationList.insertBefore(existingLink, conversationList.firstChild);
      debug.log("[Sidebar] Moved to top, updated preview:", truncatedContent);
    } else {
      debug.log(
        "[Sidebar] Conversation not found, might need page reload for new conversation",
      );
    }
  }

  // ============ THÊM TIN NHẮN VÀO UI ============
  function appendMessage(message, isMe) {
    if (!messagesContainer) return;

    // Xóa empty state nếu có
    const emptyState = messagesContainer.querySelector(".empty-chat-state");
    if (emptyState) emptyState.remove();

    const time = new Date(message.created_at);
    const timeStr =
      time.getHours().toString().padStart(2, "0") +
      ":" +
      time.getMinutes().toString().padStart(2, "0");

    const partnerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=random&size=64`;

    // Build message content
    let contentHtml = "";

    if (message.attachment) {
      const att = message.attachment;
      if (att.is_image) {
        // Hiển thị ảnh
        contentHtml = `
                    <a href="${att.path}" target="_blank" class="block">
                        <img src="${att.path}" alt="${escapeHtml(att.name)}" 
                             class="max-w-full max-h-[200px] rounded-lg cursor-pointer hover:opacity-90">
                    </a>
                `;
      } else {
        // Hiển thị file download link
        contentHtml = `
                    <a href="${att.path}" download="${escapeHtml(att.name)}" 
                       class="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <i class="fa-solid fa-file text-blue-500"></i>
                        <span class="text-sm truncate max-w-[150px]">${escapeHtml(att.name)}</span>
                        <i class="fa-solid fa-download text-gray-400 text-xs"></i>
                    </a>
                `;
      }

      // Add caption if exists
      if (message.content && message.content !== "[File đính kèm]") {
        contentHtml += `<p class="mt-2">${escapeHtml(message.content)}</p>`;
      }
    } else {
      contentHtml = escapeHtml(message.content);
    }

    const messageEl = document.createElement("div");
    messageEl.className = `flex w-full ${isMe ? "justify-end" : "justify-start"} group animate-fade-in-up`;
    messageEl.innerHTML = `
            <div class="flex max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2">
                ${!isMe ? `<img src="${partnerAvatar}" class="w-8 h-8 rounded-full object-cover shadow-sm mb-1 flex-shrink-0">` : ""}
                <div class="flex flex-col ${isMe ? "items-end" : "items-start"}">
                    <div class="relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words font-normal
                        ${
                          isMe
                            ? "bg-[#2C67C8] text-white rounded-2xl rounded-tr-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm"
                        }">
                        ${contentHtml}
                    </div>
                    <span class="text-[10px] text-gray-400 mt-1 px-1">${timeStr}</span>
                </div>
            </div>
        `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
  }

  // ============ ONLINE STATUS ============
  function setupOnlineStatus() {
    // Cập nhật ngay lập tức từ chatSocket nếu có data
    syncOnlineUsers();

    // Polling: Kiểm tra và cập nhật mỗi 1 giây
    // Lý do dùng polling: chat-socket.js đã lắng nghe socket events và cập nhật onlineUserIds
    // Ta chỉ cần đọc từ đó thay vì đăng ký thêm listeners (gây conflict)
    setInterval(() => {
      syncOnlineUsers();
    }, 1000);
  }

  /**
   * Đồng bộ danh sách online từ chatSocket và cập nhật UI
   */
  function syncOnlineUsers() {
    if (window.chatSocket && window.chatSocket.onlineUserIds) {
      const newOnlineList = window.chatSocket.onlineUserIds;

      // Chỉ update UI nếu danh sách thay đổi
      if (JSON.stringify(newOnlineList) !== JSON.stringify(onlineUsersList)) {
        debug.log("[OnlineStatus] Synced online users:", newOnlineList);
        onlineUsersList = [...newOnlineList];
        updatePartnerOnlineStatus();
      }
    }
  }

  /**
   * Cập nhật UI hiển thị trạng thái online của partner
   */
  function updatePartnerOnlineStatus(lastSeen = null) {
    if (!activePartnerId) return;

    const isOnline = onlineUsersList.includes(activePartnerId.toString());

    // Tìm các element cần update
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");

    if (!statusDot || !statusText) return;

    if (isOnline) {
      // Online: chấm xanh + text "Đang hoạt động"
      statusDot.className =
        "status-dot absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white";
      statusText.className =
        "status-text text-xs text-green-600 font-medium flex items-center gap-1";
      statusText.textContent = "Đang hoạt động";
    } else {
      // Offline: chấm xám + text "X phút/giờ trước"
      statusDot.className =
        "status-dot absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white";
      statusText.className =
        "status-text text-xs text-gray-500 font-medium flex items-center gap-1";

      // Lấy last_seen từ tham số hoặc data attribute
      let lastSeenValue = lastSeen;
      if (!lastSeenValue) {
        const lastSeenData = document.querySelector("[data-partner-last-seen]")
          ?.dataset.partnerLastSeen;
        lastSeenValue = lastSeenData;
      }

      if (lastSeenValue && lastSeenValue !== "") {
        statusText.textContent = formatLastSeen(lastSeenValue);
      } else {
        statusText.textContent = "Không hoạt động";
      }
    }
  }

  /**
   * Format thời gian "X phút/giờ/ngày trước"
   */
  function formatLastSeen(dateString) {
    if (!dateString) return "Không hoạt động";

    const lastSeen = new Date(dateString);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Vừa mới truy cập";
    } else if (diffMins < 60) {
      return `Hoạt động ${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `Hoạt động ${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `Hoạt động ${diffDays} ngày trước`;
    } else {
      return `Hoạt động ${lastSeen.toLocaleDateString("vi-VN")}`;
    }
  }

  // ============ HELPERS ============
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
