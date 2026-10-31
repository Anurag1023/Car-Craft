"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  dealerships: { id: string; name: string; city: string }[];
  currentParams: Record<string, string | undefined>;
}

export function VehicleFilterBar({ dealerships, currentParams }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(currentParams.q || "");
  const [brand, setBrand] = useState(currentParams.brand || "");
  const [fuelType, setFuelType] = useState(currentParams.fuelType || "");
  const [bodyType, setBodyType] = useState(currentParams.bodyType || "");
  const [transmission, setTransmission] = useState(currentParams.transmission || "");
  const [dealershipId, setDealershipId] = useState(currentParams.dealershipId || "");
  const [sortBy, setSortBy] = useState(currentParams.sortBy || "");

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (fuelType) params.set("fuelType", fuelType);
    if (bodyType) params.set("bodyType", bodyType);
    if (transmission) params.set("transmission", transmission);
    if (dealershipId) params.set("dealershipId", dealershipId);
    if (sortBy) params.set("sortBy", sortBy);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setQ("");
    setBrand("");
    setFuelType("");
    setBodyType("");
    setTransmission("");
    setDealershipId("");
    setSortBy("");
    router.push(pathname);
  };

  const brands = [
    "Tata",
    "Mahindra",
    "Hyundai",
    "Toyota",
    "Maruti Suzuki",
    "Volkswagen",
    "Skoda",
    "Kia",
    "Honda",
  ];

  return (
    <form
      onSubmit={handleApplyFilter}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand, model, variant..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Brand */}
        <div>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Fuel Types</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric (EV)</option>
            <option value="HYBRID">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Body Types</option>
            <option value="SUV">SUV</option>
            <option value="SEDAN">Sedan</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="MPV">MPV</option>
            <option value="COUPE">Coupe</option>
          </select>
        </div>

        {/* Transmission */}
        <div>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Transmissions</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        {/* Dealership */}
        <div>
          <select
            value={dealershipId}
            onChange={(e) => setDealershipId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Dealerships</option>
            {dealerships.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.city})
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_desc">Manufacturing Year: Newest</option>
            <option value="mileage_asc">Mileage: Lowest First</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" className="flex-1 h-10" isLoading={isPending}>
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Apply Filters
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-10 px-3 text-slate-600"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
