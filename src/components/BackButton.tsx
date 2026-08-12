'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BackButton({ href = '/admin', label }: { href?: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 active:scale-95 transition-all"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}
