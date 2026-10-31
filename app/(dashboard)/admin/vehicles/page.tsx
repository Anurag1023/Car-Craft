import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { DealerVehiclesTable } from "@/components/vehicles/dealer-vehicles-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  await requireRole([Role.ADMIN]);

  const vehicles = await prisma.vehicle.findMany({
    include: { images: true, dealership: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Vehicle Fleet</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total active vehicles in ecosystem: {vehicles.length}
          </p>
        </div>

        <Link href="/dealer/vehicles/new">
          <Button size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            Add Vehicle to Showroom
          </Button>
        </Link>
      </div>

      <DealerVehiclesTable vehicles={vehicles} />
    </div>
  );
}
