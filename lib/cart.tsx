"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

const CART_STORAGE_KEY = "store_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.productId === "number");
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    persistCart(items);
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem(item, quantity = 1) {
        setItems((prev) => {
          const existing = prev.find((p) => p.productId === item.productId);
          if (!existing) {
            return [...prev, { ...item, quantity }];
          }
          return prev.map((p) =>
            p.productId === item.productId
              ? { ...p, quantity: p.quantity + quantity }
              : p,
          );
        });
      },
      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          setItems((prev) => prev.filter((p) => p.productId !== productId));
          return;
        }
        setItems((prev) =>
          prev.map((p) =>
            p.productId === productId ? { ...p, quantity } : p,
          ),
        );
      },
      removeItem(productId) {
        setItems((prev) => prev.filter((p) => p.productId !== productId));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, subtotal, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
