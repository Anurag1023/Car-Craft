"use client";

import React from "react";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";
import { CartProvider } from "./cart-provider";
import { CompareProvider } from "./compare-provider";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <CompareProvider>{children}</CompareProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
