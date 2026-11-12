"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import { assistantService } from '@/services/assistant.service';
import { AssistantPanel } from './AssistantPanel';

/**
 * Trang không hiện bong bóng trợ lý: đang đặt hàng, đang trả tiền thì nút nổi chỉ
 * làm người mua phân tâm và che mất nút Đặt hàng trên màn nhỏ.
 */
const HIDDEN_ON = ['/checkout', '/payment', '/login', '/register', '/forgot-password', '/reset-password', '/maintenance'];

/** Nhãn "Hỏi trợ lý" tự hiện bấy lâu ở lần đầu vào trang trong phiên, rồi chỉ hiện khi rê chuột. */
const HINT_MS = 6000;
const HINT_KEY = 'assistant-hint-shown';

/**
 * Bong bóng chat tròn mở trợ lý mua hàng. Riêng nút này tròn dù web dùng góc 4px:
 * chủ dự án muốn đúng kiểu bong bóng chat quen mắt (12/11), người mua nhận ra ngay
 * đó là chỗ hỏi. Chỉ hiện khi backend báo đã bật (GET /assistant/status): staging
 * bật, prod chưa bật thì không xuất hiện.
 */
export function AssistantLauncher() {
  const t = useTranslations('assistant');
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    let alive = true;
    void assistantService.isEnabled().then((on) => alive && setEnabled(on));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(HINT_KEY) === '1';
      sessionStorage.setItem(HINT_KEY, '1');
    } catch {
      // Trình duyệt chặn lưu trữ: cứ hiện nhãn, không sao.
    }
    if (seen) return;
    setHint(true);
    const timer = setTimeout(() => setHint(false), HINT_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  if (!enabled || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
      <div className="group fixed bottom-4 right-4 z-50 flex items-center gap-3">
        {!open && (
          <span
            aria-hidden="true"
            className={`pointer-events-none hidden rounded-control border border-ink/10 bg-surface-card px-3 py-2 text-small font-medium text-ink shadow-md transition-opacity duration-200 motion-reduce:transition-none sm:block ${
              hint ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            }`}
          >
            {t('open')}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setHint(false);
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          aria-label={open ? t('close') : t('open')}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
          {!open && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-price text-white">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}
