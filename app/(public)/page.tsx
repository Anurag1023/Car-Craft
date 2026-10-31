import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { formatPrice, formatPriceCompact, formatNumber } from "@/lib/utils";
import { 
  Car, 
  Search, 
  ShieldCheck, 
  Wrench, 
  ShoppingBag, 
  Building2, 
  ArrowRight, 
  Star, 
  Fuel, 
  Gauge, 
  Settings2,
  CheckCircle2,
  PhoneCall,
  CalendarCheck2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleCard } from "@/components/vehicles/vehicle-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredVehicles, dealerships, featuredProducts, reviews, stats] = await Promise.all([
    prisma.vehicle.findMany({
      where: { isFeatured: true, inventoryStatus: "AVAILABLE" },
      include: {
        dealership: true,
        images: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dealership.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      include: {
        category: true,
        images: true,
      },
      take: 4,
    }),
    prisma.review.findMany({
      take: 3,
      include: {
        customer: true,
      },
      orderBy: { rating: "desc" },
    }),
    prisma.$transaction([
      prisma.vehicle.count(),
      prisma.dealership.count(),
      prisma.product.count(),
      prisma.serviceAppointment.count(),
    ]),
  ]);

  const [totalVehicles, totalDealerships, totalProducts, totalAppointments] = stats;

  const popularBrands = [
    { name: "Tata", logo: "🛡️" },
    { name: "Mahindra", logo: "⚡" },
    { name: "Hyundai", logo: "💎" },
    { name: "Toyota", logo: "🏆" },
    { name: "Maruti Suzuki", logo: "🚀" },
    { name: "Volkswagen", logo: "🇩🇪" },
    { name: "Skoda", logo: "✨" },
    { name: "Kia", logo: "🔥" },
    { name: "Honda", logo: "⚙️" },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Generation Automotive Ecosystem</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Find, Inspect & Own <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
                  Certified Vehicles
                </span>{" "}
                With Certainty.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Connect directly with premier authorized dealerships across India. Explore certified pre-owned cars, genuine OEM accessories, and book certified factory service appointments in one place.
              </p>

              {/* Quick Search Widget */}
              <div className="pt-2">
                <form
                  action="/vehicles"
                  method="GET"
                  className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <div className="relative">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                      Brand / Model
                    </label>
                    <input
                      name="q"
                      type="text"
                      placeholder="e.g. Harrier, XUV700"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                      Fuel Type
                    </label>
                    <select
                      name="fuelType"
                      className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">All Fuel Types</option>
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric (EV)</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-500 font-semibold gap-2">
                      <Search className="h-4 w-4" />
                      Search Cars
                    </Button>
                  </div>
                </form>
              </div>

              {/* Platform Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/10 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-white">{totalVehicles}+</p>
                  <p className="text-xs text-slate-400">Live Vehicles</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{totalDealerships}</p>
                  <p className="text-xs text-slate-400">Dealerships</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{totalProducts}+</p>
                  <p className="text-xs text-slate-400">Accessories</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-xs text-slate-400">Verified</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-800/50 backdrop-blur group">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80"
                  alt="CarCraft Flagship Vehicle"
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-6 space-y-3 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-blue-600">Spotlight Vehicle</Badge>
                    <span className="text-xl font-bold text-white">₹24.99 Lakh</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Tata Harrier Fearless Plus Dark Edition</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5 text-blue-400" /> Diesel</span>
                    <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-blue-400" /> Automatic</span>
                    <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-blue-400" /> 8,500 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR AUTOMOTIVE BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Popular Brands</h2>
          <p className="text-sm text-slate-500">Filter through premium vehicles from leading automakers</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              href={`/vehicles?brand=${encodeURIComponent(brand.name)}`}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition group text-center"
            >
              <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                {brand.logo}
              </span>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED VEHICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Car className="w-4 h-4" />
              <span>Certified Stock</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Vehicles</h2>
            <p className="text-sm text-slate-500 mt-1">Multi-point inspected cars ready for immediate delivery</p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" className="gap-2 font-semibold">
              Browse All {totalVehicles} Vehicles
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>

      {/* 4. AUTHORIZED DEALERSHIPS */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Verified Partners</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Dealerships</h2>
              <p className="text-sm text-slate-500 mt-1">Top-rated showrooms and certified service centers</p>
            </div>
            <Link href="/dealerships">
              <Button variant="outline" className="gap-2 font-semibold">
                View All Dealerships
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealerships.map((dealer) => (
              <Link
                key={dealer.id}
                href={`/dealerships/${dealer.slug}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition flex flex-col group"
              >
                <div className="h-32 w-full overflow-hidden relative">
                  <img
                    src={dealer.logo || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"}
                    alt={dealer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur font-semibold">
                      {dealer.city}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-sm">
                      {dealer.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{dealer.address}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-blue-600">{dealer._count.vehicles} Vehicles</span>
                    <span>{dealer.operatingHours}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACCESSORIES STORE SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Genuine Accessories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Automotive Accessories & Parts</h2>
            <p className="text-sm text-slate-500 mt-1">Upgrade your car with tested dashcams, 7D mats, and electronics</p>
          </div>
          <Link href="/accessories">
            <Button variant="outline" className="gap-2 font-semibold">
              Browse Store ({totalProducts} items)
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={prod.images[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {prod.category.name}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{prod.brand}</p>
                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 mt-0.5">{prod.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base text-slate-900">
                      {formatPrice(prod.discountPrice || prod.price)}
                    </span>
                    {prod.discountPrice && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        {formatPrice(prod.price)}
                      </span>
                    )}
                  </div>
                  <Link href={`/accessories`}>
                    <Button size="sm" variant="secondary" className="text-xs">
                      View Store
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW CARCRAFT WORKS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How CarCraft Works</h2>
            <p className="text-sm text-slate-400">
              The seamless digital bridge between automotive buyers, accredited dealerships, and certified technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Compare & Inquire</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter verified inventory by fuel type, price, transmission, or specs. Add up to 3 cars to our side-by-side comparison engine and contact dealer directly.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Shop Authentic Gear</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse catalog of dashcams, 7D mats, and accessories. Add to cart and complete checkout with our multi-channel simulated mock payment gateway.
              </p>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Book Certified Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your service category, pick an open time slot at your preferred dealership, and track service status live from your customer portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SERVICE PROMO CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge className="bg-blue-500/30 text-blue-100 border-none font-semibold">
              Precision Workshop
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
              Need Periodic Maintenance or ECU Diagnostics?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Book certified dealership technicians with guaranteed transparent pricing, genuine spares, and automated time-slot reservations.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/services">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-lg">
                  <CalendarCheck2 className="w-4 h-4 mr-2" />
                  Schedule Service Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS & REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What Customers Say</h2>
          <p className="text-sm text-slate-500">Verified reviews from CarCraft drivers and car owners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;{rev.reviewText}&rdquo;
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{rev.customer.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{rev.targetType}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
