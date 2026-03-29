"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Star, Filter, Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ui/product-card";

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

  const hasActiveFilters = searchTerm || selectedPriceRange.label !== "All Prices";
  const clearFilters = () => { setSearchTerm(""); setSelectedPriceRange(priceRanges[0]); };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800 transition"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-sm border px-3 h-9 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-black'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasActiveFilters && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg h-9 text-sm pl-2 pr-6 focus:outline-none focus:border-gray-800 bg-white cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
        {/* Breadcrumb + count */}
        <div className="relative z-20 flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-[13px] sm:text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-black hover:underline transition-colors px-1 -ml-1 py-1 cursor-pointer">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-black px-1 py-1">Products</span>
          </nav>
          <span className="text-xs text-gray-500">
            {isLoading ? "Loading..." : `${sortedProducts.length} result${sortedProducts.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-5 bg-white border border-gray-200 rounded-xl p-4 h-fit sticky top-20">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3 flex items-center justify-between">
                  Price Range
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </h3>
                <div className="space-y-1.5">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`block text-sm w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                        selectedPriceRange.label === r.label
                          ? 'text-white bg-gray-900 font-semibold'
                          : 'text-gray-500 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-100" />

              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-black underline text-left"
              >
                Clear All Filters
              </button>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {selectedPriceRange.label !== "All Prices" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-900 text-white px-2.5 py-1 rounded-full">
                    {selectedPriceRange.label}
                    <button onClick={() => setSelectedPriceRange(priceRanges[0])}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-gray-500 underline hover:text-black">
                  Clear all
                </button>
              </div>
            )}

            {/* Mobile filter options (when shown) */}
            {showFilters && (
              <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-800 mb-3">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        selectedPriceRange.label === r.label
                          ? 'border-gray-900 bg-gray-900 text-white font-semibold'
                          : 'border-gray-300 text-gray-600 hover:border-gray-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col">
                    <div className="aspect-[4/5] bg-gray-100 rounded-2xl mb-3" />
                    <div className="px-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-300 rounded-xl bg-white">
                <p className="text-sm text-gray-500 mb-3">No products match your search</p>
                <button onClick={clearFilters} className="text-xs font-semibold text-black underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
                {sortedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFavorited={favoritedItems.has(p.id as string)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
