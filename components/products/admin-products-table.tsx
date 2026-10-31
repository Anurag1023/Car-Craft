"use client";

import { useState } from "react";
import { Product, ProductCategory, ProductImage, ProductStatus } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { Check, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  products: (Product & {
    category: ProductCategory;
    images: ProductImage[];
  })[];
}

export function AdminProductsTable({ products: initial }: Props) {
  const [products, setProducts] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id);
    setEditStock(p.stockQuantity);
    setEditPrice(p.price);
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockQuantity: editStock,
          price: editPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Update Failed", data.error);
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stockQuantity: editStock, price: editPrice } : p
        )
      );
      toast.success("Product Updated", data.message);
      setEditingId(null);
    } catch {
      toast.error("Error", "Could not update product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs min-w-[750px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
            <th className="p-4">Product Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">SKU</th>
            <th className="p-4">Price (₹)</th>
            <th className="p-4">Available Stock</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={p.images[0]?.url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=100&auto=format&fit=crop&q=80"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{p.brand}</p>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-slate-600 font-medium">
                  {p.category.name}
                </td>

                <td className="p-4 font-mono text-[11px] text-slate-500">
                  {p.sku}
                </td>

                <td className="p-4 font-black text-slate-900">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="h-8 w-24 text-xs"
                    />
                  ) : (
                    formatPrice(p.price)
                  )}
                </td>

                <td className="p-4">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="h-8 w-20 text-xs"
                    />
                  ) : (
                    <span className={`font-bold ${p.stockQuantity <= 5 ? "text-rose-600" : "text-slate-800"}`}>
                      {p.stockQuantity} units
                    </span>
                  )}
                </td>

                <td className="p-4 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        isLoading={isSaving}
                        onClick={() => handleSave(p.id)}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(p)}
                      className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit Stock
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
