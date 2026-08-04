<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Middleware\VerificationMiddleware;
use App\Models\User;
use App\Models\Message;

/**
 * Chat Controller
 * 
 * Xử lý chat real-time giữa các users.
 * 
 * @package App\Controllers
 */
class ChatController extends BaseController
{
    /**
     * Trang chat chính
     */
    public function index(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $currentUserId = (int) $user['id'];
        $messageModel = new Message();
        $userModel = new User();

        // Get recent conversations
        $conversations = $messageModel->getRecentConversations($currentUserId);

        // Check if viewing specific conversation
        $activePartnerId = $this->query('user_id');
        $activePartner = null;
        $messages = [];

        if ($activePartnerId !== null) {
            $activePartnerId = (int) $activePartnerId;

            // Prevent chatting with self
            if ($activePartnerId === $currentUserId) {
                $this->redirect('/chat');
            }

            $activePartner = $userModel->find($activePartnerId);

            if ($activePartner !== null) {
                $messages = $messageModel->getConversation($currentUserId, $activePartnerId);

                // Mark messages as read
                $messageModel->markConversationAsRead($currentUserId, $activePartnerId);
            }
        }

        $this->view('chat/index', [
            'conversations' => $conversations,
            'activePartner' => $activePartner,
            'messages' => $messages,
            'currentUserId' => $currentUserId,
        ]);
    }

    /**
     * Gửi tin nhắn
     */
    public function send(): void
    {
        $user = $this->requireAuth();
        $senderId = (int) $user['id'];

        $receiverId = $this->input('receiver_id');
        $content = trim($this->input('content', ''));

        // Validate
        if (empty($receiverId) || empty($content)) {
            $this->jsonError('Dữ liệu không hợp lệ');
        }

        $receiverId = (int) $receiverId;

        // Prevent self-messaging
        if ($receiverId === $senderId) {
            $this->jsonError('Không thể gửi tin nhắn cho chính mình');
        }

        $messageModel = new Message();
        $messageId = $messageModel->send($senderId, $receiverId, $content);

        if ($messageId > 0) {
            // Redirect back to conversation
            $this->redirect("/chat?user_id={$receiverId}");
        } else {
            $this->redirect("/chat?user_id={$receiverId}&error=1");
        }
    }

    /**
     * API: Gửi tin nhắn (AJAX)
     */
    public function sendAjax(): never
    {
        $user = $this->requireAuth();
        $senderId = (int) $user['id'];

        $input = $this->getJsonInput();
        $receiverId = (int) ($input['receiver_id'] ?? 0);
        $content = trim($input['content'] ?? '');

        if ($receiverId === 0 || empty($content)) {
            $this->jsonError('Dữ liệu không hợp lệ');
        }

        if ($receiverId === $senderId) {
            $this->jsonError('Không thể gửi tin nhắn cho chính mình');
        }

        $messageModel = new Message();
        $messageId = $messageModel->send($senderId, $receiverId, $content);

        if ($messageId > 0) {
            $this->jsonSuccess('Đã gửi', ['message_id' => $messageId]);
        } else {
            $this->jsonError('Không thể gửi tin nhắn', 500);
        }
    }
}
