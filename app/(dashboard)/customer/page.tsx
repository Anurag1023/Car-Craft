import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { 
  User, 
  ShoppingBag, 
  Calendar, 
  Heart, 
  Clock, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await requireAuth();

  const [orders, appointments, wishlistItems] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: session.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.serviceAppointment.findMany({
      where: { customerId: session.user.id },
      include: {
        dealership: true,
        serviceCategory: true,
      },
      orderBy: { preferredDate: "desc" },
      take: 3,
    }),
    prisma.wishlistItem.findMany({
      where: { customerId: session.user.id },
      include: {
        vehicle: {
          include: { images: true, dealership: true },
        },
      },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <Badge className="bg-white/20 text-white border-none font-semibold">
            Customer Account Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xs text-blue-100 max-w-md">
            Track your vehicle inquiries, genuine accessory orders, scheduled dealership service visits, and saved cars.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/services">
            <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 font-bold">
              Book Service
            </Button>
          </Link>
          <Link href="/accessories">
            <Button size="sm" variant="secondary" className="bg-blue-800 text-white hover:bg-blue-900 font-semibold">
              Browse Store
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Accessory Orders</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{orders.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Service Appointments</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{appointments.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Saved Vehicles</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{wishlistItems.length}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Orders & Service Bookings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Accessory Orders</h3>
              <p className="text-[11px] text-slate-400">Track shipments and items</p>
            </div>
            <Link href="/customer/orders" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                    <Badge variant="outline" className="text-[10px]">{ord.orderStatus}</Badge>
                  </div>
                  <div className="text-slate-600">
                    {ord.items.map((i) => i.productName).join(", ")}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-semibold">
                    <span className="text-slate-400 text-[11px]">{formatDateTime(ord.createdAt)}</span>
                    <span className="text-slate-900 font-bold">{formatPrice(ord.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Service Bay Bookings</h3>
              <p className="text-[11px] text-slate-400">Scheduled vehicle maintenance</p>
            </div>
            <Link href="/customer/appointments" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No service appointments booked.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{appt.serviceCategory.name}</span>
                    <Badge variant="default" className="text-[10px] bg-blue-600">{appt.status}</Badge>
                  </div>
                  <p className="text-slate-600">
                    {appt.vehicleBrand} {appt.vehicleModel} ({appt.vehicleRegistration})
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {appt.dealership.name}
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatDate(appt.preferredDate)} • {appt.preferredTimeSlot}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
