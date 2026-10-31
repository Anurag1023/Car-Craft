"use client";

import { useState } from "react";
import { Vehicle, VehicleImage, InventoryStatus } from "@prisma/client";
import { formatPriceCompact, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { Eye, Trash2, Edit3, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  vehicles: (Vehicle & { images: VehicleImage[] })[];
}

export function DealerVehiclesTable({ vehicles: initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const toast = useToast();

  const handleStatusChange = async (id: string, newStatus: InventoryStatus) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Status Update Failed", data.error);
        return;
      }

      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, inventoryStatus: newStatus } : v))
      );
      toast.success("Inventory Updated", `Status changed to ${newStatus}`);
    } catch {
      toast.error("Error", "Could not update vehicle status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error("Delete Failed", data.error);
        return;
      }

      setVehicles((prev) => prev.filter((v) => v.id !== id));
      toast.success("Vehicle Deleted", `${name} removed from inventory`);
    } catch {
      toast.error("Error", "Could not delete vehicle");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs min-w-[750px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
            <th className="p-4">Car Information</th>
            <th className="p-4">Powertrain</th>
            <th className="p-4">Odometer</th>
            <th className="p-4">Price (₹)</th>
            <th className="p-4">Showroom Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-400">
                No vehicles listed yet. Click &apos;Add New Vehicle&apos; to publish your first inventory car.
              </td>
            </tr>
          ) : (
            vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={v.images[0]?.url || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&auto=format&fit=crop&q=80"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{v.brand} {v.model}</p>
                      <p className="text-[11px] text-slate-400">{v.variant || "Standard"} • {v.year}</p>
                      <p className="font-mono text-[10px] text-slate-500">{v.registrationNumber || "Unregistered"}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-600">
                  {v.fuelType} • {v.transmission}
                </td>

                <td className="p-4 font-mono text-slate-700">
                  {formatNumber(v.mileage)} km
                </td>

                <td className="p-4 font-black text-slate-900">
                  {formatPriceCompact(v.price)}
                </td>

                <td className="p-4">
                  <select
                    disabled={loadingId === v.id}
                    value={v.inventoryStatus}
                    onChange={(e) => handleStatusChange(v.id, e.target.value as InventoryStatus)}
                    className="h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/vehicles/${v.id}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="View live listing">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(v.id, `${v.brand} ${v.model}`)}
                      className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
