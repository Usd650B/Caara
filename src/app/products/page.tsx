"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, Star, Filter, Search, ChevronDown, X, SlidersHorizontal, ShoppingBag, Sparkles, ArrowUpDown } from "lucide-react";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";

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
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

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
    const loadData = async () => {
      setIsLoading(true);
      const [productsData, promosData] = await Promise.all([getProducts(), getPromos()]);
      setProducts(productsData);
      setPromos(promosData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Staggered entrance animation
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const timer = setTimeout(() => {
        products.forEach((_, idx) => {
          setTimeout(() => {
            setVisibleItems(prev => new Set(prev).add(idx));
          }, idx * 60);
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, products]);

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
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-outfit)' }}>

      {/* Page Header */}
      <section className="pt-24 pb-10 px-5 sm:px-8 max-w-screen-xl mx-auto">
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-3">Collection</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-[var(--brand-dark)] tracking-tight leading-tight mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            All Products
          </h1>
          <p className="text-gray-400 text-sm max-w-md">
            Discover bags crafted for every occasion — from everyday ease to weekend statements.
          </p>
        </div>
      </section>


      {/* 🔎 Search & Filter Bar */}
      <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bags, collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 h-11 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:bg-white transition-all duration-300"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-sm border-2 px-5 h-11 rounded-xl font-bold transition-all duration-300 ${
                  showFilters || hasActiveFilters
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && <span className="ml-0.5 w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: 'var(--brand-accent)' }} />}
              </button>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 bg-gray-50 rounded-xl h-11 text-sm font-semibold pl-9 pr-8 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 cursor-pointer appearance-none transition-all duration-300 hover:bg-gray-100"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 py-8">
        {/* Breadcrumb + count */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span className="text-gray-200">/</span>
            <span className="text-gray-900 font-semibold">Products</span>
          </nav>
          <span className="text-sm text-gray-400 font-medium">
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
                Loading...
              </span>
            ) : (
              <span>{sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}</span>
            )}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden lg:flex flex-col w-60 shrink-0 gap-6 bg-gray-50/80 border border-gray-100 rounded-2xl p-6 h-fit sticky top-24">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-900 mb-4 flex items-center justify-between">
                  Price Range
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </h3>
                <div className="space-y-1">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`block text-sm w-full text-left py-2.5 px-3 rounded-xl transition-all duration-200 font-medium ${
                        selectedPriceRange.label === r.label
                          ? 'text-white bg-gray-900 font-semibold shadow-md'
                          : 'text-gray-500 hover:text-black hover:bg-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-[var(--brand-primary)] font-semibold uppercase tracking-wider transition-colors text-left"
              >
                Clear All Filters
              </button>
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full font-semibold">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:bg-white/20 rounded-full p-0.5 transition-colors"><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedPriceRange.label !== "All Prices" && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full font-semibold">
                    {selectedPriceRange.label}
                    <button onClick={() => setSelectedPriceRange(priceRanges[0])} className="hover:bg-white/20 rounded-full p-0.5 transition-colors"><X className="h-3 w-3" /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs font-bold hover:text-[var(--brand-primary-dark)] transition-colors ml-1" style={{ color: 'var(--brand-primary)' }}>
                  Clear all
                </button>
              </div>
            )}

            {/* Mobile filter options (when shown) */}
            {showFilters && (
              <div className="lg:hidden bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-900 mb-3">Price Range</h3>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`text-xs px-4 py-2 rounded-full border-2 transition-all duration-200 font-semibold ${
                        selectedPriceRange.label === r.label
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl mb-4" />
                    <div className="px-1 space-y-2.5">
                      <div className="h-4 bg-gray-100 rounded-full w-4/5" />
                      <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-3 bg-gray-50 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShoppingBag className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-base text-gray-500 font-semibold mb-2">No products found</p>
                <p className="text-sm text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="text-sm font-bold text-white px-6 py-2.5 rounded-full transition-colors" style={{ background: 'var(--brand-primary)' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8"
              >
                {sortedProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className="transition-all duration-500 ease-out"
                    style={{
                      opacity: visibleItems.has(idx) ? 1 : 0,
                      transform: visibleItems.has(idx) ? 'translateY(0)' : 'translateY(24px)',
                    }}
                  >
                    <ProductCard
                      product={p}
                      isFavorited={favoritedItems.has(p.id as string)}
                      onToggleFavorite={toggleFavorite}
                      promoPrice={getPromoPrice(p.id || '', p.price, promos)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
