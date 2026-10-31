import Link from "next/link";
import { Car, Mail, Phone, MapPin, ShieldCheck, Award, Clock } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Car className="h-6 w-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Car<span className="text-blue-500">Craft</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              CarCraft is an integrated automotive dealership suite delivering certified vehicle inventory, verified multi-dealership operations, genuine auto parts e-commerce, and precision service scheduling.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Certified Pre-Owned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>OEM Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Express Service</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/vehicles" className="hover:text-blue-400 transition">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link href="/vehicles?fuelType=ELECTRIC" className="hover:text-blue-400 transition">
                  Electric Vehicles (EV)
                </Link>
              </li>
              <li>
                <Link href="/dealerships" className="hover:text-blue-400 transition">
                  Partner Dealerships
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="hover:text-blue-400 transition">
                  Automotive Store
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-blue-400 transition">
                  Compare Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Service & Support */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Workshop</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services" className="hover:text-blue-400 transition">
                  Book Service
                </Link>
              </li>
              <li>
                <Link href="/services#periodic" className="hover:text-blue-400 transition">
                  General Servicing
                </Link>
              </li>
              <li>
                <Link href="/services#diagnostics" className="hover:text-blue-400 transition">
                  ECU Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/services#detailing" className="hover:text-blue-400 transition">
                  Ceramic Detailing
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Corporate Hub</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Plot 42, Link Road, Andheri West, Mumbai, MH</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+91 98200 11223</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>support@carcraft.local</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CarCraft Suite. All rights reserved. B.Tech Capstone Project.</p>
          <div className="flex gap-6">
            <span className="text-slate-400">Demonstration Platform (Local Execution)</span>
            <span>PostgreSQL & Prisma Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
