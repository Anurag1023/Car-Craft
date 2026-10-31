import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { Building2, MapPin, Phone, Mail, Clock, Car, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DealershipsPage() {
  const dealerships = await prisma.dealership.findMany({
    where: { status: "ACTIVE" },
    include: {
      _count: {
        select: {
          vehicles: true,
          appointments: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>Authorized Partner Network</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Partner Dealerships & Service Hubs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore accredited CarCraft franchise showrooms offering verified vehicle inventories and certified repair bays.
        </p>
      </div>

      {/* Dealerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dealerships.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Cover Banner */}
              <div className="h-44 w-full relative overflow-hidden bg-slate-800">
                <img
                  src={d.logo || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80"}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="bg-blue-600 font-semibold shadow">
                    {d.city}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{d.address}, {d.city}, {d.state}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{d.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{d.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Operating Hours: {d.operatingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Car className="w-4 h-4 text-blue-600" />
                <span>{d._count.vehicles} Vehicles in Showroom</span>
              </div>

              <Link href={`/dealerships/${d.slug}`}>
                <Button size="sm" className="gap-1.5 font-semibold text-xs">
                  Showroom Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
