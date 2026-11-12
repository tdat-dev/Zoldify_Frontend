"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Send, X } from 'lucide-react';
import { assistantService, type AssistantMessage, type AssistantProduct } from '@/services/assistant.service';
import { AssistantProductCard } from './AssistantProductCard';

interface Turn extends AssistantMessage {
  products?: AssistantProduct[];
}

/** Backend nhận tối đa 6 tin; giữ 6 tin cuối là đủ cho câu nối tiếp. */
const HISTORY_LIMIT = 6;

/**
 * Khung hội thoại. Mỗi lượt gửi cả lịch sử ngắn để trợ lý hiểu câu nối tiếp
 * ("rẻ hơn nữa", "ở Hà Nội thì sao"); thẻ món chỉ hiện ở lượt trả lời, không
 * gửi ngược lên server.
 */
export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations('assistant');
  const [turns, setTurns] = useState<Turn[]>([{ role: 'assistant', content: t('greeting') }]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns, loading]);

  const send = async (raw: string) => {
    const content = raw.trim().slice(0, 300);
    if (!content || loading) return;
    const next = [...turns, { role: 'user' as const, content }];
    setTurns(next);
    setText('');
    setLoading(true);
    try {
      // Bỏ lời chào mở đầu: nó không phải câu trả lời cho câu hỏi nào.
      const history = next.slice(1).slice(-HISTORY_LIMIT).map(({ role, content: c }) => ({ role, content: c }));
      const res = await assistantService.ask(history);
      setTurns((cur) => [...cur, { role: 'assistant', content: res.reply, products: res.products }]);
    } catch (err: any) {
      const msg = err.response?.status === 429 ? t('tooFast') : t('failed');
      setTurns((cur) => [...cur, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(text);
  };

  const examples = [t('example1'), t('example2'), t('example3')];
  return (
    <section
      role="dialog"
      aria-label={t('title')}
      className="fixed bottom-20 right-4 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-ink/16 bg-surface-page shadow-lg"
    >
      <header className="flex items-center justify-between border-b border-ink/10 bg-brand px-4 py-3 text-white">
        <div>
          <h2 className="text-body font-semibold">{t('title')}</h2>
          <p className="text-caption opacity-90">{t('subtitle')}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={t('close')} className="rounded-control p-1 hover:bg-white/15">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-live="polite">
        {turns.map((turn, i) => (
          <div key={i} className={turn.role === 'user' ? 'flex justify-end' : ''}>
            <p
              className={`inline-block max-w-[85%] whitespace-pre-line rounded-control px-3 py-2 text-small ${
                turn.role === 'user' ? 'bg-brand text-white' : 'border border-ink/10 bg-surface-card text-ink'
              }`}
            >
              {turn.content}
            </p>
            {turn.products && turn.products.length > 0 && (
              <ul className="mt-2 space-y-2">
                {turn.products.map((p) => (
                  <AssistantProductCard key={p.id} product={p} onNavigate={onClose} />
                ))}
              </ul>
            )}
          </div>
        ))}
        {turns.length === 1 && (
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => void send(ex)}
                className="rounded-control border border-ink/16 bg-surface-card px-2.5 py-1 text-caption text-ink hover:border-brand hover:text-brand"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <p className="flex items-center gap-2 text-caption text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {t('thinking')}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-ink/10 bg-surface-card p-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="min-w-0 flex-1 rounded-control border border-ink/16 px-3 py-2 text-small outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          aria-label={t('send')}
          className="rounded-control bg-brand px-3 text-white hover:bg-brand-dark disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
