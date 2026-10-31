import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { User, Mail, Phone, ShieldCheck, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Your CarCraft account identity and security details</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
              <Badge variant="outline" className="text-[10px] uppercase font-bold">{user.role}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Registered Phone:</span>
            <span className="font-bold text-slate-800">{user.phone || "Not provided"}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Account Status:</span>
            <span className="font-bold text-emerald-600">{user.status}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Member Since:</span>
            <span className="font-bold text-slate-800">{formatDateTime(user.createdAt)}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Account Protection:</span>
            <span className="font-bold text-slate-800">Bcrypt Salted & Hashed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
