'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface StockControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  mini?: boolean;
}

export default function StockControl({
  value,
  onChange,
  min = 0,
  max = 99999,
  disabled = false,
  className = '',
  compact = false,
  mini = false,
}: StockControlProps) {
  const dec = () => {
    if (disabled) return;
    onChange(Math.max(min, value - 1));
  };
  const inc = () => {
    if (disabled) return;
    onChange(Math.min(max, value + 1));
  };

  if (mini) {
    return (
      <div
        className={`inline-flex items-center gap-0.5 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          className="w-5 h-5 rounded-full bg-surface-sunken hover:bg-ink/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-ink-muted"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className="min-w-[18px] text-center text-[11px] font-semibold text-ink-muted tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="w-5 h-5 rounded-full bg-surface-sunken hover:bg-ink/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-ink-muted"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center border border-ink/16 rounded-md overflow-hidden ${className}`}>
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          className="w-8 h-8 flex items-center justify-center bg-surface-sunken hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed text-ink-muted"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={value}
          readOnly
          className="w-12 h-8 text-center text-sm border-x border-ink/16 focus:outline-none bg-white"
        />
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="w-8 h-8 flex items-center justify-center bg-surface-sunken hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed text-ink-muted"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        className="w-11 h-11 rounded-l-xl bg-surface-sunken hover:bg-ink/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-ink-muted font-semibold"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        readOnly
        className="w-20 h-11 border-y border-ink/16 text-center text-sm font-medium focus:outline-none bg-white"
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        className="w-11 h-11 rounded-r-xl bg-surface-sunken hover:bg-ink/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-ink-muted font-semibold"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
