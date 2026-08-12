'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BackButton({ href = '/admin', label }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white border border-ink/16 rounded-lg text-sm font-medium text-ink-muted shadow-sm hover:bg-surface-sunken hover:border-ink/25 hover:text-ink active:scale-95 transition-all"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}
