"use client";

import Link from "next/link";
import { Vehicle, VehicleImage, Dealership, FuelType, Transmission, BodyType, InventoryStatus } from "@prisma/client";
import { formatPrice, formatPriceCompact, formatNumber } from "@/lib/utils";
import { Fuel, Settings2, Gauge, MapPin, Scale, Heart, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/components/providers/compare-provider";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/providers/toast-provider";

interface VehicleCardProps {
  vehicle: Vehicle & {
    dealership?: Dealership | null;
    images?: VehicleImage[];
  };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { data: session } = useSession();
  const toast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);

  const primaryImage =
    vehicle.images?.find((img) => img.isPrimary)?.url ||
    vehicle.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80";

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.info("Authentication Required", "Please sign in to save vehicles to your wishlist");
      return;
    }

    setIsWishlisting(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: isWishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: vehicle.id }),
      });

      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        toast.success(
          isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist",
          `${vehicle.brand} ${vehicle.model} updated in your saved vehicles`
        );
      } else {
        const data = await res.json();
        toast.error("Wishlist Update Failed", data.error);
      }
    } catch {
      toast.error("Error", "Could not update wishlist");
    } finally {
      setIsWishlisting(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCompare(vehicle.id)) {
      removeFromCompare(vehicle.id);
      toast.info("Removed from Compare", `${vehicle.brand} ${vehicle.model} removed`);
    } else {
      addToCompare({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        variant: vehicle.variant,
        price: vehicle.price,
        year: vehicle.year,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        mileage: vehicle.mileage,
        engineCapacity: vehicle.engineCapacity,
        seatingCapacity: vehicle.seatingCapacity,
        image: primaryImage,
      });
    }
  };

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case InventoryStatus.AVAILABLE:
        return <Badge variant="success" className="text-[10px]">Available</Badge>;
      case InventoryStatus.RESERVED:
        return <Badge variant="warning" className="text-[10px]">Reserved</Badge>;
      case InventoryStatus.SOLD:
        return <Badge variant="destructive" className="text-[10px]">Sold</Badge>;
      case InventoryStatus.MAINTENANCE:
        return <Badge variant="secondary" className="text-[10px]">In Workshop</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Vehicle Image Thumbnail & Actions */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
          <Link href={`/vehicles/${vehicle.id}`}>
            <img
              src={primaryImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">{getStatusBadge(vehicle.inventoryStatus)}</div>

          {/* Quick Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={handleToggleCompare}
              className={`p-2 rounded-lg backdrop-blur-md transition ${
                isInCompare(vehicle.id)
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600"
              }`}
              title="Compare specs"
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleWishlist}
              disabled={isWishlisting}
              className={`p-2 rounded-lg backdrop-blur-md transition ${
                isWishlisted
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-white/80 text-slate-700 hover:bg-white hover:text-rose-600"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Body Type Tag */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-slate-900/80 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {vehicle.year} • {vehicle.bodyType}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                {vehicle.brand}
              </span>
              <span className="text-lg font-black text-slate-900">
                {formatPriceCompact(vehicle.price)}
              </span>
            </div>
            <Link href={`/vehicles/${vehicle.id}`}>
              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition line-clamp-1 mt-0.5">
                {vehicle.brand} {vehicle.model}
              </h3>
            </Link>
            {vehicle.variant && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{vehicle.variant}</p>
            )}
          </div>

          {/* Specs Mini-Grid */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{formatNumber(vehicle.mileage)} km</span>
            </div>
          </div>

          {/* Dealership Info */}
          {vehicle.dealership && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium text-slate-700">{vehicle.dealership.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{vehicle.dealership.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer CTA */}
      <div className="p-5 pt-0">
        <Link href={`/vehicles/${vehicle.id}`} className="block">
          <button className="w-full h-9 rounded-lg border border-blue-600/30 text-blue-600 font-semibold text-xs hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2">
            View Details & Inquire
          </button>
        </Link>
      </div>
    </div>
  );
}
