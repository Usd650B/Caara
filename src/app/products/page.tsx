"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ShoppingBag, X, ChevronDown, Check } from "lucide-react";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";
import WhatsAppButton from "@/components/ui/whatsapp-button";

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under TSh 50,000", min: 0, max: 50000 },
  { label: "TSh 50,000 – 150,000", min: 50000, max: 150000 },
  { label: "Over TSh 150,000", min: 150000, max: Infinity },
];

const categories = ["All", "Casual", "Luxury", "Travel"];

export default function ProductsPage() {
  const { t, formatPrice } = useSettings();
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, promosData] = await Promise.all([getProducts(), getPromos()]);
        setProducts(productsData);
        setPromos(promosData);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceRange = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesPriceRange && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <WhatsAppButton />
      
      {/* Header */}
      <section className="pt-20 pb-12 section-container">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-black">All Products</span>
        </nav>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Shop All</h1>
        <p className="text-zinc-500 max-w-lg">Explore our curated collection of handbags, designed for every journey and every style.</p>
      </section>

      {/* Toolbar */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-y border-zinc-100">
        <div className="section-container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-zinc-200 hover:border-black transition-all"
            >
              <SlidersHorizontal size={14} />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-11 bg-zinc-50 border-none rounded-full text-sm focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-xs text-zinc-400 hidden sm:block">{sortedProducts.length} Products</span>
             <div className="relative group">
                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full bg-zinc-100">
                  {sortBy === 'newest' ? 'Popular' : sortBy === 'price-low' ? 'Price: Low-High' : 'Price: High-Low'}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-soft rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 border border-zinc-100">
                   {[
                     { label: 'Popular', value: 'newest' },
                     { label: 'Price: Low to High', value: 'price-low' },
                     { label: 'Price: High to Low', value: 'price-high' }
                   ].map((option) => (
                     <button
                       key={option.value}
                       onClick={() => setSortBy(option.value)}
                       className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium hover:bg-zinc-50 rounded-xl transition-colors"
                     >
                       {option.label}
                       {sortBy === option.value && <Check size={14} />}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="section-container py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-full md:w-64 flex flex-col gap-10 animate-fade-up">
            <div className="md:hidden mb-8">
               <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 h-12 bg-zinc-50 border-none rounded-full text-sm focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Categories</h3>
              <div className="flex flex-col gap-3">
                 {categories.map((cat) => (
                   <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm text-left transition-colors flex items-center justify-between ${selectedCategory === cat ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}
                   >
                     {cat}
                     {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                   </button>
                 ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Price Range</h3>
              <div className="flex flex-col gap-3">
                 {priceRanges.map((range) => (
                   <button 
                    key={range.label}
                    onClick={() => setSelectedPriceRange(range)}
                    className={`text-sm text-left transition-colors flex items-center justify-between ${selectedPriceRange.label === range.label ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}
                   >
                     {range.label}
                     {selectedPriceRange.label === range.label && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                   </button>
                 ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedCategory("All");
                setSelectedPriceRange(priceRanges[0]);
                setSearchTerm("");
              }}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors border-t border-zinc-100 pt-6 text-left"
            >
              Clear All
            </button>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-zinc-100 rounded-2xl mb-4" />
                    <div className="h-4 bg-zinc-100 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-zinc-100 rounded w-1/4" />
                 </div>
               ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
               {sortedProducts.map((product) => (
                 <ProductCard 
                  key={product.id} 
                  product={product} 
                  promoPrice={getPromoPrice(product.id || '', product.price, promos)} 
                 />
               ))}
            </div>
          ) : (
            <div className="py-24 text-center">
               <ShoppingBag className="mx-auto text-zinc-200 mb-6" size={48} strokeWidth={1} />
               <h3 className="text-lg font-bold mb-2">No products found</h3>
               <p className="text-zinc-500 mb-8">Try adjusting your filters or search term.</p>
               <button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceRange(priceRanges[0]);
                  setSearchTerm("");
                }}
                className="btn btn-primary"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
