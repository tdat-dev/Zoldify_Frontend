"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, ArrowLeft, MessageCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSocket, disconnectSocket } from '@/lib/socket';

export default function ChatPage() {
  const { isAuthenticated, token, user: currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get('conversation');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  // Lưu vị trí scroll trước khi update messages để biết user có đang ở đáy không
  const isAtBottomRef = useRef(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchConversations();
    return () => disconnectSocket();
  }, [isAuthenticated]);

  // Safety net: re-fetch mỗi 5 phút phòng khi socket miss event (tab background)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => { fetchConversations(); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('receive_message', (msg: any) => {
      const isActive = activeConv && msg.conversation?.id === activeConv.id;
      if (isActive) {
        setMessages(prev => [...prev, msg]);
      }
      setConversations(prev => prev.map(c =>
        c.id === msg.conversation?.id ? { ...c, last_message: msg } : c
      ));
    });

    // Lắng nghe sự kiện presence realtime từ server
    socket.on('user_presence', ({ user_id, online, last_seen }: { user_id: number; online: boolean; last_seen: string }) => {
      // Cập nhật danh sách conversation
      setConversations(prev => prev.map(c =>
        c.partner_id === user_id ? { ...c, partner_last_seen: last_seen, partner_online: online } : c
      ));
      // Cập nhật active conversation nếu đang chat với user này
      setActiveConv((prev: any) =>
        prev && prev.partner_id === user_id ? { ...prev, partner_last_seen: last_seen, partner_online: online } : prev
      );
    });

    // Nhận danh sách userId đang online (snapshot lúc vừa connect)
    socket.on('online_users_snapshot', ({ user_ids }: { user_ids: number[] }) => {
      setConversations(prev => prev.map(c =>
        user_ids.includes(c.partner_id) ? { ...c, partner_online: true } : { ...c, partner_online: false }
      ));
      setActiveConv((prev: any) => {
        if (!prev) return prev;
        const isOnline = user_ids.includes(prev.partner_id);
        return { ...prev, partner_online: isOnline };
      });
    });

    // Yêu cầu server gửi snapshot ngay khi connect xong
    socket.on('connect', () => {
      socket.emit('request_online_users');
    });
    if (socket.connected) {
      socket.emit('request_online_users');
    }

    return () => {
      socket.off('receive_message');
      socket.off('user_presence');
      socket.off('online_users_snapshot');
      socket.off('connect');
    };
  }, [token, activeConv?.id]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      setShowSidebar(false);
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', activeConv.id);
      }
      // Khi chuyển hội thoại → cuộn xuống đáy ngay
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
        isAtBottomRef.current = true;
        setUnseenCount(0);
        setShowJumpButton(false);
      }, 50);
    }
  }, [activeConv?.id]);

  // Theo dõi vị trí scroll của khung chat
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      const atBottom = distanceFromBottom < 80;
      isAtBottomRef.current = atBottom;
      setShowJumpButton(!atBottom);
      if (atBottom) setUnseenCount(0);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeConv?.id]);

  // Auto-scroll khi messages thay đổi: chỉ scroll nếu user đang ở gần đáy
  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (isAtBottomRef.current) {
      // Dùng scrollTop trực tiếp trên container thay vì scrollIntoView (tránh scroll cả page)
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } else {
      // User đang đọc tin cũ → tăng số tin chưa đọc thay vì ép scroll
      setUnseenCount(prev => prev + 1);
    }
  }, [messages]);

  // Cuộn xuống đáy + reset unseen khi user bấm nút "Tin nhắn mới"
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      isAtBottomRef.current = true;
      setShowJumpButton(false);
      setUnseenCount(0);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const list = res.data?.data?.result || [];
      setConversations(list);
      if (targetConvId) {
        const target = list.find((c: any) => String(c.id) === String(targetConvId));
        if (target) {
          setActiveConv(target);
        } else if (list.length > 0) {
          setActiveConv(list[0]);
        } else {
          // URL có conv id nhưng list rỗng → thử load messages trực tiếp
          await fetchMessages(Number(targetConvId));
        }
      } else if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const res = await chatService.getMessages(convId);
      setMessages(res.data?.data?.result || []);
      chatService.markAsRead(convId).catch(() => {});
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', { conversationId: activeConv.id, content });
      } else {
        const res = await chatService.sendMessage(activeConv.id, content);
        setMessages(prev => [...prev, res.data?.data]);
      }
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('vi-VN');
  };

  // Tính trạng thái online từ realtime socket hoặc fallback last_seen
  const getOnlineStatus = (lastSeen?: string | Date | null, realtimeOnline?: boolean) => {
    // Ưu tiên tín hiệu realtime từ socket (chính xác tại thời điểm hiện tại)
    if (realtimeOnline === true) {
      return { online: true, text: 'Đang trực tuyến', dotClass: 'bg-green-500' };
    }
    if (realtimeOnline === false) {
      // Server vừa báo offline → tính theo last_seen
      if (!lastSeen) return { online: false, text: 'Ngoại tuyến', dotClass: 'bg-gray-400' };
      const diff = Date.now() - new Date(lastSeen).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return { online: false, text: 'Vừa mới truy cập', dotClass: 'bg-gray-400' };
      if (minutes < 60) return { online: false, text: `Hoạt động ${minutes} phút trước`, dotClass: 'bg-gray-400' };
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return { online: false, text: `Hoạt động ${hours} giờ trước`, dotClass: 'bg-gray-400' };
      const days = Math.floor(hours / 24);
      return { online: false, text: `Hoạt động ${days} ngày trước`, dotClass: 'bg-gray-400' };
    }
    // Chưa có tín hiệu realtime → fallback theo last_seen
    if (!lastSeen) return { online: false, text: 'Ngoại tuyến', dotClass: 'bg-gray-400' };
    const diff = Date.now() - new Date(lastSeen).getTime();
    if (diff < 5 * 60 * 1000) {
      return { online: true, text: 'Đang trực tuyến', dotClass: 'bg-green-500' };
    }
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return { online: false, text: `Hoạt động ${minutes} phút trước`, dotClass: 'bg-gray-400' };
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return { online: false, text: `Hoạt động ${hours} giờ trước`, dotClass: 'bg-gray-400' };
    const days = Math.floor(hours / 24);
    return { online: false, text: `Hoạt động ${days} ngày trước`, dotClass: 'bg-gray-400' };
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 md:pb-10 flex flex-col">
      <div className="max-w-[1000px] w-full mx-auto px-4 flex-1 flex flex-col pt-6">
        <div className="bg-white rounded-sm shadow-sm flex overflow-hidden h-[calc(100vh-180px)] md:h-[600px] border border-gray-200">
          {/* Sidebar */}
          <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${showSidebar ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-800">Hội thoại</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-600" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-600 text-sm">Chưa có hội thoại nào</div>
              ) : (
                conversations.map((conv: any) => {
                  const status = getOnlineStatus(conv.partner_last_seen, conv.partner_online);
                  return (
                  <div
                    key={conv.id}
                    onClick={() => { setActiveConv(conv); fetchMessages(conv.id); }}
                    className={`p-3 border-b border-gray-100 flex gap-3 hover:bg-gray-50 cursor-pointer ${activeConv?.id === conv.id ? 'bg-blue-50/50 border-l-4 border-l-brand' : ''}`}
                  >
                    <div className="relative">
                      <img loading="lazy" decoding="async" src={conv.partner_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.partner_name || 'User')}&background=random`} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${status.dotClass} rounded-full border-2 border-white`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-sm font-medium text-gray-800 truncate">{conv.partner_name || 'Người dùng'}</h4>
                        <span className="text-[10px] text-gray-600">{conv.last_message?.created_at ? formatTime(conv.last_message.created_at) : ''}</span>
                      </div>
                      <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                        {conv.last_message?.content || status.text}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`w-full md:w-2/3 flex flex-col bg-slate-50 relative ${!showSidebar ? 'flex' : 'hidden md:flex'}`}>
            {activeConv ? (
              (() => {
                const headerStatus = getOnlineStatus(activeConv.partner_last_seen, activeConv.partner_online);
                return (
              <>
                <div className="px-3 md:px-6 py-3 md:py-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10">
                  <div className="flex items-center gap-2 md:gap-4">
                    <button onClick={() => setShowSidebar(true)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <img loading="lazy" decoding="async" src={activeConv.partner_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.partner_name || 'User')}&background=0D8ABC&color=fff`} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt="" />
                      <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${headerStatus.dotClass} ring-2 ring-white`}></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{activeConv.partner_name || 'Người dùng'}</h3>
                      <span className={`text-xs font-medium ${headerStatus.online ? 'text-green-500' : 'text-gray-600'}`}>{headerStatus.text}</span>
                    </div>
                  </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
                  {showJumpButton && (
                    <button
                      onClick={scrollToBottom}
                      className="sticky bottom-3 left-1/2 -translate-x-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all"
                    >
                      ↓ Tin nhắn mới{unseenCount > 0 ? ` (${unseenCount})` : ''}
                    </button>
                  )}
                  {messages.map((msg: any, idx: number) => {
                    const isMe = msg.sender?.id === currentUser?.id;
                    return (
                      <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                          {!isMe && (
                            <img loading="lazy" decoding="async" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeConv.partner_name || 'U')}&background=0D8ABC&color=fff`} className="w-8 h-8 rounded-full object-cover shadow-sm mb-1 flex-shrink-0" alt="" />
                          )}
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`relative px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words font-normal ${isMe ? 'bg-brand text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'}`}>
                              {msg.content || msg.text}
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                              {msg.created_at ? formatTime(msg.created_at) : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100 z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-gray-100 text-gray-800 border-none rounded-full py-2.5 px-5 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none placeholder-gray-500"
                        placeholder="Nhập tin nhắn..."
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!text.trim() || sending}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md flex items-center justify-center w-11 h-11 disabled:opacity-50"
                    >
                      {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
                    </button>
                  </div>
                </div>
              </>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 bg-slate-50/50">
                <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-16 h-16 text-blue-200" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Chưa chọn cuộc hội thoại</h3>
                <p className="text-sm mt-2">Chọn một người từ danh sách bên trái để bắt đầu chat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
