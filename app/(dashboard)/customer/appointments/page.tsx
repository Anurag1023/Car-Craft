import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { CustomerAppointmentList } from "@/components/appointments/customer-appointment-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerAppointmentsPage() {
  const session = await requireAuth();

  const appointments = await prisma.serviceAppointment.findMany({
    where: { customerId: session.user.id },
    include: {
      dealership: true,
      serviceCategory: true,
    },
    orderBy: { preferredDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your booked workshop maintenance visits
          </p>
        </div>

        <Link href="/services">
          <Button size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            Book New Service
          </Button>
        </Link>
      </div>

      <CustomerAppointmentList appointments={appointments} />
    </div>
  );
}
