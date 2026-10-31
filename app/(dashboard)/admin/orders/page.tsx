import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { AdminOrdersTable } from "@/components/orders/admin-orders-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireRole([Role.ADMIN]);

  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accessory & Parts Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fulfill customer orders, inspect transactions and manage dispatch pipelines
        </p>
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}
