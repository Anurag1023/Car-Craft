"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } = useCart();

  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 149;
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore our curated catalog of automotive accessories, electronics, and spare parts.
          </p>
        </div>
        <Link href="/accessories">
          <Button size="lg" className="font-bold">
            Browse Accessories Store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">Review your selected automotive items before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          <div className="p-4 sm:p-6 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {itemCount} {itemCount === 1 ? "Item" : "Items"} in Cart
            </span>
            <button
              onClick={clearCart}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Product Thumbnail */}
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200&auto=format&fit=crop&q=80"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                <p className="text-xs text-slate-500 font-medium">Unit Price: {formatPrice(item.price)}</p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line Total */}
              <div className="text-right shrink-0 min-w-[100px]">
                <p className="font-black text-slate-900 text-base">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFromCart(item.productId)}
                className="p-2 text-slate-400 hover:text-rose-600 transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-slate-800">
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase text-[10px]">Free Delivery</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-xl font-black text-slate-900">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Link href="/checkout" className="block">
            <Button size="lg" className="w-full font-bold shadow-lg shadow-blue-500/20 gap-2">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <div className="space-y-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulated Safe Checkout with Mock Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free express shipping on all orders over ₹1,999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
