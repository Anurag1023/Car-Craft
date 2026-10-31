"use client";

import { useState } from "react";
import { User, Dealership, Role, UserStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { ShieldCheck, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  users: (User & { dealership: Dealership | null })[];
  dealerships: Dealership[];
  currentUserId: string;
}

export function AdminUsersTable({ users: initial, dealerships, currentUserId }: Props) {
  const [users, setUsers] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const toast = useToast();

  const handleUpdate = async (id: string, updates: { role?: Role; status?: UserStatus; dealershipId?: string | null }) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Update Failed", data.error);
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
      );
      toast.success("User Updated", data.message);
    } catch {
      toast.error("Error", "Could not update user");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
            <th className="p-4">User</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Platform Role</th>
            <th className="p-4">Assigned Dealership</th>
            <th className="p-4">Account Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            const isLoading = loadingId === u.id;

            return (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-600">
                  {u.phone || "—"}
                </td>

                <td className="p-4">
                  {isSelf ? (
                    <Badge variant="default" className="bg-blue-600">{u.role} (You)</Badge>
                  ) : (
                    <select
                      disabled={isLoading}
                      value={u.role}
                      onChange={(e) => handleUpdate(u.id, { role: e.target.value as Role })}
                      className="h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="DEALER">DEALER</option>
                      <option value="SERVICE_MANAGER">SERVICE MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>

                <td className="p-4">
                  {u.role === Role.DEALER || u.role === Role.SERVICE_MANAGER ? (
                    <select
                      disabled={isLoading}
                      value={u.dealershipId || ""}
                      onChange={(e) =>
                        handleUpdate(u.id, { dealershipId: e.target.value || null })
                      }
                      className="h-8 px-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-[180px] truncate"
                    >
                      <option value="">No Dealership Assigned</option>
                      {dealerships.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.city})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-400 italic">Not applicable</span>
                  )}
                </td>

                <td className="p-4">
                  <Badge variant={u.status === UserStatus.ACTIVE ? "success" : "destructive"}>
                    {u.status}
                  </Badge>
                </td>

                <td className="p-4 text-right">
                  {!isSelf && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() =>
                        handleUpdate(u.id, {
                          status:
                            u.status === UserStatus.ACTIVE
                              ? UserStatus.SUSPENDED
                              : UserStatus.ACTIVE,
                        })
                      }
                      className={`h-8 text-xs ${
                        u.status === UserStatus.ACTIVE
                          ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === UserStatus.ACTIVE ? "Suspend" : "Activate"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
