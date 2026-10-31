"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Car, 
  ShoppingBag, 
  Wrench, 
  Building2, 
  Scale, 
  Heart, 
  User, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCompare } from "@/components/providers/compare-provider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Role } from "@prisma/client";

export function PublicNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const { compareList } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getDashboardLink = (role?: Role) => {
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
  };

  const navLinks = [
    { href: "/vehicles", label: "Vehicles", icon: Car },
    { href: "/dealerships", label: "Dealerships", icon: Building2 },
    { href: "/accessories", label: "Accessories", icon: ShoppingBag },
    { href: "/services", label: "Service Booking", icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Car className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                Car<span className="text-blue-600">Craft</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                Automotive Suite
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 bg-blue-50/80 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-2">
            {/* Vehicle Compare Shortcut */}
            <Link
              href="/compare"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Compare Vehicles"
            >
              <Scale className="h-5 w-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {compareList.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Session Dropdown or Login */}
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-xs font-medium text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                    {session.user.role}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{session.user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink(session.user.role)}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Role Dashboard ({session.user.role})
                    </Link>

                    {session.user.role === Role.CUSTOMER && (
                      <>
                        <Link
                          href="/customer/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Heart className="h-4 w-4" />
                          My Wishlist
                        </Link>
                        <Link
                          href="/customer/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          My Orders
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="hidden sm:inline-flex">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon className="h-5 w-5 text-blue-600" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2.5">
              <Scale className="h-5 w-5 text-blue-600" />
              Compare Vehicles
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {compareList.length}
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
