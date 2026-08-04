<?php
use App\Helpers\TimeHelper;
use App\Helpers\ImageHelper;
include __DIR__ . '/../partials/head.php';
include __DIR__ . '/../partials/header.php';
?>

<main class="bg-gray-100 min-h-screen pb-20 md:pb-10 flex flex-col">
    <div class="max-w-[1000px] w-full mx-auto px-4 flex-1 flex flex-col pt-6">

        <div id="chat-container"
            class="bg-white rounded-sm shadow-sm flex overflow-hidden h-[calc(100vh-180px)] md:h-[600px] border border-gray-200"
            data-user-id="<?= $currentUserId ?>" data-partner-id="<?= $activePartner['id'] ?? '' ?>"
            data-partner-name="<?= htmlspecialchars($activePartner['full_name'] ?? '') ?>">
            <!-- Sidebar - Full width on mobile, 1/3 on desktop -->
            <div id="chat-sidebar"
                class="w-full md:w-1/3 border-r border-gray-200 flex flex-col <?= $activePartner ? 'hidden md:flex' : 'flex' ?>">
                <div class="p-4 border-b border-gray-200 bg-gray-50">
                    <div class="relative">
                        <input type="text" placeholder="Tìm kiếm tin nhắn..."
                            class="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:border-[#2C67C8]">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <?php if (empty($conversations)): ?>
                        <div class="p-4 text-center text-gray-400 text-xs">Chưa có tin nhắn nào.</div>
                    <?php else: ?>
                        <?php foreach ($conversations as $conv): ?>
                            <?php
                            // Dữ liệu từ Model trả về dạng flat, không phải nested array
                            $partnerId = $conv['partner_id'] ?? null;
                            $partnerName = $conv['partner_name'] ?? 'Người dùng';
                            $partnerAvatar = $conv['partner_avatar'] ?? null;
                            $lastMessageContent = $conv['last_message_content'] ?? '';
                            $lastMessageAt = $conv['last_message_at'] ?? null;
                            $lastMessageSenderId = $conv['last_message_sender_id'] ?? null;
                            $lastMessageIsRead = $conv['last_message_is_read'] ?? 1;

                            // Bỏ qua conversation không hợp lệ
                            if ($partnerId === null)
                                continue;

                            $isActive = ($activePartner && ($activePartner['id'] ?? null) == $partnerId);
                            ?>
                            <a href="/chat?user_id=<?= $partnerId ?>" class="block chat-conversation-link">
                                <div
                                    class="p-3 border-b border-gray-100 flex gap-3 hover:bg-gray-50 cursor-pointer <?= $isActive ? 'bg-blue-50/50 border-l-4 border-l-[#2C67C8]' : '' ?>">
                                    <div class="relative">
                    <?php
                    // Helper function for avatar URL inside loop is tricky with replace_file_content if we want to extract variable
                    // We will inline the logic using ImageHelper
                    ?>
                                        <?php
                                        $pAvatarUrl = !empty($partnerAvatar)
                                            ? ImageHelper::url('uploads/avatars/' . $partnerAvatar)
                                            : 'https://ui-avatars.com/api/?name=' . urlencode($partnerName) . '&background=random';
                                        ?>
                                        <img src="<?= htmlspecialchars($pAvatarUrl) ?>"
                                            class="w-10 h-10 rounded-full object-cover">
                                        <!-- Online status - sẽ được JS cập nhật -->
                                        <span
                                            class="partner-status-dot absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white"
                                            data-partner-id="<?= $partnerId ?>"></span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex justify-between items-baseline mb-1">
                                            <h4 class="text-sm font-medium text-gray-800 truncate">
                                                <?= htmlspecialchars($partnerName) ?>
                                            </h4>
                                            <span class="text-[10px] text-gray-400">
                                                <?= $lastMessageAt ? TimeHelper::formatTime($lastMessageAt) : '' ?>
                                            </span>
                                        </div>
                                        <p
                                            class="text-xs text-gray-500 truncate <?= !$lastMessageIsRead && $lastMessageSenderId != $currentUserId ? 'font-bold' : '' ?>">
                                            <?= $lastMessageSenderId == $currentUserId ? 'Bạn: ' : '' ?>
                                            <?= htmlspecialchars($lastMessageContent) ?>
                                        </p>
                                    </div>
                                </div>
                            </a>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Chat Area - Full width on mobile, 2/3 on desktop -->
            <div id="chat-main"
                class="w-full md:w-2/3 <?= $activePartner ? 'flex' : 'hidden md:flex' ?> flex-col bg-slate-50 relative">
                <?php if ($activePartner): ?>
                    <!-- Header -->
                    <div class="px-3 md:px-6 py-3 md:py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10"
                        data-partner-last-seen="<?= htmlspecialchars($activePartner['last_seen'] ?? '') ?>">
                        <div class="flex items-center gap-2 md:gap-4">
                            <!-- Back button - Chỉ hiện trên mobile -->
                            <a href="/chat"
                                class="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                                <i class="fa-solid fa-arrow-left"></i>
                            </a>
                            <div class="relative">
                                <?php
                                $activeAvatarUrl = !empty($activePartner['avatar'])
                                    ? ImageHelper::url('uploads/avatars/' . $activePartner['avatar'])
                                    : 'https://ui-avatars.com/api/?name=' . urlencode($activePartner['full_name']) . '&background=0D8ABC&color=fff&size=128';
                                ?>
                                <img src="<?= htmlspecialchars($activeAvatarUrl) ?>"
                                    class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm">
                                <!-- Status dot - sẽ được JS cập nhật -->
                                <span
                                    class="status-dot absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white"></span>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-800 text-base">
                                    <?= htmlspecialchars($activePartner['full_name']) ?>
                                </h3>
                                <!-- Status text - sẽ được JS cập nhật -->
                                <span class="status-text text-xs text-gray-500 font-medium flex items-center gap-1">
                                    Đang tải...
                                </span>
                            </div>
                        </div>
                        <!-- Icons - nằm bên phải header -->
                        <div class="flex items-center gap-3">
                            <a href="/shop?id=<?= $activePartner['id'] ?>"
                                class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                title="Xem Shop">
                                <i class="fa-solid fa-store"></i>
                            </a>
                            <button
                                class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">
                                <i class="fa-solid fa-circle-info"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Messages -->
                    <!-- Updated container with proper scrolling and padding -->
                    <div id="messages-container" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth">
                        <?php if (empty($messages)): ?>
                            <div class="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <i class="fa-solid fa-hands-clapping text-3xl text-gray-300"></i>
                                </div>
                                <p class="text-sm">Bắt đầu cuộc trò chuyện với <span
                                        class="font-bold text-gray-600"><?= htmlspecialchars($activePartner['full_name']) ?></span>
                                </p>
                                <p class="text-xs mt-1">Gửi lời chào để kết nối ngay!</p>
                            </div>
                        <?php else: ?>
                            <?php foreach ($messages as $msg):
                                $isMe = ($msg['sender_id'] == $currentUserId);
                                ?>
                                <div class="flex w-full <?= $isMe ? 'justify-end' : 'justify-start' ?> group animate-fade-in-up">
                                    <div class="flex max-w-[70%] <?= $isMe ? 'flex-row-reverse' : 'flex-row' ?> items-end gap-2">
                                        <!-- Avatar for other user -->
                                        <?php if (!$isMe): ?>
                                            <?php
                                            $msgAvatarUrl = !empty($activePartner['avatar'])
                                                ? ImageHelper::url('uploads/avatars/' . $activePartner['avatar'])
                                                : 'https://ui-avatars.com/api/?name=' . urlencode($activePartner['full_name']) . '&background=random&size=64';
                                            ?>
                                            <img src="<?= htmlspecialchars($msgAvatarUrl) ?>"
                                                class="w-8 h-8 rounded-full object-cover shadow-sm mb-1 flex-shrink-0">
                                        <?php endif; ?>

                                        <div class="flex flex-col <?= $isMe ? 'items-end' : 'items-start' ?>">
                                            <!-- Bubble -->
                                            <div class="relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words font-normal
                                                <?= $isMe
                                                    ? 'bg-[#2C67C8] text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'
                                                    ?>">
                                                <?= htmlspecialchars($msg['content']) ?>
                                            </div>
                                            <!-- Time -->
                                            <span
                                                class="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                                                <?= TimeHelper::formatTime($msg['created_at']) ?>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>

                    <!-- Input Area -->
                    <div class="p-4 bg-white border-t border-gray-100 z-10">
                        <form action="/chat/send" method="POST" class="flex items-center gap-3">
                            <input type="hidden" name="receiver_id" value="<?= $activePartner['id'] ?>">

                            <div class="flex items-center gap-1 text-gray-400">
                                <button type="button" id="emoji-btn"
                                    class="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Emoji"><i
                                        class="fa-regular fa-face-smile text-lg"></i></button>
                                <button type="button" class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Gửi ảnh"><i class="fa-regular fa-image text-lg"></i></button>
                                <button type="button" class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Đính kèm file"><i class="fa-solid fa-paperclip text-lg"></i></button>
                            </div>

                            <!-- Emoji Picker Popup -->
                            <div id="emoji-picker"
                                class="hidden absolute bottom-16 left-4 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-72 z-50">
                                <div class="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto text-xl">
                                    <!-- Smileys -->
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😀</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😃</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😄</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😁</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😆</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😅</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤣</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😂</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🙂</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😊</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😇</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🥰</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😍</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤩</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😘</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😗</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😋</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😛</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😜</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤪</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">😝</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤑</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤗</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤭</button>
                                    <!-- Gestures -->
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">👍</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">👎</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">👌</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">✌️</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤞</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤟</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🤘</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">👏</button>
                                    <!-- Hearts -->
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">❤️</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🧡</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💛</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💚</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💙</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💜</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🖤</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💕</button>
                                    <!-- Objects -->
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🎉</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🎊</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🎁</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">🔥</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">⭐</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">💯</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">✅</button>
                                    <button type="button" class="emoji-item hover:bg-gray-100 rounded p-1">❌</button>
                                </div>
                            </div>

                            <div class="flex-1 relative">
                                <input type="text" name="content"
                                    class="w-full bg-gray-100 text-gray-800 border-none rounded-full py-2.5 px-5 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none placeholder-gray-500"
                                    placeholder="Nhập tin nhắn..." required autocomplete="off">
                            </div>

                            <button type="submit"
                                class="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center w-11 h-11">
                                <i class="fa-solid fa-paper-plane text-sm translate-x-[-1px] translate-y-[1px]"></i>
                            </button>
                        </form>
                    </div>
                <?php else: ?>
                    <div class="flex-1 flex flex-col items-center justify-center text-gray-400 bg-slate-50/50">
                        <div class="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <i class="fa-regular fa-comments text-5xl text-blue-200"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-700">Chưa chọn cuộc hội thoại</h3>
                        <p class="text-sm mt-2">Chọn một người từ danh sách bên trái để bắt đầu chat.</p>
                    </div>
                <?php endif; ?>
            </div>
        </div>
</main>

<style>
    /* Custom Scrollbar for Chat */
    #messages-container::-webkit-scrollbar {
        width: 6px;
    }

    #messages-container::-webkit-scrollbar-track {
        background: transparent;
    }

    #messages-container::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 20px;
    }

    .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

<script src="/js/chat-page.js?v=<?= time() ?>"></script>

<?php include __DIR__ . '/../partials/footer.php'; ?>