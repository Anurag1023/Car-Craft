import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role, InventoryStatus } from "@prisma/client";
import { formatPriceCompact, formatDateTime, formatNumber } from "@/lib/utils";
import { Car, MessageSquare, Calendar, ShieldCheck, Plus, ArrowRight, Eye, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DealerDashboardPage() {
  const session = await requireRole([Role.DEALER, Role.ADMIN]);

  // If dealer has no assigned dealership, find their first managed dealership or fallback
  let dealershipId = session.user.dealershipId;
  if (!dealershipId) {
    const d = await prisma.dealership.findFirst({
      where: { assignedDealerId: session.user.id },
    });
    dealershipId = d?.id || (await prisma.dealership.findFirst())?.id;
  }

  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId },
    include: {
      vehicles: {
        include: { images: true },
        orderBy: { createdAt: "desc" },
      },
      appointments: {
        take: 5,
        orderBy: { preferredDate: "asc" },
      },
    },
  });

  if (!dealership) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">No Dealership Assigned</h2>
        <p className="text-xs text-slate-500 mt-1">Please contact platform administrator to assign a showroom.</p>
      </div>
    );
  }

  // Fetch inquiries for vehicles belonging to this dealership
  const inquiries = await prisma.vehicleInquiry.findMany({
    where: {
      vehicle: {
        dealershipId: dealership.id,
      },
    },
    include: {
      vehicle: { select: { brand: true, model: true } },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const availableCount = dealership.vehicles.filter((v) => v.inventoryStatus === InventoryStatus.AVAILABLE).length;
  const reservedCount = dealership.vehicles.filter((v) => v.inventoryStatus === InventoryStatus.RESERVED).length;
  const soldCount = dealership.vehicles.filter((v) => v.inventoryStatus === InventoryStatus.SOLD).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Showroom Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {dealership.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {dealership.address}, {dealership.city} • Working Hours: {dealership.operatingHours}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dealer/vehicles/new">
            <Button size="sm" className="gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              Add New Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Showroom Fleet</span>
          <p className="text-2xl font-black text-slate-900">{dealership.vehicles.length}</p>
          <p className="text-[10px] text-slate-400">Total listed cars</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-emerald-600">Available Stock</span>
          <p className="text-2xl font-black text-emerald-600">{availableCount}</p>
          <p className="text-[10px] text-slate-400">Ready for delivery</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-amber-600">Reserved Cars</span>
          <p className="text-2xl font-black text-amber-600">{reservedCount}</p>
          <p className="text-[10px] text-slate-400">Buyer deposit active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-blue-600">Customer Inquiries</span>
          <p className="text-2xl font-black text-blue-600">{inquiries.length}</p>
          <p className="text-[10px] text-slate-400">Test drive & pricing leads</p>
        </div>
      </div>

      {/* Vehicles & Inquiries Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Vehicle Inventory List (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Showroom Vehicle Inventory</h3>
              <p className="text-[11px] text-slate-400">Manage cars listed at your dealership</p>
            </div>
            <Link href="/dealer/vehicles" className="text-xs font-semibold text-blue-600 hover:underline">
              View All ({dealership.vehicles.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-semibold">Vehicle</th>
                  <th className="pb-2 font-semibold">Specs</th>
                  <th className="pb-2 font-semibold">Price</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dealership.vehicles.slice(0, 6).map((veh) => (
                  <tr key={veh.id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={veh.images[0]?.url || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&auto=format&fit=crop&q=80"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{veh.brand} {veh.model}</p>
                          <p className="text-[10px] text-slate-400">{veh.year} • {veh.bodyType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {veh.fuelType} • {veh.transmission}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {formatPriceCompact(veh.price)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        veh.inventoryStatus === InventoryStatus.AVAILABLE
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : veh.inventoryStatus === InventoryStatus.RESERVED
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {veh.inventoryStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/vehicles/${veh.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Leads & Inquiries (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Leads</h3>
              <p className="text-[11px] text-slate-400">Direct vehicle inquiries</p>
            </div>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>

          {inquiries.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No recent inquiries.</p>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{inq.name}</span>
                    <Badge variant="outline" className="text-[9px] uppercase">{inq.status}</Badge>
                  </div>
                  <p className="text-[11px] font-semibold text-blue-600">
                    Interested in {inq.vehicle.brand} {inq.vehicle.model}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic leading-relaxed">
                    &ldquo;{inq.message}&rdquo;
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{inq.phone}</span>
                    <span>{formatDateTime(inq.createdAt)}</span>
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
