import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { ShoppingBag, Truck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const session = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View all your accessories and spare parts orders
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any orders for automotive accessories yet.
          </p>
          <Link href="/accessories">
            <Button size="sm">Browse Store</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {ord.orderNumber}
                  </span>
                  <span className="text-slate-400 text-xs">
                    Placed on {formatDateTime(ord.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ord.orderStatus}</Badge>
                  <Badge variant={ord.paymentStatus === "PAID" ? "success" : "secondary"}>
                    {ord.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-100">
                {ord.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <p className="text-slate-400 text-[11px]">
                        Qty: {item.quantity} × {formatPrice(item.productPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                <div>
                  <span className="text-slate-400">Delivering to: </span>
                  <span className="font-semibold text-slate-800">
                    {ord.shippingAddress}, {ord.city}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500">Order Total:</span>
                  <span className="font-black text-slate-900 text-base">{formatPrice(ord.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
