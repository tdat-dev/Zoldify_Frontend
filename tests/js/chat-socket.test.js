/**
 * Unit tests cho ChatSocket class
 * Framework: Jest
 * 
 * Mock tất cả external boundaries:
 * - Socket.IO (io function, socket instance)
 * - DOM (document, window)
 * - Audio API
 * - Fetch API
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ==================== MOCK FACTORIES ====================

/**
 * Factory tạo mock message
 */
const createMockMessage = (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    sender_id: 2,
    receiver_id: 1,
    content: 'Test message',
    created_at: new Date().toISOString(),
    ...overrides
});

/**
 * Factory tạo mock file
 */
const createMockFile = (overrides = {}) => ({
    url: '/uploads/test.png',
    type: 'image',
    name: 'test.png',
    mime_type: 'image/png',
    ...overrides
});

// ==================== SETUP MOCKS TRƯỚC KHI LOAD FILE ====================

// Mock Socket.IO - PHẢI setup trước khi load file vì file gọi new ChatSocket() ngay
const mockSocketInstance = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn()
};

global.io = jest.fn(() => mockSocketInstance);

// Mock Audio API
global.Audio = jest.fn(() => ({
    play: jest.fn(() => Promise.resolve()),
    currentTime: 0,
    volume: 1
}));

// Mock fetch
global.fetch = jest.fn();

// ==================== LOAD CHAT SOCKET CLASS ====================

// Load ChatSocket class - file sẽ tạo window.chatSocket = new ChatSocket()
const chatSocketPath = path.join(__dirname, '../../public/js/chat-socket.js');
const chatSocketCode = fs.readFileSync(chatSocketPath, 'utf8');

// Dùng eval để chạy trong context hiện tại (có access window từ jsdom)
eval(chatSocketCode);

// Extract ChatSocket class từ window.chatSocket và define vào global
// Vì eval trong strict mode không leak class declaration
const ChatSocket = window.chatSocket.constructor;
global.ChatSocket = ChatSocket;

// ==================== TEST SUITES ====================

describe('ChatSocket', () => {
    
    // Reset mocks before each test
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Reset mock socket instance methods
        mockSocketInstance.on.mockClear();
        mockSocketInstance.emit.mockClear();
        mockSocketInstance.disconnect.mockClear();
        
        // Reset window properties
        window.SOCKET_URL = undefined;
        
        // Reset window.location
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true,
            configurable: true
        });
        
        // Reset DOM mocks
        document.hasFocus = jest.fn(() => true);
        document.querySelector = jest.fn(() => null);
        document.querySelectorAll = jest.fn(() => []);
        document.getElementById = jest.fn(() => null);
        
        // Reset console spies
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        
        // Reset alert mock
        global.alert = jest.fn();
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    // ========== Constructor Tests ==========
    describe('constructor()', () => {
        test('should initialize with default values', () => {
            const socket = new ChatSocket();
            
            expect(socket.socket).toBeNull();
            expect(socket.currentUserId).toBeNull();
            expect(socket.currentChatUserId).toBeNull();
            expect(socket.isConnected).toBe(false);
            expect(socket.messageCallbacks).toEqual([]);
            expect(socket.typingTimeout).toBeNull();
        });
    });
    
    // ========== connect() Tests ==========
    describe('connect()', () => {
        
        // --- Happy Path ---
        test('should connect successfully with valid userId', () => {
            const socket = new ChatSocket();
            socket.connect(123);
            
            expect(socket.currentUserId).toBe(123);
            expect(global.io).toHaveBeenCalled();
            expect(socket.socket).toBe(mockSocketInstance);
        });
        
        test('should use window.SOCKET_URL if defined', () => {
            window.SOCKET_URL = 'http://custom-server:5000';
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                'http://custom-server:5000',
                expect.any(Object)
            );
        });
        
        test('should auto-detect localhost', () => {
            window.location = { hostname: 'localhost' };
            
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                'http://localhost:3001',
                expect.any(Object)
            );
        });
        
        test('should auto-detect 127.0.0.1', () => {
            window.location = { hostname: '127.0.0.1' };
            
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                'http://localhost:3001',
                expect.any(Object)
            );
        });
        
        test('should auto-detect staging environment', () => {
            window.location = { hostname: 'staging.zoldify.com' };
            
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                'http://staging.zoldify.com:3001',
                expect.any(Object)
            );
        });
        
        test('should use https for production', () => {
            window.location = { hostname: 'zoldify.com' };
            
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                'https://zoldify.com:3001',
                expect.any(Object)
            );
        });
        
        test('should setup socket with correct options', () => {
            const socket = new ChatSocket();
            socket.connect(1);
            
            expect(global.io).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000
                })
            );
        });
        
        // --- Negative Testing ---
        test('should not connect without userId (null)', () => {
            const socket = new ChatSocket();
            socket.connect(null);
            
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] userId is required');
            expect(global.io).not.toHaveBeenCalled();
        });
        
        test('should not connect with undefined userId', () => {
            const socket = new ChatSocket();
            socket.connect(undefined);
            
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] userId is required');
            expect(global.io).not.toHaveBeenCalled();
        });
        
        test('should not connect with empty string userId', () => {
            const socket = new ChatSocket();
            socket.connect('');
            
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] userId is required');
            expect(global.io).not.toHaveBeenCalled();
        });
        
        // --- Boundary Testing ---
        test('should not connect with userId = 0 (falsy)', () => {
            const socket = new ChatSocket();
            socket.connect(0);
            
            // 0 là falsy nên sẽ bị reject
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] userId is required');
        });
        
        test('should connect with large userId', () => {
            const socket = new ChatSocket();
            socket.connect(999999999);
            
            expect(socket.currentUserId).toBe(999999999);
            expect(global.io).toHaveBeenCalled();
        });
        
        test('should connect with string userId', () => {
            const socket = new ChatSocket();
            socket.connect('123');
            
            expect(socket.currentUserId).toBe('123');
            expect(global.io).toHaveBeenCalled();
        });
    });
    
    // ========== _setupListeners() Tests ==========
    describe('_setupListeners()', () => {
        let socket;
        let eventHandlers;
        
        beforeEach(() => {
            socket = new ChatSocket();
            eventHandlers = {};
            
            // Capture event handlers
            mockSocketInstance.on.mockImplementation((event, handler) => {
                eventHandlers[event] = handler;
            });
            
            socket.connect(1);
        });
        
        test('should register all required event listeners', () => {
            const events = ['connect', 'disconnect', 'connect_error', 
                          'new_message', 'message_sent', 'online_users', 
                          'user_typing', 'error'];
            
            events.forEach(event => {
                expect(mockSocketInstance.on).toHaveBeenCalledWith(event, expect.any(Function));
            });
        });
        
        test('connect event should set isConnected to true and emit user_online', () => {
            eventHandlers['connect']();
            
            expect(socket.isConnected).toBe(true);
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('user_online', 1);
        });
        
        test('disconnect event should set isConnected to false', () => {
            socket.isConnected = true;
            eventHandlers['disconnect']('io server disconnect');
            
            expect(socket.isConnected).toBe(false);
        });
        
        test('connect_error event should log error', () => {
            const error = new Error('Connection failed');
            eventHandlers['connect_error'](error);
            
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] Connection error:', error);
        });
        
        test('new_message event should trigger callbacks', () => {
            const callback = jest.fn();
            socket.onNewMessage(callback);
            
            const message = createMockMessage();
            eventHandlers['new_message'](message);
            
            expect(callback).toHaveBeenCalledWith(message, 'received');
        });
        
        test('message_sent event should trigger callbacks', () => {
            const callback = jest.fn();
            socket.onNewMessage(callback);
            
            const message = createMockMessage({ sender_id: 1 });
            eventHandlers['message_sent'](message);
            
            expect(callback).toHaveBeenCalledWith(message, 'sent');
        });
        
        test('error event should show alert', () => {
            eventHandlers['error']({ message: 'Test error' });
            
            expect(global.alert).toHaveBeenCalledWith('Lỗi: Test error');
        });
        
        test('online_users event should call _updateOnlineStatus', () => {
            const spy = jest.spyOn(socket, '_updateOnlineStatus');
            eventHandlers['online_users'](['1', '2', '3']);
            
            expect(spy).toHaveBeenCalledWith(['1', '2', '3']);
        });
        
        test('user_typing event should call _handleTyping', () => {
            const spy = jest.spyOn(socket, '_handleTyping');
            const data = { sender_id: 2, is_typing: true };
            eventHandlers['user_typing'](data);
            
            expect(spy).toHaveBeenCalledWith(data);
        });
    });
    
    // ========== sendMessage() Tests ==========
    describe('sendMessage()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
        });
        
        // --- Happy Path ---
        test('should send text message successfully', () => {
            const result = socket.sendMessage(2, 'Hello World');
            
            expect(result).toBe(true);
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('send_message', {
                sender_id: 1,
                receiver_id: 2,
                content: 'Hello World'
            });
        });
        
        test('should trim message content', () => {
            socket.sendMessage(2, '  Hello World  ');
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('send_message', {
                sender_id: 1,
                receiver_id: 2,
                content: 'Hello World'
            });
        });
        
        test('should send message with attachment', () => {
            const attachment = createMockFile();
            socket.sendMessage(2, 'Check this', attachment);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('send_message', {
                sender_id: 1,
                receiver_id: 2,
                content: 'Check this',
                attachment: attachment
            });
        });
        
        test('should send attachment without text content', () => {
            const attachment = createMockFile();
            socket.sendMessage(2, '', attachment);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('send_message', {
                sender_id: 1,
                receiver_id: 2,
                content: null,
                attachment: attachment
            });
        });
        
        test('should send attachment with null content', () => {
            const attachment = createMockFile();
            socket.sendMessage(2, null, attachment);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('send_message', {
                sender_id: 1,
                receiver_id: 2,
                content: null,
                attachment: attachment
            });
        });
        
        // --- Negative Testing ---
        test('should return false when not connected', () => {
            socket.isConnected = false;
            
            const result = socket.sendMessage(2, 'Hello');
            
            expect(result).toBe(false);
            expect(console.error).toHaveBeenCalledWith('[ChatSocket] Not connected');
        });
        
        test('should return false without content or attachment', () => {
            const result = socket.sendMessage(2, '');
            
            expect(result).toBe(false);
        });
        
        test('should return false with null content and no attachment', () => {
            const result = socket.sendMessage(2, null);
            
            expect(result).toBe(false);
        });
        
        test('should return false with undefined content', () => {
            const result = socket.sendMessage(2, undefined);
            
            expect(result).toBe(false);
        });
    });
    
    // ========== sendFile() Tests ==========
    describe('sendFile()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
        });
        
        // --- Happy Path ---
        test('should upload and send file successfully', async () => {
            const mockFile = new Blob(['test'], { type: 'image/png' });
            const fileResponse = createMockFile();
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ file: fileResponse })
            });
            
            const result = await socket.sendFile(2, mockFile, 'My image');
            
            expect(global.fetch).toHaveBeenCalledWith('/api/chat/upload.php', {
                method: 'POST',
                body: expect.any(FormData)
            });
            expect(result).toBe(true);
        });
        
        test('should send file without caption', async () => {
            const mockFile = new Blob(['test'], { type: 'application/pdf' });
            const fileResponse = createMockFile({ type: 'file', name: 'doc.pdf' });
            
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ file: fileResponse })
            });
            
            await socket.sendFile(2, mockFile);
            
            expect(mockSocketInstance.emit).toHaveBeenCalled();
        });
        
        // --- Exception Flows ---
        test('should throw error when not connected', async () => {
            socket.isConnected = false;
            const mockFile = new Blob(['test']);
            
            await expect(socket.sendFile(2, mockFile))
                .rejects.toThrow('Not connected');
        });
        
        test('should throw error when upload fails', async () => {
            const mockFile = new Blob(['test']);
            
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: 'File too large' })
            });
            
            await expect(socket.sendFile(2, mockFile))
                .rejects.toThrow('File too large');
        });
        
        test('should throw default error when response has no error message', async () => {
            const mockFile = new Blob(['test']);
            
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({})
            });
            
            await expect(socket.sendFile(2, mockFile))
                .rejects.toThrow('Upload failed');
        });
        
        test('should handle network error', async () => {
            const mockFile = new Blob(['test']);
            
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            
            await expect(socket.sendFile(2, mockFile))
                .rejects.toThrow('Network error');
        });
    });
    
    // ========== markAsRead() Tests ==========
    describe('markAsRead()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
        });
        
        test('should emit mark_read with message IDs', () => {
            socket.markAsRead([101, 102, 103]);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('mark_read', {
                message_ids: [101, 102, 103],
                reader_id: 1
            });
        });
        
        test('should not emit when not connected', () => {
            socket.isConnected = false;
            socket.markAsRead([101]);
            
            // Chỉ có emit từ connect event
            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('mark_read', expect.any(Object));
        });
        
        test('should not emit with empty array', () => {
            socket.markAsRead([]);
            
            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('mark_read', expect.any(Object));
        });
        
        test('should handle single message ID', () => {
            socket.markAsRead([999]);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('mark_read', {
                message_ids: [999],
                reader_id: 1
            });
        });
    });
    
    // ========== sendTyping() Tests ==========
    describe('sendTyping()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
        });
        
        test('should emit typing event when typing starts', () => {
            socket.sendTyping(2, true);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('typing', {
                sender_id: 1,
                receiver_id: 2,
                is_typing: true
            });
        });
        
        test('should emit typing event when typing stops', () => {
            socket.sendTyping(2, false);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('typing', {
                sender_id: 1,
                receiver_id: 2,
                is_typing: false
            });
        });
        
        test('should not emit when not connected', () => {
            socket.isConnected = false;
            socket.sendTyping(2, true);
            
            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('typing', expect.any(Object));
        });
    });
    
    // ========== onNewMessage() Tests ==========
    describe('onNewMessage()', () => {
        test('should register callback', () => {
            const socket = new ChatSocket();
            const callback = jest.fn();
            
            socket.onNewMessage(callback);
            
            expect(socket.messageCallbacks).toContain(callback);
        });
        
        test('should allow multiple callbacks', () => {
            const socket = new ChatSocket();
            const cb1 = jest.fn();
            const cb2 = jest.fn();
            const cb3 = jest.fn();
            
            socket.onNewMessage(cb1);
            socket.onNewMessage(cb2);
            socket.onNewMessage(cb3);
            
            expect(socket.messageCallbacks).toHaveLength(3);
        });
    });
    
    // ========== _handleNewMessage() Tests ==========
    describe('_handleNewMessage()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
        });
        
        test('should call all registered callbacks', () => {
            const cb1 = jest.fn();
            const cb2 = jest.fn();
            socket.onNewMessage(cb1);
            socket.onNewMessage(cb2);
            
            const message = createMockMessage();
            socket._handleNewMessage(message);
            
            expect(cb1).toHaveBeenCalledWith(message, 'received');
            expect(cb2).toHaveBeenCalledWith(message, 'received');
        });
        
        test('should auto mark as read if chatting with sender', () => {
            socket.currentChatUserId = 2;
            
            const message = createMockMessage({ id: 999, sender_id: 2 });
            socket._handleNewMessage(message);
            
            expect(mockSocketInstance.emit).toHaveBeenCalledWith('mark_read', {
                message_ids: [999],
                reader_id: 1
            });
        });
        
        test('should not mark as read if not chatting with sender', () => {
            socket.currentChatUserId = 3; // Khác sender
            
            const message = createMockMessage({ sender_id: 2 });
            socket._handleNewMessage(message);
            
            // Không call mark_read
            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('mark_read', expect.any(Object));
        });
        
        test('should play notification sound', () => {
            const spy = jest.spyOn(socket, '_playNotificationSound');
            
            socket._handleNewMessage(createMockMessage());
            
            expect(spy).toHaveBeenCalled();
        });
    });
    
    // ========== _updateOnlineStatus() Tests ==========
    describe('_updateOnlineStatus()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
        });
        
        test('should add online class for online users', () => {
            const mockStatusDot = {
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                }
            };
            
            const mockElement = {
                getAttribute: jest.fn(() => '123'),
                querySelector: jest.fn(() => mockStatusDot)
            };
            
            document.querySelectorAll.mockReturnValue([mockElement]);
            
            socket._updateOnlineStatus(['123', '456']);
            
            expect(mockStatusDot.classList.add).toHaveBeenCalledWith('online');
            expect(mockStatusDot.classList.remove).toHaveBeenCalledWith('offline');
        });
        
        test('should add offline class for offline users', () => {
            const mockStatusDot = {
                classList: {
                    add: jest.fn(),
                    remove: jest.fn()
                }
            };
            
            const mockElement = {
                getAttribute: jest.fn(() => '789'),
                querySelector: jest.fn(() => mockStatusDot)
            };
            
            document.querySelectorAll.mockReturnValue([mockElement]);
            
            socket._updateOnlineStatus(['123']); // 789 không có trong list
            
            expect(mockStatusDot.classList.add).toHaveBeenCalledWith('offline');
            expect(mockStatusDot.classList.remove).toHaveBeenCalledWith('online');
        });
        
        test('should skip elements without status dot', () => {
            const mockElement = {
                getAttribute: jest.fn(() => '123'),
                querySelector: jest.fn(() => null)
            };
            
            document.querySelectorAll.mockReturnValue([mockElement]);
            
            // Không throw error
            expect(() => socket._updateOnlineStatus(['123'])).not.toThrow();
        });
        
        test('should handle multiple elements', () => {
            const dots = [];
            const elements = [1, 2, 3].map(id => {
                const dot = {
                    classList: { add: jest.fn(), remove: jest.fn() }
                };
                dots.push(dot);
                return {
                    getAttribute: jest.fn(() => String(id)),
                    querySelector: jest.fn(() => dot)
                };
            });
            
            document.querySelectorAll.mockReturnValue(elements);
            
            socket._updateOnlineStatus(['1', '3']);
            
            // User 1 và 3 online
            expect(dots[0].classList.add).toHaveBeenCalledWith('online');
            expect(dots[2].classList.add).toHaveBeenCalledWith('online');
            
            // User 2 offline
            expect(dots[1].classList.add).toHaveBeenCalledWith('offline');
        });
    });
    
    // ========== _handleTyping() Tests ==========
    describe('_handleTyping()', () => {
        let socket;
        
        beforeEach(() => {
            socket = new ChatSocket();
            socket.currentChatUserId = 2;
        });
        
        test('should show typing indicator when sender is current chat user', () => {
            const mockIndicator = {
                style: { display: '' },
                textContent: ''
            };
            document.getElementById.mockReturnValue(mockIndicator);
            
            socket._handleTyping({ sender_id: 2, is_typing: true });
            
            expect(mockIndicator.style.display).toBe('block');
            expect(mockIndicator.textContent).toBe('Đang nhập...');
        });
        
        test('should hide typing indicator when typing stops', () => {
            const mockIndicator = {
                style: { display: 'block' },
                textContent: ''
            };
            document.getElementById.mockReturnValue(mockIndicator);
            
            socket._handleTyping({ sender_id: 2, is_typing: false });
            
            expect(mockIndicator.style.display).toBe('none');
        });
        
        test('should hide typing indicator if sender is not current chat user', () => {
            const mockIndicator = {
                style: { display: 'block' },
                textContent: ''
            };
            document.getElementById.mockReturnValue(mockIndicator);
            
            socket._handleTyping({ sender_id: 999, is_typing: true });
            
            expect(mockIndicator.style.display).toBe('none');
        });
        
        test('should not throw if indicator element not found', () => {
            document.getElementById.mockReturnValue(null);
            
            expect(() => socket._handleTyping({ sender_id: 2, is_typing: true }))
                .not.toThrow();
        });
        
        test('should handle string sender_id with == comparison', () => {
            const mockIndicator = {
                style: { display: '' },
                textContent: ''
            };
            document.getElementById.mockReturnValue(mockIndicator);
            socket.currentChatUserId = '2'; // String
            
            socket._handleTyping({ sender_id: 2, is_typing: true }); // Number
            
            expect(mockIndicator.style.display).toBe('block');
        });
    });
    
    // ========== _playNotificationSound() Tests ==========
    describe('_playNotificationSound()', () => {
        let socket;
        let mockAudioInstance;
        
        beforeEach(() => {
            socket = new ChatSocket();
            
            // Fresh audio mock for each test
            mockAudioInstance = {
                play: jest.fn(() => Promise.resolve()),
                currentTime: 0,
                volume: 1
            };
            global.Audio = jest.fn(() => mockAudioInstance);
        });
        
        test('should not play when tab is focused and chat container exists', () => {
            document.hasFocus.mockReturnValue(true);
            document.querySelector.mockReturnValue({}); // Chat container exists
            
            socket._playNotificationSound();
            
            expect(mockAudioInstance.play).not.toHaveBeenCalled();
        });
        
        test('should play when tab is not focused', () => {
            document.hasFocus.mockReturnValue(false);
            
            socket._playNotificationSound();
            
            expect(global.Audio).toHaveBeenCalledWith('/sounds/notification.mp3');
            expect(mockAudioInstance.play).toHaveBeenCalled();
        });
        
        test('should play when no chat container', () => {
            document.hasFocus.mockReturnValue(true);
            document.querySelector.mockReturnValue(null); // No chat container
            
            socket._playNotificationSound();
            
            expect(mockAudioInstance.play).toHaveBeenCalled();
        });
        
        test('should set volume to 0.5', () => {
            document.hasFocus.mockReturnValue(false);
            
            socket._playNotificationSound();
            
            expect(mockAudioInstance.volume).toBe(0.5);
        });
        
        test('should reset currentTime before playing', () => {
            document.hasFocus.mockReturnValue(false);
            mockAudioInstance.currentTime = 5;
            
            socket._playNotificationSound();
            
            expect(mockAudioInstance.currentTime).toBe(0);
        });
        
        test('should catch play error silently', async () => {
            document.hasFocus.mockReturnValue(false);
            mockAudioInstance.play.mockRejectedValueOnce(new Error('Autoplay blocked'));
            
            // Không throw error
            expect(() => socket._playNotificationSound()).not.toThrow();
        });
    });
    
    // ========== setCurrentChatUser() Tests ==========
    describe('setCurrentChatUser()', () => {
        test('should set currentChatUserId', () => {
            const socket = new ChatSocket();
            
            socket.setCurrentChatUser(42);
            
            expect(socket.currentChatUserId).toBe(42);
        });
        
        test('should allow setting to null', () => {
            const socket = new ChatSocket();
            socket.currentChatUserId = 1;
            
            socket.setCurrentChatUser(null);
            
            expect(socket.currentChatUserId).toBeNull();
        });
        
        test('should allow setting to string', () => {
            const socket = new ChatSocket();
            
            socket.setCurrentChatUser('123');
            
            expect(socket.currentChatUserId).toBe('123');
        });
    });
    
    // ========== disconnect() Tests ==========
    describe('disconnect()', () => {
        test('should disconnect socket and set isConnected to false', () => {
            const socket = new ChatSocket();
            socket.connect(1);
            socket.isConnected = true;
            
            socket.disconnect();
            
            expect(mockSocketInstance.disconnect).toHaveBeenCalled();
            expect(socket.isConnected).toBe(false);
        });
        
        test('should not throw if socket is null', () => {
            const socket = new ChatSocket();
            
            expect(() => socket.disconnect()).not.toThrow();
        });
    });
    
    // ========== Global Instance Tests ==========
    describe('Global window.chatSocket', () => {
        test('should create global chatSocket instance', () => {
            expect(window.chatSocket).toBeDefined();
            expect(window.chatSocket).toBeInstanceOf(ChatSocket);
        });
    });
});
