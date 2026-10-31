import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { formatPrice, formatPriceCompact, formatNumber } from "@/lib/utils";
import { VehicleDetailGallery } from "@/components/vehicles/vehicle-detail-gallery";
import { VehicleInquiryModal } from "@/components/vehicles/vehicle-inquiry-modal";
import { Badge } from "@/components/ui/badge";
import { 
  Fuel, 
  Settings2, 
  Gauge, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Scale, 
  Heart,
  Palette,
  Users,
  Compass
} from "lucide-react";
import { InventoryStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface VehiclePageProps {
  params: {
    id: string;
  };
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: {
      dealership: true,
      images: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.AVAILABLE:
        return <Badge variant="success">Available for Immediate Delivery</Badge>;
      case InventoryStatus.RESERVED:
        return <Badge variant="warning">Reserved by Buyer</Badge>;
      case InventoryStatus.SOLD:
        return <Badge variant="destructive">Sold Out</Badge>;
      case InventoryStatus.MAINTENANCE:
        return <Badge variant="secondary">Undergoing Inspection</Badge>;
    }
  };

  const specs = [
    { label: "Manufacturing Year", value: vehicle.year, icon: Calendar },
    { label: "Fuel Type", value: vehicle.fuelType, icon: Fuel },
    { label: "Transmission", value: vehicle.transmission, icon: Settings2 },
    { label: "Odometer Reading", value: `${formatNumber(vehicle.mileage)} km`, icon: Gauge },
    { label: "Engine Displacement", value: vehicle.engineCapacity ? `${vehicle.engineCapacity} cc` : "Electric Motor", icon: Compass },
    { label: "Seating Capacity", value: `${vehicle.seatingCapacity} Seater`, icon: Users },
    { label: "Body Type", value: vehicle.bodyType, icon: ShieldCheck },
    { label: "Exterior Color", value: vehicle.color, icon: Palette },
    { label: "Registration No.", value: vehicle.registrationNumber || "Unregistered / Demo", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/vehicles" className="hover:text-blue-600 transition">Vehicles</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{vehicle.brand}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{vehicle.model}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {vehicle.brand} {vehicle.model}
          </h1>
          {vehicle.variant && (
            <p className="text-base text-slate-600 mt-0.5">{vehicle.variant}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(vehicle.inventoryStatus)}
        </div>
      </div>

      {/* Main Grid: Gallery & Quick Buy Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery & Details (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          <VehicleDetailGallery
            images={vehicle.images}
            title={`${vehicle.brand} ${vehicle.model}`}
          />

          {/* Technical Specifications */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Technical Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {specs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 capitalize">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Vehicle Overview & Condition
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {vehicle.description}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>150-Point Technical Inspection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>RTO Verification & Clear Paperwork</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Certified Mileage Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Inquiry Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Price Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-6 sticky top-24">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ex-Showroom Price
              </span>
              <div className="text-3xl font-black text-slate-900">
                {formatPrice(vehicle.price)}
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Includes 1-Year Comprehensive Warranty & Roadside Assistance
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <VehicleInquiryModal
                vehicle={{
                  id: vehicle.id,
                  brand: vehicle.brand,
                  model: vehicle.model,
                  variant: vehicle.variant,
                  dealership: vehicle.dealership,
                }}
              />

              <div className="text-center">
                <span className="text-[11px] text-slate-400">
                  Zero advance booking deposit required to test drive
                </span>
              </div>
            </div>

            {/* Dealership Card */}
            {vehicle.dealership && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Partner Dealership Location
                </h4>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{vehicle.dealership.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{vehicle.dealership.address}</p>
                    <p className="text-xs text-slate-500">{vehicle.dealership.city}, {vehicle.dealership.state}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vehicle.dealership.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vehicle.dealership.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hours: {vehicle.dealership.operatingHours}</span>
                  </div>
                </div>

                <Link
                  href={`/dealerships/${vehicle.dealership.slug}`}
                  className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 pt-1"
                >
                  View All Dealership Inventory →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
