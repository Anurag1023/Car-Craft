"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./toast-provider";

export interface CartItemType {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stockQuantity: number;
}

interface CartContextValue {
  items: CartItemType[];
  addToCart: (product: { id: string; name: string; price: number; image?: string; stockQuantity: number }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const { data: session } = useSession();
  const toast = useToast();

  // Load from local storage initially
  useEffect(() => {
    try {
      const saved = localStorage.getItem("carcraft_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem("carcraft_cart", JSON.stringify(items));
    } catch {
      // Ignore local storage error
    }
  }, [items]);

  const addToCart = (
    product: { id: string; name: string; price: number; image?: string; stockQuantity: number },
    quantity = 1
  ) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        if (newQty === existing.quantity && existing.quantity >= product.stockQuantity) {
          toast.error("Stock Limit Reached", `Maximum available stock is ${product.stockQuantity}`);
          return prev;
        }
        toast.success("Cart Updated", `${product.name} quantity increased to ${newQty}`);
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: newQty } : i));
      } else {
        const initialQty = Math.min(quantity, product.stockQuantity);
        if (product.stockQuantity < 1) {
          toast.error("Out of Stock", "This product is currently out of stock");
          return prev;
        }
        toast.success("Added to Cart", `${product.name} added to your cart`);
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: initialQty,
            stockQuantity: product.stockQuantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.productId !== productId);
      toast.info("Item Removed", "Product removed from cart");
      return filtered;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          const clamped = Math.min(quantity, i.stockQuantity);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
