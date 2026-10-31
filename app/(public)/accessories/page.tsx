import prisma from "@/lib/db/prisma";
import { AccessoriesCatalog } from "@/components/accessories/accessories-catalog";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccessoriesPage() {
  const [categories, products] = await Promise.all([
    prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <ShoppingBag className="w-4 h-4" />
          <span>Automotive Spare Parts & Gear</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Genuine Automotive Accessories
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Curated car care, electronics, 7D floor mats, and performance spares with doorstep delivery across India.
        </p>
      </div>

      {/* Catalog */}
      <AccessoriesCatalog categories={categories} products={products} />
    </div>
  );
}
