"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { Dealership, FuelType, Transmission, BodyType, InventoryStatus } from "@prisma/client";
import { Car, Image as ImageIcon, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface VehicleFormProps {
  dealerships: Dealership[];
  defaultDealershipId?: string;
  isDealerLocked?: boolean;
}

export function VehicleForm({ dealerships, defaultDealershipId, isDealerLocked }: VehicleFormProps) {
  const router = useRouter();
  const toast = useToast();

  const [dealershipId, setDealershipId] = useState(defaultDealershipId || dealerships[0]?.id || "");
  const [brand, setBrand] = useState("Tata");
  const [model, setModel] = useState("Curvv");
  const [variant, setVariant] = useState("Accomplished Plus A Hyperion GDi");
  const [year, setYear] = useState(2024);
  const [price, setPrice] = useState(1750000);
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.PETROL);
  const [transmission, setTransmission] = useState<Transmission>(Transmission.AUTOMATIC);
  const [bodyType, setBodyType] = useState<BodyType>(BodyType.SUV);
  const [mileage, setMileage] = useState(1200);
  const [engineCapacity, setEngineCapacity] = useState(1199);
  const [seatingCapacity, setSeatingCapacity] = useState(5);
  const [color, setColor] = useState("Cosmic Gold");
  const [registrationNumber, setRegistrationNumber] = useState("MH 02 GA 9090");
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>(InventoryStatus.AVAILABLE);
  const [isFeatured, setIsFeatured] = useState(true);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80");
  const [description, setDescription] = useState(
    "All-new coupe SUV styling with flush door handles, panoramic sunroof, powered tailgate with gesture control, and Level 2 ADAS suite."
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId,
          brand,
          model,
          variant,
          year: Number(year),
          price: Number(price),
          fuelType,
          transmission,
          bodyType,
          mileage: Number(mileage),
          engineCapacity: Number(engineCapacity),
          seatingCapacity: Number(seatingCapacity),
          color,
          registrationNumber,
          inventoryStatus,
          isFeatured,
          imageUrl,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Validation Error", data.error || "Please check form entries");
        setIsLoading(false);
        return;
      }

      toast.success("Vehicle Added", data.message);
      router.push("/dealer/vehicles");
      router.refresh();
    } catch {
      toast.error("Error", "Network error while saving vehicle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add Vehicle to Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Publish a certified vehicle listing</p>
        </div>
        <Link href="/dealer/vehicles">
          <Button variant="outline" size="sm" type="button" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Inventory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Dealership */}
        <div className="sm:col-span-2 md:col-span-3">
          <Label htmlFor="vDealership">Assigned Dealership</Label>
          <select
            id="vDealership"
            disabled={isDealerLocked}
            value={dealershipId}
            onChange={(e) => setDealershipId(e.target.value)}
            className="w-full mt-1.5 h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
          >
            {dealerships.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.city})
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <Label htmlFor="brand">Automobile Brand</Label>
          <Input id="brand" required value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1" />
        </div>

        {/* Model */}
        <div>
          <Label htmlFor="model">Model Name</Label>
          <Input id="model" required value={model} onChange={(e) => setModel(e.target.value)} className="mt-1" />
        </div>

        {/* Variant */}
        <div>
          <Label htmlFor="variant">Variant (Trim)</Label>
          <Input id="variant" value={variant} onChange={(e) => setVariant(e.target.value)} className="mt-1" />
        </div>

        {/* Manufacturing Year */}
        <div>
          <Label htmlFor="year">Manufacturing Year</Label>
          <Input id="year" type="number" required min={1990} max={2027} value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1" />
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Ex-Showroom Price (₹)</Label>
          <Input id="price" type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 font-bold" />
        </div>

        {/* Mileage */}
        <div>
          <Label htmlFor="mileage">Odometer (km)</Label>
          <Input id="mileage" type="number" required value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="mt-1" />
        </div>

        {/* Fuel Type */}
        <div>
          <Label htmlFor="fuelType">Fuel Type</Label>
          <select
            id="fuelType"
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value as FuelType)}
            className="w-full mt-1.5 h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Electric</option>
            <option value="HYBRID">Hybrid</option>
            <option value="CNG">CNG</option>
          </select>
        </div>

        {/* Transmission */}
        <div>
          <Label htmlFor="transmission">Transmission</Label>
          <select
            id="transmission"
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as Transmission)}
            className="w-full mt-1.5 h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <Label htmlFor="bodyType">Body Type</Label>
          <select
            id="bodyType"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value as BodyType)}
            className="w-full mt-1.5 h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="SUV">SUV</option>
            <option value="SEDAN">Sedan</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="MPV">MPV</option>
            <option value="COUPE">Coupe</option>
          </select>
        </div>

        {/* Engine cc */}
        <div>
          <Label htmlFor="eng">Engine Displacement (cc)</Label>
          <Input id="eng" type="number" value={engineCapacity} onChange={(e) => setEngineCapacity(Number(e.target.value))} className="mt-1" />
        </div>

        {/* Seating */}
        <div>
          <Label htmlFor="seat">Seating Capacity</Label>
          <Input id="seat" type="number" min={2} max={10} value={seatingCapacity} onChange={(e) => setSeatingCapacity(Number(e.target.value))} className="mt-1" />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color">Exterior Color</Label>
          <Input id="color" required value={color} onChange={(e) => setColor(e.target.value)} className="mt-1" />
        </div>

        {/* Reg Number */}
        <div className="sm:col-span-2">
          <Label htmlFor="reg">Registration Number</Label>
          <Input id="reg" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="mt-1 uppercase font-mono" />
        </div>

        {/* Image URL */}
        <div className="sm:col-span-2 md:col-span-3">
          <Label htmlFor="img">Primary Vehicle Image URL</Label>
          <Input id="img" type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1" />
        </div>

        {/* Description */}
        <div className="sm:col-span-2 md:col-span-3">
          <Label htmlFor="desc">Full Vehicle Description & Specifications</Label>
          <textarea
            id="desc"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1.5 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Link href="/dealer/vehicles">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button type="submit" isLoading={isLoading} className="gap-2 font-bold">
          <Save className="w-4 h-4" />
          Save & Publish Vehicle
        </Button>
      </div>
    </form>
  );
}
