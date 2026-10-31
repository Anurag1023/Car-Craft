import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getDashboardUrlByRole(session.user.role));
  }
  return session;
}

export function getDashboardUrlByRole(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "/admin";
    case Role.DEALER:
      return "/dealer";
    case Role.SERVICE_MANAGER:
      return "/service-manager";
    case Role.CUSTOMER:
    default:
      return "/customer";
  }
}
