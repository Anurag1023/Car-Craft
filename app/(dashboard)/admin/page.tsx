import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role, OrderStatus, FuelType } from "@prisma/client";
import { formatPrice, formatPriceCompact, formatDateTime } from "@/lib/utils";
import { 
  Users, 
  Building2, 
  Car, 
  ShoppingBag, 
  FileText, 
  IndianRupee, 
  Wrench, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminCharts } from "@/components/dashboard/admin-charts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole([Role.ADMIN]);

  const [
    totalCustomers,
    totalDealerships,
    totalVehicles,
    availableVehicles,
    totalProducts,
    totalOrders,
    revenueAgg,
    pendingAppointments,
    recentOrders,
    recentLogs,
    vehiclesByFuel,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.dealership.count(),
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { inventoryStatus: "AVAILABLE" } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.serviceAppointment.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      take: 5,
      include: {
        customer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityLog.findMany({
      take: 6,
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vehicle.groupBy({
      by: ["fuelType"],
      _count: { id: true },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total || 0;

  const fuelDistribution = vehiclesByFuel.map((item) => ({
    name: item.fuelType,
    count: item._count.id,
  }));

  const revenueData = [
    { month: "Jan", revenue: 12500 },
    { month: "Feb", revenue: 19800 },
    { month: "Mar", revenue: 24200 },
    { month: "Apr", revenue: 31500 },
    { month: "May", revenue: 28900 },
    { month: "Current", revenue: totalRevenue },
  ];

  const kpis = [
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Dealerships", value: totalDealerships, icon: Building2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Vehicles in Fleet", value: `${availableVehicles} / ${totalVehicles}`, sub: "Available / Total", icon: Car, color: "text-indigo-600 bg-indigo-50" },
    { label: "Catalog Products", value: totalProducts, icon: ShoppingBag, color: "text-amber-600 bg-amber-50" },
    { label: "Accessory Orders", value: totalOrders, icon: FileText, color: "text-cyan-600 bg-cyan-50" },
    { label: "Total Store Revenue", value: formatPriceCompact(totalRevenue), sub: "All time accessories", icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
    { label: "Pending Service Bay", value: pendingAppointments, sub: "Action required", icon: Wrench, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Platform Executive Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics and management across all dealerships and operations
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                {kpi.sub && <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <AdminCharts
        fuelDistribution={fuelDistribution}
        orderStatusDistribution={[]}
        revenueData={revenueData}
      />

      {/* Tables: Recent Orders & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-[11px] text-slate-400">Latest accessories transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-semibold">Order</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold font-mono text-slate-800">{ord.orderNumber}</td>
                    <td className="py-2.5 text-slate-700">{ord.shippingName}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-900 text-right">
                      {formatPrice(ord.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform Activity Audit</h3>
              <p className="text-[11px] text-slate-400">Real-time system events</p>
            </div>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  {log.user?.role?.charAt(0) || "S"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">
                    {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    By {log.user?.name || "System"} • {formatDateTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
