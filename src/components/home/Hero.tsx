"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

/**
 * Hero lấy Ô TÌM KIẾM làm nhân vật chính.
 *
 * Lý do đổi khỏi bản cũ: bản cũ bê nguyên bố cục một trang bán phụ kiện — chữ
 * trái / ảnh phải, dải "25K+ sinh viên · 4.9/5", huy hiệu tròn giảm giá. Sàn đồ
 * cũ sinh viên không có bộ sưu tập, không có khuyến mãi, và mỗi món chỉ có một
 * cái. Người vào đây là đang CẦN một món cụ thể, nên việc đầu tiên phải là gõ
 * tên món đó ra.
 *
 * Không còn con số nào bịa: file src/lib/demo.ts đã bị xoá cùng bản này.
 *
 * Gợi ý trong ô tìm kiếm xoay vòng theo TÊN DANH MỤC THẬT lấy từ API, không
 * phải danh sách tự nghĩ ra. Ai bật "giảm chuyển động" thì nó đứng yên.
 */
export function Hero({ categories }: { categories: any[] }) {
  const [q, setQ] = useState('');
  const [slot, setSlot] = useState(0);
  const router = useRouter();

  const names: string[] = categories
    .map((c) => c?.name)
    .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);

  useEffect(() => {
    if (names.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setSlot((s) => (s + 1) % names.length), 2800);
    return () => clearInterval(t);
  }, [names.length]);

  const placeholder = names.length
    ? `Tìm ${names[slot % names.length].toLowerCase()}…`
    : 'Tìm giáo trình, máy tính, xe đạp…';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <section aria-labelledby="hero-title" className="pt-8 md:pt-14">
      {/* Tiêu đề bị bó trong một cột chữ hẹp, còn ô tìm kiếm bên dưới chạy hết
          bề ngang — độ lệch đó là điểm nhấn bố cục của trang, thay cho việc mọi
          khối đều thẳng hàng trong cùng một khung. */}
      <h1
        id="hero-title"
        className="animate-rise max-w-[11ch] text-[clamp(2.5rem,7vw,5.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink [text-wrap:balance]"
      >
        Đồ cũ còn tốt, giá sinh viên
      </h1>

      <p className="animate-rise mt-5 max-w-[48ch] text-body text-ink-muted [animation-delay:60ms]">
        Giáo trình, laptop, đồ ký túc xá. Mua bán giữa sinh viên với nhau.
      </p>

      <form
        onSubmit={submit}
        role="search"
        className="animate-rise mt-8 [animation-delay:120ms] md:mt-10"
      >
        <label htmlFor="home-search" className="sr-only">
          Tìm đồ cũ đang bán
        </label>
        <div className="flex h-[60px] w-full items-center gap-3 rounded-full border border-ink/12 bg-surface-card pl-5 pr-2 transition-shadow focus-within:border-brand/50 focus-within:shadow-raise md:h-[76px] md:gap-4 md:pl-8 md:pr-3">
          <Search
            className="h-5 w-5 shrink-0 text-ink-faint md:h-6 md:w-6"
            aria-hidden="true"
          />
          <input
            id="home-search"
            type="search"
            name="q"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder-ink-faint focus:outline-none md:text-[19px]"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-full bg-brand px-6 text-small font-semibold text-white transition-[background-color,transform] hover:bg-brand-dark active:scale-[0.98] md:h-14 md:px-9 md:text-body"
          >
            Tìm
          </button>
        </div>
      </form>

      {/* Hàng lối tắt tràn qua mép phải khi hẹp: cuộn bên trong, không đẩy trang. */}
      {names.length > 0 && (
        <div className="-mr-4 mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:mt-5 md:mr-0 md:flex-wrap md:overflow-visible">
          <span className="shrink-0 text-small text-ink-faint">Hay tìm:</span>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug || cat.id}`}
              className="shrink-0 rounded-full border border-ink/12 px-3.5 py-1.5 text-small text-ink transition-colors hover:border-brand/40 hover:text-brand"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <p className="mt-7 text-small text-ink-muted md:mt-9">
        Có đồ không dùng nữa?{' '}
        <Link href="/product/create" className="font-semibold text-brand hover:text-brand-dark">
          Đăng bán
        </Link>
      </p>
    </section>
  );
}
