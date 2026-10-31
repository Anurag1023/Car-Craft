"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Car, 
  LayoutDashboard, 
  Building2, 
  ShoppingBag, 
  Wrench, 
  Users, 
  FileText, 
  Star, 
  Activity, 
  Heart, 
  MessageSquare, 
  Calendar,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
    dealershipId?: string | null;
  };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getNavSections = () => {
    switch (user.role) {
      case Role.ADMIN:
        return [
          {
            title: "Platform Operations",
            items: [
              { label: "Overview", href: "/admin", icon: LayoutDashboard },
              { label: "Dealerships", href: "/admin/dealerships", icon: Building2 },
              { label: "Vehicle Fleet", href: "/admin/vehicles", icon: Car },
              { label: "Product Store", href: "/admin/products", icon: ShoppingBag },
              { label: "Accessory Orders", href: "/admin/orders", icon: FileText },
              { label: "Service Center", href: "/admin/appointments", icon: Wrench },
            ],
          },
          {
            title: "Governance & Audit",
            items: [
              { label: "User Management", href: "/admin/users", icon: Users },
              { label: "Customer Reviews", href: "/admin/reviews", icon: Star },
              { label: "Activity Logs", href: "/admin/logs", icon: Activity },
            ],
          },
        ];

      case Role.DEALER:
        return [
          {
            title: "Dealership Console",
            items: [
              { label: "Dealership Overview", href: "/dealer", icon: LayoutDashboard },
              { label: "Vehicle Inventory", href: "/dealer/vehicles", icon: Car },
              { label: "Customer Inquiries", href: "/dealer/inquiries", icon: MessageSquare },
              { label: "Service Visits", href: "/dealer/appointments", icon: Calendar },
            ],
          },
        ];

      case Role.SERVICE_MANAGER:
        return [
          {
            title: "Service Workshop",
            items: [
              { label: "Bay Overview", href: "/service-manager", icon: LayoutDashboard },
              { label: "Appointments Queue", href: "/service-manager/appointments", icon: Calendar },
              { label: "Slot Capacity", href: "/service-manager/slots", icon: Wrench },
            ],
          },
        ];

      case Role.CUSTOMER:
      default:
        return [
          {
            title: "Customer Hub",
            items: [
              { label: "Account Dashboard", href: "/customer", icon: LayoutDashboard },
              { label: "Order History", href: "/customer/orders", icon: ShoppingBag },
              { label: "Service Bookings", href: "/customer/appointments", icon: Calendar },
              { label: "Saved Vehicles", href: "/customer/wishlist", icon: Heart },
              { label: "My Profile", href: "/customer/profile", icon: Users },
            ],
          },
        ];
    }
  };

  const sections = getNavSections();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Car className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-tight text-base">
            Car<span className="text-blue-500">Craft</span>
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {user.role.replace("_", " ")} PANEL
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h5 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </h5>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Public Store Link */}
        <div className="pt-2 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
          >
            <Car className="h-4 w-4" />
            <span>Back to Public Store</span>
          </Link>
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
