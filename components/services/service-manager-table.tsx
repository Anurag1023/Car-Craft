"use client";

import { useState } from "react";
import { ServiceAppointment, ServiceCategory, User, AppointmentStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { CheckCircle2, Clock, Play, Check, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  appointments: (ServiceAppointment & {
    serviceCategory: ServiceCategory;
    customer: { name: string; phone: string | null; email: string };
  })[];
}

export function ServiceManagerTable({ appointments: initialAppointments }: Props) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<{ id: string; notes: string } | null>(null);
  const toast = useToast();

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Status Update Failed", data.error);
        return;
      }

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      toast.success("Status Updated", data.message);
    } catch {
      toast.error("Error", "Could not update appointment status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedNotes) return;
    try {
      const res = await fetch(`/api/appointments/${selectedNotes.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceNotes: selectedNotes.notes }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === selectedNotes.id ? { ...a, serviceNotes: selectedNotes.notes } : a))
        );
        toast.success("Notes Saved", "Workshop technician notes updated");
        setSelectedNotes(null);
      }
    } catch {
      toast.error("Error", "Could not save notes");
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return <Badge variant="warning">Pending Approval</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="default" className="bg-blue-600">Confirmed</Badge>;
      case AppointmentStatus.IN_PROGRESS:
        return <Badge variant="default" className="bg-purple-600">In Bay / Repair</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="success">Completed</Badge>;
      case AppointmentStatus.REJECTED:
      case AppointmentStatus.CANCELLED:
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="p-4">Appt #</th>
              <th className="p-4">Customer & Vehicle</th>
              <th className="p-4">Service Package</th>
              <th className="p-4">Date & Slot</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Workshop Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No appointments registered for this workshop bay.
                </td>
              </tr>
            ) : (
              appointments.map((appt) => {
                const isLoading = loadingId === appt.id;
                return (
                  <tr key={appt.id} className="hover:bg-slate-50/40">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {appt.appointmentNumber}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{appt.customer.name}</p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        {appt.vehicleBrand} {appt.vehicleModel} ({appt.vehicleRegistration})
                      </p>
                      <p className="text-[10px] text-slate-400">{appt.customer.phone}</p>
                    </td>

                    <td className="p-4 font-medium text-slate-700">
                      {appt.serviceCategory.name}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">{formatDate(appt.preferredDate)}</p>
                      <p className="text-slate-500 text-[11px]">{appt.preferredTimeSlot}</p>
                    </td>

                    <td className="p-4">{getStatusBadge(appt.status)}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* PENDING -> CONFIRMED */}
                        {appt.status === AppointmentStatus.PENDING && (
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.CONFIRMED)}
                            className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 font-semibold"
                          >
                            Accept Bay
                          </Button>
                        )}

                        {/* CONFIRMED -> IN_PROGRESS */}
                        {appt.status === AppointmentStatus.CONFIRMED && (
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.IN_PROGRESS)}
                            className="h-8 text-[11px] bg-purple-600 hover:bg-purple-700 font-semibold"
                          >
                            Start Service
                          </Button>
                        )}

                        {/* IN_PROGRESS -> COMPLETED */}
                        {appt.status === AppointmentStatus.IN_PROGRESS && (
                          <Button
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.COMPLETED)}
                            className="h-8 text-[11px] bg-emerald-600 hover:bg-emerald-700 font-semibold"
                          >
                            Mark Done
                          </Button>
                        )}

                        {/* Reject button for pending */}
                        {appt.status === AppointmentStatus.PENDING && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isLoading}
                            onClick={() => handleUpdateStatus(appt.id, AppointmentStatus.REJECTED)}
                            className="h-8 text-[11px]"
                          >
                            Reject
                          </Button>
                        )}

                        {/* Notes button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedNotes({
                              id: appt.id,
                              notes: appt.serviceNotes || "",
                            })
                          }
                          className="h-8 text-[11px]"
                          title="Workshop Technician Notes"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Notes Dialog Modal */}
      {selectedNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Workshop Service Notes</h3>
            <textarea
              rows={4}
              value={selectedNotes.notes}
              onChange={(e) => setSelectedNotes({ ...selectedNotes, notes: e.target.value })}
              placeholder="e.g. Assigned to Bay 3. Oil drained, new OEM filter installed. Test drive satisfactory."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedNotes(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNotes} className="font-bold">
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
