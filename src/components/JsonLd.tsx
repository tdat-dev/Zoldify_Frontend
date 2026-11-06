/**
 * Thoát `<`: tên tin do người bán gõ, chuỗi `</script>` trong đó sẽ đóng thẻ
 * script sớm và biến phần sau thành HTML chạy được trên trang.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
