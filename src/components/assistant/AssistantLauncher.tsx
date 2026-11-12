"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Sparkles, X } from 'lucide-react';
import { assistantService } from '@/services/assistant.service';
import { AssistantPanel } from './AssistantPanel';

/**
 * Trang không hiện nút trợ lý: đang đặt hàng, đang trả tiền thì nút nổi chỉ
 * làm người mua phân tâm và che mất nút Đặt hàng trên màn nhỏ.
 */
const HIDDEN_ON = ['/checkout', '/payment', '/login', '/register', '/forgot-password', '/reset-password', '/maintenance'];

/**
 * Nút nổi mở trợ lý mua hàng. Chỉ hiện khi backend báo đã bật
 * (GET /assistant/status): staging bật, prod chưa bật thì nút không xuất hiện,
 * không cần build web riêng cho từng môi trường.
 */
export function AssistantLauncher() {
  const t = useTranslations('assistant');
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    void assistantService.isEnabled().then((on) => alive && setEnabled(on));
    return () => {
      alive = false;
    };
  }, []);

  if (!enabled || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('close') : t('open')}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-control bg-brand px-4 py-3 text-small font-semibold text-white shadow-lg hover:bg-brand-dark"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span>{open ? t('close') : t('open')}</span>
      </button>
    </>
  );
}
