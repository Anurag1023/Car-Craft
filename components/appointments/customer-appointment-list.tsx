"use client";

import { useState } from "react";
import { ServiceAppointment, ServiceCategory, Dealership, AppointmentStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { Building2, Calendar, Clock, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  appointments: (ServiceAppointment & {
    dealership: Dealership;
    serviceCategory: ServiceCategory;
  })[];
}

export function CustomerAppointmentList({ appointments: initial }: Props) {
  const [appointments, setAppointments] = useState(initial);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const toast = useToast();

  const handleCancel = async (id: string, apptNum: string) => {
    if (!confirm(`Are you sure you want to cancel appointment #${apptNum}?`)) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: AppointmentStatus.CANCELLED }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Cancellation Failed", data.error);
        return;
      }

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: AppointmentStatus.CANCELLED } : a))
      );
      toast.success("Appointment Cancelled", `Appointment #${apptNum} has been cancelled`);
    } catch {
      toast.error("Error", "Could not cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Badge variant="warning">Pending Confirmation</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="default" className="bg-blue-600">Confirmed</Badge>;
      case AppointmentStatus.IN_PROGRESS:
        return <Badge variant="default" className="bg-purple-600">In Workshop Bay</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.REJECTED:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">No service visits scheduled</h3>
        <p className="text-xs text-slate-500">Book certified periodic maintenance at any CarCraft showroom.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => {
        const canCancel =
          appt.status === AppointmentStatus.PENDING ||
          appt.status === AppointmentStatus.CONFIRMED;

        return (
          <div
            key={appt.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {appt.appointmentNumber}
                </span>
                <span className="font-bold text-blue-600 text-sm">
                  {appt.serviceCategory.name}
                </span>
              </div>
              <div className="flex items-center gap-2">{getStatusBadge(appt.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">Vehicle:</span>
                <span className="font-bold text-slate-900">
                  {appt.vehicleBrand} {appt.vehicleModel}
                </span>
                <p className="font-mono text-slate-500 text-[10px]">{appt.vehicleRegistration}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Workshop Dealership:</span>
                <span className="font-bold text-slate-900">{appt.dealership.name}</span>
                <p className="text-slate-500 text-[10px]">{appt.dealership.city}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Reserved Date & Time:</span>
                <span className="font-bold text-slate-900">{formatDate(appt.preferredDate)}</span>
                <p className="text-slate-500 text-[10px]">{appt.preferredTimeSlot}</p>
              </div>

              {appt.serviceNotes && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Technician Notes:</span>
                  <span className="text-slate-700 italic text-[11px]">{appt.serviceNotes}</span>
                </div>
              )}
            </div>

            {canCancel && (
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={cancellingId === appt.id}
                  onClick={() => handleCancel(appt.id, appt.appointmentNumber)}
                  className="text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Cancel Booking
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
