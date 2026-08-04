/**
 * Zoldify Chat Server
 * Real-time messaging với Socket.IO
 * Hỗ trợ Redis Adapter để scale
 */

require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

// ============ CẤU HÌNH ============
const PORT = process.env.SOCKET_PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8000';
const REDIS_URL = process.env.REDIS_URL || null;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ LOGGER UTILITY ============
const logger = {
    isProduction: () => NODE_ENV === 'production',
    isStaging: () => NODE_ENV === 'staging',
    isDevelopment: () => ['development', 'local'].includes(NODE_ENV),
    
    // Debug: chỉ log ở development
    debug: (...args) => {
        if (logger.isDevelopment()) {
            console.log('[DEBUG]', ...args);
        }
    },
    
    // Info: log ở development và staging
    info: (...args) => {
        if (!logger.isProduction()) {
            console.log('[INFO]', ...args);
        }
    },
    
    // Warning: log tất cả môi trường
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },
    
    // Error: log tất cả môi trường
    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};

// Tạo HTTP server
const httpServer = createServer();

// Tạo Socket.IO server với CORS
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN.split(','), // Cho phép nhiều origin
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// ============ REDIS ADAPTER (Optional - cho scaling) ============
async function setupRedisAdapter() {
    if (!REDIS_URL) {
        console.log('[INFO] Redis not configured. Running in standalone mode.');
        return;
    }
    
    try {
        const { createAdapter } = require('@socket.io/redis-adapter');
        const { createClient } = require('redis');
        
        const pubClient = createClient({ url: REDIS_URL });
        const subClient = pubClient.duplicate();
        
        await Promise.all([pubClient.connect(), subClient.connect()]);
        
        io.adapter(createAdapter(pubClient, subClient));
        console.log('[INFO] Redis adapter connected. Ready for horizontal scaling.');
    } catch (error) {
        console.warn('[WARN] Redis adapter failed. Running in standalone mode.', error.message);
    }
}

// MySQL connection pool (để lưu tin nhắn vào DB)
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'unimarket',
    waitForConnections: true,
    connectionLimit: 10
});

// ============ HÀM HELPER ============
/**
 * Cập nhật last_seen của user vào DB khi disconnect
 */
async function updateLastSeen(userId) {
    try {
        await dbPool.execute(
            'UPDATE users SET last_seen = NOW() WHERE id = ?',
            [userId]
        );
        logger.debug(`[LAST_SEEN] Updated for user ${userId}`);
    } catch (error) {
        logger.error('[ERROR] Failed to update last_seen:', error.message);
    }
}

// ============ LƯU TRỮ ONLINE USERS ============
const onlineUsers = new Map(); // userId -> socketId

// ============ SOCKET.IO EVENTS ============
io.on('connection', (socket) => {
    logger.debug(`[CONNECT] Socket connected: ${socket.id}`);

    /**
     * Event: user_online
     * Khi user đăng nhập/mở trang chat
     */
    socket.on('user_online', (userId) => {
        if (!userId) return;
        
        // Lưu user vào danh sách online
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        
        // Join room cá nhân (để nhận tin nhắn riêng)
        socket.join(`user_${userId}`);
        
        logger.info(`[ONLINE] User ${userId} is online. Total online: ${onlineUsers.size}`);
        
        // Broadcast danh sách user online cho tất cả
        io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    /**
     * Event: get_online_users
     * Client yêu cầu lấy lại danh sách user online
     */
    socket.on('get_online_users', () => {
        logger.debug(`[GET_ONLINE] Socket ${socket.id} requested online users list`);
        socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    /**
     * Event: send_message
     * Khi user gửi tin nhắn (có thể kèm attachment)
     */
    socket.on('send_message', async (data) => {
        const { sender_id, receiver_id, content, attachment } = data;
        
        // Phải có nội dung hoặc attachment
        if (!sender_id || !receiver_id || (!content && !attachment)) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        try {
            // 1. Lấy thông tin sender để gửi kèm notification
            const [senderRows] = await dbPool.execute(
                'SELECT full_name, avatar FROM users WHERE id = ?',
                [sender_id]
            );
            const senderInfo = senderRows[0] || { full_name: 'Người dùng', avatar: null };
            
            // 2. Lưu tin nhắn vào Database
            const messageContent = content || (attachment ? '[File đính kèm]' : '');
            const hasAttachment = attachment ? 1 : 0;
            
            const [result] = await dbPool.execute(
                'INSERT INTO messages (sender_id, receiver_id, content, is_read, has_attachment, created_at) VALUES (?, ?, ?, 0, ?, NOW())',
                [sender_id, receiver_id, messageContent, hasAttachment]
            );

            const messageId = result.insertId;
            const timestamp = new Date().toISOString();

            // 3. Nếu có attachment, lưu vào bảng message_attachments
            if (attachment) {
                await dbPool.execute(
                    'INSERT INTO message_attachments (message_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
                    [messageId, attachment.name, attachment.path, attachment.type, attachment.size || 0]
                );
            }

            // 4. Tạo object tin nhắn để gửi đi (bao gồm sender info cho notification)
            const messageData = {
                id: messageId,
                sender_id: sender_id,
                sender_name: senderInfo.full_name,
                sender_avatar: senderInfo.avatar,
                receiver_id: receiver_id,
                content: messageContent,
                is_read: false,
                has_attachment: hasAttachment,
                attachment: attachment || null,
                created_at: timestamp
            };

            // 5. Gửi tin nhắn đến người nhận (nếu online)
            io.to(`user_${receiver_id}`).emit('new_message', messageData);
            
            // 6. Gửi xác nhận lại cho người gửi
            socket.emit('message_sent', messageData);

            const logContent = content ? content.substring(0, 30) : '[Attachment]';
            logger.info(`[MESSAGE] ${sender_id} -> ${receiver_id}: ${logContent}...`);

        } catch (error) {
            logger.error('[ERROR] Failed to save message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    /**
     * Event: mark_read
     * Đánh dấu tin nhắn đã đọc
     */
    socket.on('mark_read', async (data) => {
        const { message_ids, reader_id } = data;
        
        if (!message_ids || !message_ids.length) return;

        try {
            // Cập nhật DB
            const placeholders = message_ids.map(() => '?').join(',');
            await dbPool.execute(
                `UPDATE messages SET is_read = 1 WHERE id IN (${placeholders}) AND receiver_id = ?`,
                [...message_ids, reader_id]
            );

            logger.debug(`[READ] User ${reader_id} marked ${message_ids.length} messages as read`);

        } catch (error) {
            logger.error('[ERROR] Failed to mark messages as read:', error);
        }
    });

    /**
     * Event: typing
     * Hiển thị "đang nhập..."
     */
    socket.on('typing', (data) => {
        const { sender_id, receiver_id, is_typing } = data;
        io.to(`user_${receiver_id}`).emit('user_typing', {
            sender_id,
            is_typing
        });
    });

    /**
     * Event: disconnect
     * Khi user đóng trình duyệt/tab
     */
    socket.on('disconnect', async () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            
            // Cập nhật last_seen vào database
            await updateLastSeen(socket.userId);
            
            logger.info(`[OFFLINE] User ${socket.userId} disconnected. Total online: ${onlineUsers.size}`);
            
            // Broadcast cập nhật danh sách online kèm last_seen của user vừa offline
            io.emit('online_users', Array.from(onlineUsers.keys()));
            
            // Gửi riêng thông tin user vừa offline
            io.emit('user_offline', {
                user_id: socket.userId,
                last_seen: new Date().toISOString()
            });
        }
    });
});

// ============ KHỞI ĐỘNG SERVER ============
async function startServer() {
    // Setup Redis adapter nếu có config
    await setupRedisAdapter();
    
    // Start listening
    httpServer.listen(PORT, () => {
        console.log('========================================');
        console.log(`🚀 Zoldify Chat Server is running!`);
        console.log(`🔧 Environment: ${NODE_ENV}`);
        console.log(`📡 Port: ${PORT}`);
        console.log(`🌐 CORS: ${CORS_ORIGIN}`);
        console.log(`📦 Redis: ${REDIS_URL ? 'Enabled' : 'Disabled (standalone)'}`);
        console.log('========================================');
    });
}

startServer();