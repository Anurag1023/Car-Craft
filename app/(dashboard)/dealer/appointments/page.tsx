import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Calendar, Building2, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DealerAppointmentsPage() {
  const session = await requireRole([Role.DEALER, Role.ADMIN]);

  let dealershipId = session.user.dealershipId;
  if (!dealershipId) {
    const d = await prisma.dealership.findFirst();
    dealershipId = d?.id || "";
  }

  const appointments = await prisma.serviceAppointment.findMany({
    where: session.user.role === Role.ADMIN ? {} : { dealershipId },
    include: {
      serviceCategory: true,
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { preferredDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dealership Workshop Visits</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Service visits scheduled at your dealership facility
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="p-4">Appt #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Service Category</th>
              <th className="p-4">Date & Slot</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No appointments booked yet at this facility.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-800">{a.appointmentNumber}</td>
                  <td className="p-4 font-medium text-slate-900">{a.customer.name}</td>
                  <td className="p-4 text-slate-700">
                    {a.vehicleBrand} {a.vehicleModel} ({a.vehicleRegistration})
                  </td>
                  <td className="p-4 text-slate-600">{a.serviceCategory.name}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {formatDate(a.preferredDate)} • {a.preferredTimeSlot}
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant="outline">{a.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
