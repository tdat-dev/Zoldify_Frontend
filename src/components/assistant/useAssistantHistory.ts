"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AssistantMessage, AssistantProduct } from '@/services/assistant.service';

export interface Turn extends AssistantMessage {
  products?: AssistantProduct[];
  /** Thời gian từ lúc gửi câu tới lúc có câu trả lời, đo ở trình duyệt. */
  ms?: number;
  /** Lời chào mở đầu: hiện ra nhưng không gửi lên server. */
  greeting?: boolean;
}

/** Giữ chừng ấy lượt gần nhất là đủ để xem lại, mà không làm đầy bộ nhớ trình duyệt. */
const MAX_TURNS = 40;

/**
 * Lịch sử trò chuyện với trợ lý, lưu trong trình duyệt theo từng tài khoản (khách
 * dùng chung một ngăn). Người mua mở lại khung chat vẫn thấy các món đã hỏi để so
 * sánh hay bấm Mua ngay tiếp. Chỉ ở trình duyệt này: chưa có bảng lưu trên server,
 * nên đổi máy thì không thấy.
 */
export function useAssistantHistory(greetingText: string) {
  const { user } = useAuth();
  const key = `zoldify-assistant:${user?.id ?? 'guest'}`;
  const greeting: Turn = { role: 'assistant', content: greetingText, greeting: true };
  const [turns, setTurns] = useState<Turn[]>([greeting]);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    let saved: Turn[] = [];
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        saved = parsed.filter(
          (x): x is Turn =>
            !!x && (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string',
        );
      }
    } catch {
      // Dữ liệu hỏng hoặc trình duyệt chặn lưu trữ: bắt đầu cuộc mới.
    }
    // Trang tải lại giữa chừng thì câu AI đang chờ sẽ không bao giờ đến: tắt cờ chờ.
    const settled = saved.map((x) =>
      x.products ? { ...x, products: x.products.map((p) => ({ ...p, ai_pending: false })) } : x,
    );
    setTurns(settled.length ? settled : [greeting]);
    loadedKey.current = key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (loadedKey.current !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(turns.slice(-MAX_TURNS)));
    } catch {
      // Hết chỗ hoặc bị chặn: vẫn chat được, chỉ không lưu.
    }
  }, [turns, key]);

  const reset = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // bỏ qua
    }
    setTurns([greeting]);
  };

  return { turns, setTurns, reset };
}
