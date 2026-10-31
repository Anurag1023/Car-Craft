"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Bell, ExternalLink } from "lucide-react";
import { Role } from "@prisma/client";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const formatSegment = (seg: string) => {
    return seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link href={`/${segments[0] || "customer"}`} className="font-semibold text-slate-800 hover:text-blue-600 transition">
          {formatSegment(segments[0] || "Dashboard")}
        </Link>
        {segments.slice(1).map((seg, idx) => (
          <div key={idx} className="flex items-center gap-2 text-slate-400">
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-slate-600">{formatSegment(seg)}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            {user.role}
          </span>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
}
