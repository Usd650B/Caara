"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Star, Filter, Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under TSh 20,000", min: 0, max: 20000 },
  { label: "TSh 20,000 – 50,000", min: 20000, max: 50000 },
  { label: "TSh 50,000 – 100,000", min: 50000, max: 100000 },
  { label: "Over TSh 100,000", min: 100000, max: Infinity },
];

export default function ProductsPage() {
  const { t, formatPrice } = useSettings();
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());

  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceRange = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    return matchesSearch && matchesPriceRange;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "newest": return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search handbags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black border border-gray-300 px-3 h-9 rounded-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="hidden sm:block text-xs">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-sm h-9 text-sm pl-2 pr-6 focus:outline-none focus:border-gray-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">
        {/* Breadcrumb + count */}
        <div className="flex items-center justify-between mb-4">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-black font-medium">Handbags</span>
          </nav>
          <span className="text-xs text-gray-500">
            {isLoading ? "Loading..." : `${sortedProducts.length} result${sortedProducts.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden lg:block w-52 shrink-0 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3 flex items-center justify-between">
                  Price Range
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`block text-sm w-full text-left py-1 transition-colors ${
                        selectedPriceRange.label === r.label
                          ? 'text-black font-semibold'
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <button
                onClick={() => {
                  setSelectedPriceRange(priceRanges[0]);
                  setSearchTerm("");
                }}
                className="text-xs text-gray-400 hover:text-black underline"
              >
                Clear All Filters
              </button>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(searchTerm || selectedPriceRange.label !== "All Prices") && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 text-xs bg-black text-white px-2 py-1 rounded-sm">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {selectedPriceRange.label !== "All Prices" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-black text-white px-2 py-1 rounded-sm">
                    {selectedPriceRange.label}
                    <button onClick={() => setSelectedPriceRange(priceRanges[0])}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-300 rounded bg-white">
                <p className="text-sm text-gray-500 mb-2">No products found</p>
                <button onClick={() => { setSearchTerm(""); setSelectedPriceRange(priceRanges[0]); }} className="text-xs text-black underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {sortedProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group bg-white border border-gray-200 hover:border-gray-400 transition-colors block"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <LazyImage
                        src={p.image || ""}
                        alt={p.name}
                        className="group-hover:scale-105 transition-transform duration-500"
                        aspectRatio="aspect-[3/4]"
                      />

                      {/* Badge */}
                      {p.badge && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-black text-white px-1.5 py-0.5">
                          {p.badge}
                        </span>
                      )}
                      {p.stock !== undefined && p.stock < 10 && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-red-500 text-white px-1.5 py-0.5">
                          Only {p.stock} Left
                        </span>
                      )}

                      {/* Wishlist */}
                      <button
                        onClick={(e) => toggleFavorite(e, p.id as string)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Heart className={`h-3.5 w-3.5 ${favoritedItems.has(p.id as string) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <h3 className="text-xs text-gray-700 line-clamp-2 leading-tight mb-1">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</span>
                        {p.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>
                        )}
                      </div>
                      {p.originalPrice && (
                        <span className="text-[10px] font-semibold text-orange-600">
                          {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                        </span>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`h-2.5 w-2.5 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({p.reviews || 120})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
