import prisma from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerWishlistPage() {
  const session = await requireAuth();

  const wishlist = await prisma.wishlistItem.findMany({
    where: { customerId: session.user.id },
    include: {
      vehicle: {
        include: {
          images: true,
          dealership: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Vehicles</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your bookmarked cars for future test drive or purchase
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Your Wishlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our vehicle marketplace and click the heart icon on any car to bookmark it here.
          </p>
          <Link href="/vehicles">
            <Button size="sm">Browse Vehicles</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <VehicleCard key={item.id} vehicle={item.vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
