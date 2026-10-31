import React from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { requireAuth } from "@/lib/auth/session";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
