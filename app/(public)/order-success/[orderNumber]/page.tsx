import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface OrderSuccessProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      payment: true,
      customer: {
        select: { name: true, email: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <Badge variant="success" className="mb-2">Payment Simulated Successfully</Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Thank you, {order.shippingName}. Your automotive accessories order has been placed in the CarCraft system.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
          <span>Order No:</span>
          <span className="font-bold text-blue-600">{order.orderNumber}</span>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Order Receipt</h3>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
          </div>
          <Badge variant="outline" className="font-semibold">{order.orderStatus}</Badge>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{item.productName}</p>
                <p className="text-slate-400 text-[11px]">Quantity: {item.quantity}</p>
              </div>
              <span className="font-bold text-slate-900">{formatPrice(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Pricing Totals */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
            <span className="font-bold text-sm text-slate-900">Total Paid</span>
            <span className="font-black text-xl text-blue-600">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Payment info */}
        {order.payment && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Simulated Payment Method:</span>
              <span className="font-bold uppercase text-slate-900">{order.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-700">Transaction Reference:</span>
              <span className="font-mono text-slate-800">{order.payment.transactionRef}</span>
            </div>
          </div>
        )}

        {/* Shipping Destination */}
        <div className="border-t border-slate-100 pt-4 space-y-1 text-xs text-slate-600">
          <span className="font-bold text-slate-800 block">Shipping Destination:</span>
          <p>{order.shippingName}</p>
          <p>{order.shippingAddress}</p>
          <p>{order.city}, {order.state} - {order.postalCode}</p>
          <p>Contact Phone: {order.phone}</p>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/customer/orders" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2 text-xs">
            <ShoppingBag className="w-4 h-4" />
            View in My Orders
          </Button>
        </Link>

        <Link href="/accessories" className="w-full sm:w-auto">
          <Button className="w-full gap-2 text-xs font-bold">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
