import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { Building2, MapPin, Phone, Mail, Clock, Car, Star, CalendarCheck2 } from "lucide-react";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface DealershipPageProps {
  params: {
    slug: string;
  };
}

export default async function DealershipProfilePage({ params }: DealershipPageProps) {
  const dealership = await prisma.dealership.findUnique({
    where: { slug: params.slug },
    include: {
      vehicles: {
        include: {
          images: true,
          dealership: true,
        },
        orderBy: { createdAt: "desc" },
      },
      assignedDealer: {
        select: { name: true, email: true },
      },
    },
  });

  if (!dealership) {
    notFound();
  }

  // Fetch reviews for this dealership
  const reviews = await prisma.review.findMany({
    where: {
      targetType: "DEALERSHIP",
      targetId: dealership.id,
    },
    include: {
      customer: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-slate-900">
          <img
            src={dealership.logo || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80"}
            alt={dealership.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-600 font-bold">{dealership.city}</Badge>
              {avgRating && (
                <span className="flex items-center gap-1 bg-amber-500/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {avgRating} ({reviews.length} reviews)
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{dealership.name}</h1>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border-t border-slate-100">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Showroom Address</span>
            </div>
            <p className="font-semibold text-slate-800">{dealership.address}, {dealership.city}, {dealership.state}</p>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Contact Showroom</span>
            </div>
            <p className="font-semibold text-slate-800">{dealership.contactNumber} • {dealership.email}</p>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Working Hours</span>
            </div>
            <p className="font-semibold text-slate-800">{dealership.operatingHours} (Mon - Sun)</p>
          </div>
        </div>
      </div>

      {/* Showroom Vehicles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Live Vehicles at this Dealership ({dealership.vehicles.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available for immediate physical inspection and test drive
            </p>
          </div>

          <Link href={`/services?dealershipId=${dealership.id}`}>
            <Button className="gap-2">
              <CalendarCheck2 className="w-4 h-4" />
              Book Service Here
            </Button>
          </Link>
        </div>

        {dealership.vehicles.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No vehicles listed currently at this location</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealership.vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Showroom Reviews</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified feedback from customers who visited this location</p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{avgRating}</span>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(avgRating)) ? "fill-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No reviews recorded yet for this dealership.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{r.customer.name}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{r.reviewText}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
