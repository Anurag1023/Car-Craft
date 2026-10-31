import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { ServiceManagerTable } from "@/components/services/service-manager-table";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  await requireRole([Role.ADMIN]);

  const appointments = await prisma.serviceAppointment.findMany({
    include: {
      serviceCategory: true,
      customer: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workshop Operations Oversight</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform-wide service appointments across all franchise dealerships ({appointments.length} appointments)
        </p>
      </div>

      <ServiceManagerTable appointments={appointments} />
    </div>
  );
}
