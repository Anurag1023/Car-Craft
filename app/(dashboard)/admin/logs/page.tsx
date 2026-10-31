import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { Activity, ShieldCheck, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  await requireRole([Role.ADMIN]);

  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Platform Activity Logs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit record of system operations, status changes, and user transactions
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Action Event</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Entity Type</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="p-4 font-mono text-[11px] text-slate-500">
                  {formatDateTime(l.createdAt)}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  {l.action.replace(/_/g, " ")}
                </td>
                <td className="p-4">
                  <p className="font-semibold text-slate-800">{l.user?.name || "System"}</p>
                  <p className="text-[10px] text-slate-400">{l.user?.role || "SYSTEM"}</p>
                </td>
                <td className="p-4 font-mono text-[11px] text-slate-600">
                  {l.entityType}
                </td>
                <td className="p-4 text-slate-500 font-mono text-[11px]">
                  {l.details ? JSON.stringify(l.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
