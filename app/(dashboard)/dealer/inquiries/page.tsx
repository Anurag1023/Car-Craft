import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { MessageSquare, Phone, Mail, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DealerInquiriesPage() {
  const session = await requireRole([Role.DEALER, Role.ADMIN]);

  let dealershipId = session.user.dealershipId;
  if (!dealershipId) {
    const d = await prisma.dealership.findFirst();
    dealershipId = d?.id || "";
  }

  const inquiries = await prisma.vehicleInquiry.findMany({
    where: session.user.role === Role.ADMIN ? {} : {
      vehicle: { dealershipId },
    },
    include: {
      vehicle: {
        include: { dealership: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Vehicle Inquiries</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Leads and test-drive inquiries for showroom vehicles
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No customer inquiries received yet.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{inq.name}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">{inq.status}</Badge>
                </div>
                <span className="text-slate-400 text-xs">{formatDateTime(inq.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <Car className="w-4 h-4" />
                <span>Vehicle: {inq.vehicle.brand} {inq.vehicle.model} ({inq.vehicle.dealership.name})</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                &ldquo;{inq.message}&rdquo;
              </div>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{inq.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{inq.email}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
