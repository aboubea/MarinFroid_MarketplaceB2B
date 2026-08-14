import { createContext, useCallback, useContext, useState } from "react";
import { apiFetch } from "./api";

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
}

interface CartContextValue {
  count: number;
  items: CartItem[];
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setItemQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: CartItem[] }>("/api/mobile/cart");
      setItems(data.items);
      setCount(data.items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      setItems([]);
      setCount(0);
    }
  }, []);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const data = await apiFetch<{ count: number; items: CartItem[] }>("/api/mobile/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    setItems(data.items);
    setCount(data.count);
  }, []);

  const setItemQuantity = useCallback(async (productId: string, quantity: number) => {
    const data = await apiFetch<{ count: number; items: CartItem[] }>("/api/mobile/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, mode: "set" }),
    });
    setItems(data.items);
    setCount(data.count);
  }, []);

  return (
    <CartContext.Provider value={{ count, items, refresh, addItem, setItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
