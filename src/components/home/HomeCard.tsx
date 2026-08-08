import Link from 'next/link';

/**
 * Thẻ trắng trong lưới trang chủ, theo đúng khuôn của amazon.com (xem
 * 2026-08-08): tiêu đề đậm cỡ lớn ở trên, nội dung ở giữa, một link màu xanh ở
 * đáy thẻ. Thẻ dính đáy lưới nhờ h-full + flex-col, nên các link đáy thẳng hàng
 * nhau dù nội dung bên trên cao thấp khác nhau.
 */
export function HomeCard({
  id,
  title,
  href,
  linkText,
  children,
}: {
  id: string;
  title: string;
  href?: string;
  linkText?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex h-full flex-col rounded-card bg-surface-card p-5"
    >
      <h2 id={id} className="mb-3 text-[19px] font-bold leading-snug text-ink md:text-[21px]">
        {title}
      </h2>
      <div className="flex-1">{children}</div>
      {href && linkText && (
        <Link
          href={href}
          className="mt-4 inline-block text-small text-brand hover:text-brand-dark hover:underline"
        >
          {linkText}
        </Link>
      )}
    </section>
  );
}
