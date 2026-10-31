"use client";

import { useState } from "react";
import { Product, ProductCategory, ProductImage } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { ShoppingBag, Search, Check, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AccessoriesCatalogProps {
  categories: ProductCategory[];
  products: (Product & {
    category: ProductCategory;
    images: ProductImage[];
  })[];
}

export function AccessoriesCatalog({ categories, products }: AccessoriesCatalogProps) {
  const { addToCart, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") {
      return (a.discountPrice || a.price) - (b.discountPrice || b.price);
    }
    if (sortBy === "price_desc") {
      return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    }
    return 0; // Default
  });

  const getItemCartQty = (productId: string) => {
    const found = items.find((i) => i.productId === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-8">
      {/* Category Pills & Filter Controls */}
      <div className="space-y-4">
        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search accessories, dashcams, mats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === c.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No products match your search</h3>
          <p className="text-xs text-slate-500">Try changing keywords or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((p) => {
            const inCartQty = getItemCartQty(p.id);
            const isOutOfStock = p.stockQuantity <= 0;
            const primaryImg =
              p.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80";

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.category.name}
                      </span>
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {p.brand}
                      </span>
                      <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & Add to Cart */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="font-black text-slate-900 text-base">
                        {formatPrice(p.discountPrice || p.price)}
                      </span>
                      {p.discountPrice && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Unavailable"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    disabled={isOutOfStock}
                    onClick={() =>
                      addToCart({
                        id: p.id,
                        name: p.name,
                        price: p.discountPrice || p.price,
                        image: primaryImg,
                        stockQuantity: p.stockQuantity,
                      })
                    }
                    className={`w-full font-semibold text-xs h-9 gap-1.5 ${
                      inCartQty > 0
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {inCartQty > 0 ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        In Cart ({inCartQty})
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
