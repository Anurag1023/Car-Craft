import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role, AppointmentStatus } from "@prisma/client";
import { Wrench, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ServiceManagerTable } from "@/components/services/service-manager-table";

export const dynamic = "force-dynamic";

export default async function ServiceManagerDashboardPage() {
  const session = await requireRole([Role.SERVICE_MANAGER, Role.ADMIN]);

  let dealershipId = session.user.dealershipId;
  if (!dealershipId) {
    const d = await prisma.dealership.findFirst();
    dealershipId = d?.id || "";
  }

  const dealership = await prisma.dealership.findUnique({
    where: { id: dealershipId },
  });

  const appointments = await prisma.serviceAppointment.findMany({
    where: { dealershipId },
    include: {
      serviceCategory: true,
      customer: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = appointments.filter((a) => a.status === AppointmentStatus.PENDING).length;
  const confirmedCount = appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length;
  const inProgressCount = appointments.filter((a) => a.status === AppointmentStatus.IN_PROGRESS).length;
  const completedCount = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Wrench className="w-4 h-4" />
          <span>Workshop Manager Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Bay Dispatch & Service Operations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Showroom Workshop: <strong>{dealership?.name || "Flagship Hub"}</strong> ({dealership?.city})
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-amber-600">Pending Requests</span>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[10px] text-slate-400">Needs bay confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-blue-600">Confirmed Slots</span>
          <p className="text-2xl font-black text-blue-600">{confirmedCount}</p>
          <p className="text-[10px] text-slate-400">Ready for vehicle check-in</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-purple-600">In Workshop Bay</span>
          <p className="text-2xl font-black text-purple-600">{inProgressCount}</p>
          <p className="text-[10px] text-slate-400">Active repairs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-emerald-600">Completed Jobs</span>
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          <p className="text-[10px] text-slate-400">Inspected & billed</p>
        </div>
      </div>

      {/* Interactive Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Service Queue</h2>
            <p className="text-xs text-slate-500">
              Accept appointments, assign technician notes, and progress job status
            </p>
          </div>
        </div>

        <ServiceManagerTable appointments={appointments} />
      </div>
    </div>
  );
}
