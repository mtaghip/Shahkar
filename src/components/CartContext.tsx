"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface CartState {
  count: number;
  add: () => void;
}

const CartContext = createContext<CartState>({ count: 0, add: () => {} });

const STORAGE_KEY = "shahkar-bag";

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  // Restore the bag count on mount (per-viewer convenience only).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setCount(parseInt(saved, 10) || 0);
    } catch {
      /* ignore unavailable storage */
    }
  }, []);

  const add = useCallback(() => {
    setCount((c) => {
      const next = c + 1;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore unavailable storage */
      }
      return next;
    });
  }, []);

  return (
    <CartContext.Provider value={{ count, add }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
