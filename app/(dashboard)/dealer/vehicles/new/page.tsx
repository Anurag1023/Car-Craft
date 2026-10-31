import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export const dynamic = "force-dynamic";

export default async function NewVehiclePage() {
  const session = await requireRole([Role.DEALER, Role.ADMIN]);

  const dealerships = await prisma.dealership.findMany({
    where: session.user.role === Role.ADMIN ? {} : { id: session.user.dealershipId || "" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <VehicleForm
        dealerships={dealerships}
        defaultDealershipId={session.user.dealershipId || dealerships[0]?.id}
        isDealerLocked={session.user.role === Role.DEALER}
      />
    </div>
  );
}
