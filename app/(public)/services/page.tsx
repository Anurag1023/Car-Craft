import prisma from "@/lib/db/prisma";
import { ServiceBookingWizard } from "@/components/services/service-booking-wizard";
import { Wrench, ShieldCheck, Clock, Award, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ServicesPageProps {
  searchParams: {
    dealershipId?: string;
  };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const [dealerships, categories] = await Promise.all([
    prisma.dealership.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { basePrice: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider">
          <Wrench className="w-4 h-4" />
          <span>Precision Certified Workshop</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Automotive Service Appointment Scheduling
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Book factory-certified mechanical diagnostics, routine maintenance, fluid changes, and wheel alignment at authorized dealership workshops.
        </p>
      </div>

      {/* Workshop Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">100% Genuine OEM Spares</h4>
            <p className="text-[11px] text-slate-400">Direct from factory parts catalog</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Zero Wait Time Slots</h4>
            <p className="text-[11px] text-slate-400">Immediate bay entry upon arrival</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">6-Month Service Warranty</h4>
            <p className="text-[11px] text-slate-400">Guaranteed peace of mind</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Transparent Estimates</h4>
            <p className="text-[11px] text-slate-400">Zero hidden mechanical surcharges</p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <ServiceBookingWizard
        dealerships={dealerships}
        categories={categories}
        preselectedDealershipId={searchParams.dealershipId}
      />
    </div>
  );
}
