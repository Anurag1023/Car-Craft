import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { Building2, Plus, MapPin, Phone, Mail, Car, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDealershipsPage() {
  await requireRole([Role.ADMIN]);

  const dealerships = await prisma.dealership.findMany({
    include: {
      assignedDealer: { select: { name: true, email: true } },
      _count: {
        select: {
          vehicles: true,
          appointments: true,
          staff: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dealership Network</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage franchise partner locations and assigned dealers
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="p-4">Dealership Name</th>
              <th className="p-4">City / State</th>
              <th className="p-4">Assigned Dealer</th>
              <th className="p-4">Vehicles</th>
              <th className="p-4">Appointments</th>
              <th className="p-4 text-right">Showroom Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dealerships.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <p className="font-bold text-slate-900 text-sm">{d.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{d.address}</p>
                </td>

                <td className="p-4">
                  <Badge variant="outline" className="font-bold">{d.city}</Badge>
                  <span className="text-slate-400 text-[11px] ml-2">{d.state}</span>
                </td>

                <td className="p-4">
                  {d.assignedDealer ? (
                    <div>
                      <p className="font-semibold text-slate-800">{d.assignedDealer.name}</p>
                      <p className="text-[10px] text-slate-400">{d.assignedDealer.email}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>

                <td className="p-4 font-bold text-slate-900">
                  {d._count.vehicles} Cars
                </td>

                <td className="p-4 font-bold text-slate-900">
                  {d._count.appointments} Visits
                </td>

                <td className="p-4 text-right">
                  <Link href={`/dealerships/${d.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-blue-600">
                      <span>Public Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
