export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Đang tải trang</span>
      <span
        aria-hidden="true"
        className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#2C67C8] animate-spin"
      />
    </div>
  );
}
