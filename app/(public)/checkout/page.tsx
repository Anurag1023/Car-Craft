"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatPrice } from "@/lib/utils";
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const toast = useToast();

  const shipping = subtotal > 1999 ? 0 : 149;
  const grandTotal = subtotal + shipping;

  const [shippingName, setShippingName] = useState(session?.user?.name || "");
  const [shippingAddress, setShippingAddress] = useState("Flat 402, High Street Towers");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");
  const [phone, setPhone] = useState("+91 98765 43210");

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD" | "COD">("UPI");
  const [simulationOutcome, setSimulationOutcome] = useState<"SUCCESS" | "FAIL" | "CANCEL">("SUCCESS");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/accessories">
          <Button>Return to Store</Button>
        </Link>
      </div>
    );
  }

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName,
          shippingAddress,
          city,
          state,
          postalCode,
          phone,
          paymentMethod,
          simulationOutcome,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order failed");
        toast.error("Checkout Failed", data.error || "Please try again");
        setIsLoading(false);
        return;
      }

      toast.success("Order Placed Successfully", `Order #${data.orderNumber} confirmed!`);
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setError("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/cart" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Demonstration Gateway
          </h1>
          <p className="text-xs text-slate-500">Secure simulated order placement</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Details & Payment Selector (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Shipping Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>1. Shipping & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sName">Full Recipient Name</Label>
                <Input
                  id="sName"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sPhone">Contact Phone Number</Label>
                <Input
                  id="sPhone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="sAddr">Street Address / Landmark</Label>
                <Input
                  id="sAddr"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sCity">City</Label>
                <Input
                  id="sCity"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sState">State</Label>
                <Input
                  id="sState"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sPin">PIN / Postal Code</Label>
                <Input
                  id="sPin"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 2. Mock Payment Gateway */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Demonstration Gateway
              </div>
              <h3 className="font-bold text-slate-900 text-base">2. Simulated Payment Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                No real bank or card transaction will occur. Select a test payment channel below.
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setPaymentMethod("UPI")}
                className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === "UPI"
                    ? "border-blue-600 bg-blue-50/50 text-blue-950"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <QrCode className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs">Simulated UPI</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Instant virtual UPI approval</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === "CARD"
                    ? "border-blue-600 bg-blue-50/50 text-blue-950"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                <div>
                  <h4 className="font-bold text-xs">Simulated Card</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Mock Credit / Debit checkout</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === "COD"
                    ? "border-blue-600 bg-blue-50/50 text-blue-950"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <Banknote className="w-5 h-5 text-blue-600 mb-2" />
                <div>
                  <h4 className="font-bold text-xs">Cash on Delivery</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pay upon package doorstep</p>
                </div>
              </label>
            </div>

            {/* Test Simulation Controls */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Sandbox Simulation Outcome Switcher:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSimulationOutcome("SUCCESS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    simulationOutcome === "SUCCESS"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  ✓ Simulate Success (200 OK)
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationOutcome("FAIL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    simulationOutcome === "FAIL"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  ✕ Simulate Declined / Error
                </button>

                <button
                  type="button"
                  onClick={() => setSimulationOutcome("CANCEL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    simulationOutcome === "CANCEL"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700"
                  }`}
                >
                  ⊘ Simulate User Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                You can test handling of failed or cancelled payments using the buttons above.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Review Items ({items.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-slate-800 truncate">{i.name}</p>
                  <p className="text-slate-400 text-[10px]">Qty: {i.quantity} × {formatPrice(i.price)}</p>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-800">
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Final Total</span>
              <span className="font-black text-xl text-blue-600">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold shadow-lg" isLoading={isLoading}>
            <Lock className="w-4 h-4 mr-2" />
            Confirm Simulated Order ({formatPrice(grandTotal)})
          </Button>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            By confirming, you agree that this transaction is purely demonstrative and local to the CarCraft environment.
          </p>
        </div>
      </form>
    </div>
  );
}
