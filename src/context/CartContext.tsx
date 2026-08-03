"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartService } from '@/services/cart.service';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await cartService.getAll(1, 100);
      const data = res.data?.data;
      const count = data?.meta?.total ?? data?.result?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) ?? 0;
      setCartCount(count);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCartCount();
    const interval = setInterval(refreshCartCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
