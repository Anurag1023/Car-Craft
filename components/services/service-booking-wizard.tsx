"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/providers/toast-provider";
import { formatPrice } from "@/lib/utils";
import { Dealership, ServiceCategory } from "@prisma/client";
import { 
  Wrench, 
  Building2, 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface WizardProps {
  dealerships: Dealership[];
  categories: ServiceCategory[];
  preselectedDealershipId?: string;
}

export function ServiceBookingWizard({ dealerships, categories, preselectedDealershipId }: WizardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [dealershipId, setDealershipId] = useState(preselectedDealershipId || dealerships[0]?.id || "");
  const [serviceCategoryId, setServiceCategoryId] = useState(categories[0]?.id || "");
  const [vehicleBrand, setVehicleBrand] = useState("Tata");
  const [vehicleModel, setVehicleModel] = useState("Harrier");
  const [vehicleRegistration, setVehicleRegistration] = useState("MH 02 AB 1234");
  
  // Date default tomorrow
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [preferredDate, setPreferredDate] = useState(tomorrow);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("10:30 - 12:00");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [bookedNumber, setBookedNumber] = useState<string | null>(null);

  const timeSlots = [
    "09:00 - 10:30",
    "10:30 - 12:00",
    "12:00 - 01:30",
    "02:30 - 04:00",
    "04:00 - 05:30",
    "05:30 - 07:00",
  ];

  const selectedCategory = categories.find((c) => c.id === serviceCategoryId);
  const selectedDealer = dealerships.find((d) => d.id === dealershipId);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.info("Sign In Required", "Please sign in to confirm your service booking");
      router.push(`/login?callbackUrl=/services`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId,
          serviceCategoryId,
          vehicleBrand,
          vehicleModel,
          vehicleRegistration,
          preferredDate,
          preferredTimeSlot,
          additionalNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Booking Error", data.error || "Unable to confirm booking slot");
        setIsLoading(false);
        return;
      }

      setBookedNumber(data.appointmentNumber);
      toast.success("Appointment Scheduled", data.message);
    } catch {
      toast.error("Error", "Network error during booking submission");
    } finally {
      setIsLoading(false);
    }
  };

  if (bookedNumber) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
        <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Service Appointment Booked!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your appointment has been reserved in the workshop schedule. The service team at{" "}
            <strong>{selectedDealer?.name}</strong> has received your vehicle details.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Booking Reference:</span>
            <span className="font-bold font-mono text-blue-600">{bookedNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Service Category:</span>
            <span className="font-bold text-slate-800">{selectedCategory?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Date & Time Slot:</span>
            <span className="font-bold text-slate-800">{preferredDate} ({preferredTimeSlot})</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Vehicle:</span>
            <span className="font-bold text-slate-800">{vehicleBrand} {vehicleModel} ({vehicleRegistration})</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/customer/appointments" className="flex-1">
            <Button variant="outline" className="w-full text-xs font-semibold">
              View in My Bookings
            </Button>
          </Link>
          <Button onClick={() => setBookedNumber(null)} className="flex-1 text-xs font-bold">
            Book Another Vehicle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Step Indicators */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 text-xs font-bold">
        <div className={`p-4 text-center border-r border-slate-100 ${step === 1 ? "text-blue-600 bg-white" : "text-slate-500"}`}>
          1. Location & Package
        </div>
        <div className={`p-4 text-center border-r border-slate-100 ${step === 2 ? "text-blue-600 bg-white" : "text-slate-500"}`}>
          2. Vehicle Details
        </div>
        <div className={`p-4 text-center ${step === 3 ? "text-blue-600 bg-white" : "text-slate-500"}`}>
          3. Slot & Confirmation
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-bold text-slate-800 block mb-2">
                Select Authorized Dealership Workshop
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dealerships.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setDealershipId(d.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      dealershipId === d.id
                        ? "border-blue-600 bg-blue-50/50 text-blue-950 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{d.name}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {d.city}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{d.address}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-800 block mb-2">
                Choose Service Package
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setServiceCategoryId(c.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      serviceCategoryId === c.id
                        ? "border-blue-600 bg-blue-50/50 text-blue-950 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{c.name}</span>
                        <span className="font-black text-xs text-blue-600">{formatPrice(c.basePrice)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-slate-400 font-medium">
                      Est. Duration: {c.durationMinutes} minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="gap-2 font-bold">
                Continue to Vehicle Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Vehicle Identification</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vBrand">Automobile Brand / Make</Label>
                <Input
                  id="vBrand"
                  placeholder="e.g. Tata, Mahindra, Hyundai"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="vModel">Model & Variant</Label>
                <Input
                  id="vModel"
                  placeholder="e.g. Harrier Dark Edition"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="vReg">Vehicle Registration Number (License Plate)</Label>
                <Input
                  id="vReg"
                  placeholder="MH 02 FJ 4812"
                  value={vehicleRegistration}
                  onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
                  className="mt-1 uppercase tracking-wider font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Used to pull service logs and identify vehicle at bay gate.</p>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="vNotes">Specific Concerns or Issues (Optional)</Label>
                <textarea
                  id="vNotes"
                  rows={3}
                  placeholder="e.g. Squeaking sound from brakes, AC not cooling in high heat..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2 font-bold">
                Continue to Time Slots
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Select Date & Time Slot</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bDate">Preferred Service Date</Label>
                <Input
                  id="bDate"
                  type="date"
                  min={tomorrow}
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="block mb-1">Available Bay Time Slots</Label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setPreferredTimeSlot(slot)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition ${
                        preferredTimeSlot === slot
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                Booking Summary
              </div>
              <div className="flex justify-between">
                <span>Workshop:</span>
                <span className="font-semibold text-slate-900">{selectedDealer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Package:</span>
                <span className="font-semibold text-slate-900">{selectedCategory?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Vehicle:</span>
                <span className="font-semibold text-slate-900">{vehicleBrand} {vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Spares & Labor Base:</span>
                <span className="font-black text-blue-600">{formatPrice(selectedCategory?.basePrice || 0)}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" size="lg" isLoading={isLoading} className="font-bold">
                Confirm Service Booking
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
