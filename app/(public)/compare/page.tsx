"use client";

import Link from "next/link";
import { useCompare } from "@/components/providers/compare-provider";
import { formatPrice, formatPriceCompact, formatNumber } from "@/lib/utils";
import { Scale, Trash2, ArrowRight, Car, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Scale className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Vehicle Comparison Bay is Empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Select up to 3 cars from our vehicle marketplace to compare specs, fuel types, mileage, and pricing side-by-side.
          </p>
        </div>
        <Link href="/vehicles">
          <Button size="lg" className="font-bold">
            Explore Vehicles Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const specRows = [
    { label: "Ex-Showroom Price", key: "price", format: (v: any) => formatPrice(v.price) },
    { label: "Automobile Brand", key: "brand", format: (v: any) => v.brand },
    { label: "Model & Variant", key: "model", format: (v: any) => `${v.model} ${v.variant || ""}` },
    { label: "Manufacturing Year", key: "year", format: (v: any) => v.year },
    { label: "Fuel Type", key: "fuelType", format: (v: any) => v.fuelType },
    { label: "Transmission", key: "transmission", format: (v: any) => v.transmission },
    { label: "Certified Mileage", key: "mileage", format: (v: any) => `${formatNumber(v.mileage)} km` },
    { label: "Engine Displacement", key: "engineCapacity", format: (v: any) => (v.engineCapacity ? `${v.engineCapacity} cc` : "Electric Motor") },
    { label: "Seating Capacity", key: "seatingCapacity", format: (v: any) => `${v.seatingCapacity} Seater` },
    { label: "Body Type", key: "bodyType", format: (v: any) => v.bodyType },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Side-by-Side Evaluator</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Vehicle Specification Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparing {compareList.length} of 3 maximum vehicles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearCompare} className="text-xs text-rose-600 hover:text-rose-700">
            Clear Comparison
          </Button>
          <Link href="/vehicles">
            <Button size="sm" className="text-xs font-semibold">
              Add More Vehicles
            </Button>
          </Link>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Header Row: Vehicle Cards */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-4 sm:p-6 w-1/4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Specification Metric
              </th>
              {compareList.map((veh) => (
                <th key={veh.id} className="p-4 sm:p-6 w-1/4 align-top">
                  <div className="space-y-3">
                    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                      <img src={veh.image} alt={veh.model} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFromCompare(veh.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{veh.brand}</span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{veh.model}</h4>
                      <p className="text-base font-black text-slate-900 mt-1">{formatPrice(veh.price)}</p>
                    </div>

                    <Link href={`/vehicles/${veh.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        View Full Specs
                      </Button>
                    </Link>
                  </div>
                </th>
              ))}
              {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                <th key={i} className="p-4 sm:p-6 w-1/4 align-middle text-center bg-slate-50/20">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
                    <Car className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-medium text-slate-400">Empty Slot</p>
                    <Link href="/vehicles">
                      <button className="text-xs text-blue-600 font-semibold hover:underline">
                        + Add Vehicle
                      </button>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Metric Rows */}
          <tbody className="divide-y divide-slate-100 text-xs">
            {specRows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                <td className="p-4 font-bold text-slate-700">{row.label}</td>
                {compareList.map((veh) => (
                  <td key={veh.id} className="p-4 font-semibold text-slate-900">
                    {row.format(veh)}
                  </td>
                ))}
                {Array.from({ length: 3 - compareList.length }).map((_, i) => (
                  <td key={i} className="p-4 text-slate-300">
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
