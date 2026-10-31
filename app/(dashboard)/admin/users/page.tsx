import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { AdminUsersTable } from "@/components/users/admin-users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireRole([Role.ADMIN]);

  const [users, dealerships] = await Promise.all([
    prisma.user.findMany({
      include: { dealership: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dealership.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Users & RBAC Control</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system users, reassign roles (Admin, Dealer, Customer, Service Manager) and security status ({users.length} accounts)
        </p>
      </div>

      <AdminUsersTable
        users={users}
        dealerships={dealerships}
        currentUserId={session.user.id}
      />
    </div>
  );
}
