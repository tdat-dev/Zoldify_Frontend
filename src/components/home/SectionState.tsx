import { AlertCircle, Loader } from 'lucide-react';

export type LoadState = 'loading' | 'ready' | 'error';

export function SectionState({ state, empty }: { state: LoadState; empty: boolean }) {
  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-ink-muted text-sm">
        <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
        Đang tải…
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-ink text-sm">
        <AlertCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
        Không tải được dữ liệu. Kiểm tra kết nối rồi tải lại trang.
      </div>
    );
  }
  if (empty) {
    return <p className="py-10 text-center text-sm text-ink-muted">Chưa có sản phẩm nào ở đây.</p>;
  }
  return null;
}
