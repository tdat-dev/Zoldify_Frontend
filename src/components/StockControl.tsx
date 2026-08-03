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
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className="min-w-[18px] text-center text-[11px] font-semibold text-gray-700 tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center border border-gray-300 rounded-md overflow-hidden ${className}`}>
        <button
          type="button"
          onClick={dec}
          disabled={disabled || value <= min}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={value}
          readOnly
          className="w-12 h-8 text-center text-sm border-x border-gray-300 focus:outline-none bg-white"
        />
        <button
          type="button"
          onClick={inc}
          disabled={disabled || value >= max}
          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
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
        className="w-11 h-11 rounded-l-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-semibold"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        readOnly
        className="w-20 h-11 border-y border-slate-200 text-center text-sm font-medium focus:outline-none bg-white"
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        className="w-11 h-11 rounded-r-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-semibold"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
