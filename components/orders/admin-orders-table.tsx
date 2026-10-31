"use client";

import { useState } from "react";
import { Order, OrderItem, Payment, OrderStatus, PaymentStatus } from "@prisma/client";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";

interface Props {
  orders: (Order & {
    items: OrderItem[];
    payment: Payment | null;
  })[];
}

export function AdminOrdersTable({ orders: initial }: Props) {
  const [orders, setOrders] = useState(initial);
  const toast = useToast();

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Status Update Failed", data.error);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success("Order Updated", data.message);
    } catch {
      toast.error("Error", "Could not update order status");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
            <th className="p-4">Order #</th>
            <th className="p-4">Customer & City</th>
            <th className="p-4">Items Summary</th>
            <th className="p-4">Total & Payment</th>
            <th className="p-4">Fulfillment Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50/50">
              <td className="p-4">
                <p className="font-mono font-bold text-slate-900">{o.orderNumber}</p>
                <p className="text-[10px] text-slate-400">{formatDateTime(o.createdAt)}</p>
              </td>

              <td className="p-4">
                <p className="font-bold text-slate-800">{o.shippingName}</p>
                <p className="text-[11px] text-slate-400">{o.city}, {o.state}</p>
                <p className="text-[10px] text-slate-500">{o.phone}</p>
              </td>

              <td className="p-4">
                <div className="space-y-0.5 max-w-xs">
                  {o.items.map((i) => (
                    <p key={i.id} className="text-[11px] text-slate-700 truncate">
                      {i.quantity}x {i.productName}
                    </p>
                  ))}
                </div>
              </td>

              <td className="p-4">
                <p className="font-black text-slate-900 text-sm">{formatPrice(o.total)}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={o.paymentStatus === "PAID" ? "success" : "secondary"} className="text-[9px]">
                    {o.paymentStatus}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">
                    {o.payment?.method}
                  </span>
                </div>
              </td>

              <td className="p-4">
                <select
                  value={o.orderStatus}
                  onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                  className="h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
