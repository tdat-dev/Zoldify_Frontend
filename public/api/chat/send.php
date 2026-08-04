<?php
/**
 * API Send Chat Message
 * POST /api/chat/send
 * 
 * Gửi tin nhắn qua AJAX khi Socket.IO không available
 */

header('Content-Type: application/json');

// Start session
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get parameters
$senderId = (int) $_SESSION['user']['id'];
$receiverId = isset($_POST['receiver_id']) ? (int) $_POST['receiver_id'] : 0;
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

// Validate
if ($receiverId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid receiver_id']);
    exit;
}

if (empty($content)) {
    http_response_code(400);
    echo json_encode(['error' => 'Content is required']);
    exit;
}

if ($senderId === $receiverId) {
    http_response_code(400);
    echo json_encode(['error' => 'Cannot send message to yourself']);
    exit;
}

// Load autoloader
require_once __DIR__ . '/../../../vendor/autoload.php';

use App\Models\Message;

try {
    $messageModel = new Message();
    $messageId = $messageModel->send($senderId, $receiverId, $content);
    
    if ($messageId > 0) {
        echo json_encode([
            'success' => true,
            'message' => [
                'id' => $messageId,
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'content' => $content,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send message']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}