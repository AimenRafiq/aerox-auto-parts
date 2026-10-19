"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ExtendedProduct } from "@/lib/data/seed-fallback";

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
  stockQuantity: number;
  brandName?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoaded: boolean;
  addItem: (product: ExtendedProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "aerox_cart_v1";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // In case localStorage is blocked or corrupted
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota or privacy mode error
    }
  }, [items, isLoaded]);

  const addItem = useCallback(
    (product: ExtendedProduct, quantity: number = 1) => {
      if (product.stock_quantity <= 0) return;

      const primaryImage =
        product.images && product.images.length > 0
          ? product.images[0].storage_path
          : null;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.productId === product.id
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          const currentItem = updated[existingIndex];
          const newQuantity = Math.min(
            product.stock_quantity,
            currentItem.quantity + quantity
          );

          updated[existingIndex] = {
            ...currentItem,
            quantity: newQuantity,
            price: product.price, // Keep display price fresh
            stockQuantity: product.stock_quantity,
          };
          return updated;
        }

        const newItem: CartItem = {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          image: primaryImage,
          quantity: Math.min(product.stock_quantity, Math.max(1, quantity)),
          stockQuantity: product.stock_quantity,
          brandName: product.brand?.name,
        };

        return [...prevItems, newItem];
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prevItems) => {
        if (quantity <= 0) {
          return prevItems.filter((item) => item.productId !== productId);
        }

        return prevItems.map((item) => {
          if (item.productId === productId) {
            const safeQty = Math.min(item.stockQuantity, quantity);
            return { ...item, quantity: safeQty };
          }
          return item;
        });
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isLoaded,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, isLoaded, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

