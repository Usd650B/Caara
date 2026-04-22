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
  { label: "All Prices", min: 0, max: 999999999 },
  { label: "Under TSh 50,000", min: 0, max: 50000 },
  { label: "TSh 50,000 – 150,000", min: 50000, max: 150000 },
  { label: "Over TSh 150,000", min: 150000, max: 999999999 },
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
        const validProducts = (productsData || []).filter(p => p && p.id && p.name && typeof p.price === 'number');
        setProducts(validProducts);
        setPromos(promosData || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = (products || []).filter(product => {
    if (!product || !product.name) return false;
    const matchesSearch = product.name.toLowerCase().includes((searchTerm || "").toLowerCase());
    const price = product.price || 0;
    const matchesPriceRange = price >= (selectedPriceRange?.min || 0) && price <= (selectedPriceRange?.max || 999999999);
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesPriceRange && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a?.price || 0;
    const priceB = b?.price || 0;
    switch (sortBy) {
      case "price-low": return priceA - priceB;
      case "price-high": return priceB - priceA;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white pb-32">
      <WhatsAppButton />
      
      {/* Header */}
      <section className="pt-32 pb-16 section-container relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-secondary/5 rounded-full blur-[100px] -mr-64 -mt-32" />
         <div className="relative z-10">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 font-outfit">
               <Link href="/" className="hover:text-black transition-colors">House of SheDoo</Link>
               <span className="text-zinc-200">/</span>
               <span className="text-black italic">The Collection</span>
            </nav>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6">Discovery <span className="luxury-italic font-medium text-brand-secondary">& Artistry</span></h1>
            <p className="text-zinc-500 max-w-xl text-lg font-medium leading-relaxed">
               Artisanal craftsmanship meets contemporary silhouette. Explore our meticulously curated selection of premium leather goods.
            </p>
         </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-y border-zinc-100/80">
        <div className="section-container py-5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full border transition-all ${showFilters ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'}`}
            >
              <SlidersHorizontal size={14} className={showFilters ? 'animate-pulse' : 'group-hover:rotate-180 transition-transform duration-500'} />
              {showFilters ? 'Minimize Selection' : 'Refine Search'}
            </button>
            <div className="relative flex-1 max-w-lg hidden lg:block">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search the collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 h-14 bg-zinc-50/50 border-none rounded-full text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-black transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hidden sm:block">{sortedProducts.length} Results</span>
             <div className="relative group">
                <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  {sortBy === 'newest' ? 'Popularity' : sortBy === 'price-low' ? 'Value: Low-High' : 'Value: High-Low'}
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute right-0 top-full mt-3 w-56 bg-white shadow-2xl rounded-[32px] p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-zinc-100 scale-95 group-hover:scale-100">
                   {[
                     { label: 'Sort by Popularity', value: 'newest' },
                     { label: 'Price: Low to High', value: 'price-low' },
                     { label: 'Price: High to Low', value: 'price-high' }
                   ].map((option) => (
                     <button
                       key={option.value}
                       onClick={() => setSortBy(option.value)}
                       className={`w-full flex items-center justify-between px-6 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${sortBy === option.value ? 'bg-black text-white' : 'hover:bg-zinc-50'}`}
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

      <div className="section-container py-16 flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-full lg:w-72 flex flex-col gap-12 animate-fade-up">
            <div className="lg:hidden mb-4">
               <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-8 h-14 bg-zinc-50 border-none rounded-full text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="animate-fade-up">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-zinc-400">Artisan Category</h3>
              <div className="flex flex-col gap-5">
                 {categories.map((cat) => (
                   <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] font-bold uppercase tracking-[0.1em] text-left transition-all flex items-center justify-between group ${selectedCategory === cat ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
                   >
                     <span className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedCategory === cat ? 'bg-brand-secondary scale-150' : 'bg-transparent border border-zinc-200'}`} />
                        {cat}
                     </span>
                   </button>
                 ))}
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-zinc-400">Valuation Range</h3>
              <div className="flex flex-col gap-5">
                 {priceRanges.map((range) => (
                   <button 
                    key={range.label}
                    onClick={() => setSelectedPriceRange(range)}
                    className={`text-[11px] font-bold uppercase tracking-[0.1em] text-left transition-all flex items-center justify-between group ${selectedPriceRange.label === range.label ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
                   >
                     <span className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedPriceRange.label === range.label ? 'bg-brand-secondary scale-150' : 'bg-transparent border border-zinc-200'}`} />
                        {range.label}
                     </span>
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
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 hover:text-brand-secondary transition-colors border-t border-zinc-100 pt-8 text-left flex items-center gap-2 group"
            >
              <X size={14} className="group-hover:rotate-90 transition-transform" /> Reset Discovery
            </button>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-zinc-50 rounded-[32px] mb-6" />
                    <div className="h-3 bg-zinc-50 rounded-full w-1/3 mb-4" />
                    <div className="h-5 bg-zinc-50 rounded-full w-2/3 mb-3" />
                    <div className="h-4 bg-zinc-50 rounded-full w-1/4" />
                 </div>
               ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 sm:gap-x-12 sm:gap-y-20">
               {sortedProducts.map((product, idx) => (
                 <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${(idx % 6) * 100}ms` }}>
                    <ProductCard 
                      product={product} 
                      promoPrice={getPromoPrice(product.id || '', product.price, promos)} 
                    />
                 </div>
               ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-zinc-50/50 rounded-[64px] border border-dashed border-zinc-200">
               <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto mb-10">
                  <ShoppingBag className="text-zinc-200" size={40} strokeWidth={1} />
               </div>
               <h3 className="text-3xl font-bold mb-4 italic text-zinc-900">No treasures found</h3>
               <p className="text-zinc-500 mb-12 max-w-xs mx-auto font-medium">Try adjusting your filters or refine your search to discover our collection.</p>
               <button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceRange(priceRanges[0]);
                  setSearchTerm("");
                }}
                className="btn btn-primary px-12 h-16 shadow-2xl"
               >
                 Clear All Filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
