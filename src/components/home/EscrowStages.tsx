const STAGES = [
  {
    key: 'pay',
    title: 'Bạn trả tiền',
    body: 'Tiền vào Zoldify khi đơn được thanh toán, không vào thẳng túi người bán.',
  },
  {
    key: 'hold',
    title: 'Zoldify giữ',
    body: 'Trong lúc hàng đang đi, tiền đứng lại ở đây. Người bán thấy đơn nhưng chưa rút được.',
  },
  {
    key: 'refund',
    title: 'Huỷ đơn, tiền quay lại',
    body: 'Khi đơn còn chờ người bán xác nhận, bạn bấm huỷ là tiền hoàn về tài khoản của bạn.',
  },
];

export function EscrowStages({ firstPrice }: { firstPrice?: string }) {
  return (
    <section aria-labelledby="escrow-how" className="py-14 md:py-20">
      <h2 id="escrow-how" className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-extrabold text-ink [text-wrap:balance]" style={{ fontVariationSettings: "'wdth' 112" }}>
        Tiền đi đường nào
      </h2>

      <ol className="mt-9 grid gap-6 md:grid-cols-3">
        {STAGES.map((s, i) => (
          <li
            key={s.key}
            data-escrow-stage={s.key}
            className="relative rounded-sm bg-surface-card p-6 shadow-sm"
          >
            <span className="label-condensed text-brand">Chặng {i + 1}</span>
            <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            {i === 2 && firstPrice && (
              <p className="mt-4 text-sm text-ink">
                Ví dụ với món rẻ nhất đang bán: <span className="price-figure text-brand">{firstPrice}</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
