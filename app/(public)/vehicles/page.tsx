import prisma from "@/lib/db/prisma";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleFilterBar } from "@/components/vehicles/vehicle-filter-bar";
import { FuelType, Transmission, BodyType, InventoryStatus } from "@prisma/client";
import { Car, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

interface VehiclesPageProps {
  searchParams: {
    q?: string;
    brand?: string;
    fuelType?: FuelType;
    transmission?: Transmission;
    bodyType?: BodyType;
    status?: InventoryStatus;
    dealershipId?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    sortBy?: string;
  };
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const {
    q,
    brand,
    fuelType,
    transmission,
    bodyType,
    status,
    dealershipId,
    minPrice,
    maxPrice,
    minYear,
    sortBy,
  } = searchParams;

  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { variant: { contains: q, mode: "insensitive" } },
    ];
  }

  if (brand) {
    whereClause.brand = { equals: brand, mode: "insensitive" };
  }

  if (fuelType) {
    whereClause.fuelType = fuelType;
  }

  if (transmission) {
    whereClause.transmission = transmission;
  }

  if (bodyType) {
    whereClause.bodyType = bodyType;
  }

  if (dealershipId) {
    whereClause.dealershipId = dealershipId;
  }

  if (status) {
    whereClause.inventoryStatus = status;
  }

  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) whereClause.price.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
  }

  if (minYear) {
    whereClause.year = { gte: parseInt(minYear) };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  if (sortBy === "price_desc") orderBy = { price: "desc" };
  if (sortBy === "year_desc") orderBy = { year: "desc" };
  if (sortBy === "mileage_asc") orderBy = { mileage: "asc" };

  const [vehicles, totalCount, dealerships] = await Promise.all([
    prisma.vehicle.findMany({
      where: whereClause,
      include: {
        dealership: true,
        images: true,
      },
      orderBy,
    }),
    prisma.vehicle.count({ where: whereClause }),
    prisma.dealership.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, city: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Car className="w-4 h-4" />
          <span>Vehicle Marketplace</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Certified Automotive Inventory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Showing {vehicles.length} of {totalCount} verified vehicles available across authorized dealerships
        </p>
      </div>

      {/* Filter and Search Bar */}
      <VehicleFilterBar dealerships={dealerships} currentParams={searchParams} />

      {/* Vehicle Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Car className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Vehicles Found Matching Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms, clearing brand filters, or broadening your price range.
          </p>
          <a
            href="/vehicles"
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Reset All Filters
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </div>
  );
}
