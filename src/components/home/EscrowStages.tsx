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
        {STAGES.map((s, i) => {
          const isRefundStage = i === 2;
          const showPriceExample = isRefundStage && !!firstPrice;
          // Đích dự phòng của Task 6 (useCoinJourney) khi chưa có [data-coin-target]
          // thật (Task 7): trước đây neo vào TOÀN BỘ thẻ <li>, khiến "hạ cánh ngay
          // dưới đích" đặt xu hẳn ra NGOÀI thẻ, trôi lơ lửng trong khoảng trống xám
          // — không đọc được là "tiền tới nơi". Sửa bằng cách neo vào phần tử NỘI
          // DUNG CUỐI CÙNG bên trong thẻ (đoạn mô tả, hoặc dòng "Ví dụ..." nếu có
          // giá thật) thay vì cả hộp <li> — cùng cơ chế đã dùng cho đích thật (giá
          // sản phẩm, một <span> nhỏ nằm trong thẻ), nên xu "hạ cánh ngay dưới" nó
          // vẫn còn nằm phần lớn trong vùng padding của thẻ rồi tràn nhẹ ra mép —
          // một cú straddle giống hệt đường có dữ liệu thật, không phải trôi ra
          // ngoài. Không đổi chữ hay layout, chỉ gắn thêm data-attribute.
          return (
            <li
              key={s.key}
              data-escrow-stage={s.key}
              className="relative rounded-sm bg-surface-card p-6 shadow-sm"
            >
              <span className="label-condensed text-brand">Chặng {i + 1}</span>
              <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
              <p
                className="mt-2 text-sm leading-relaxed text-ink-muted"
                {...(isRefundStage && !showPriceExample ? { 'data-coin-landing-marker': '' } : {})}
              >
                {s.body}
              </p>
              {showPriceExample && (
                <p className="mt-4 text-sm text-ink" data-coin-landing-marker="">
                  Ví dụ với món rẻ nhất đang bán: <span className="price-figure text-brand">{firstPrice}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
