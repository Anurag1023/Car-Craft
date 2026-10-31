import prisma from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";
import { AdminProductsTable } from "@/components/products/admin-products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireRole([Role.ADMIN]);

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accessories & Parts Catalog</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage product pricing, SKU codes, and real-time inventory stock levels ({products.length} products)
        </p>
      </div>

      <AdminProductsTable products={products} />
    </div>
  );
}
