"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Star, Sparkles,
  Zap, Truck, Shield, Search, ArrowRight,
  TrendingUp, Heart, CheckCircle
} from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    // Filter to show only handbags if that becomes a requirement, 
    // but for now we assume the user will only upload handbags.
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-poppins)' }}>

      {/* Top Announcement Bar */}
      <div className="bg-black text-white py-2">
        <div className="flex justify-center items-center gap-4 sm:gap-8 text-[9px] font-bold uppercase tracking-widest overflow-x-auto scrollbar-hide px-4 whitespace-nowrap">
          <span className="flex items-center gap-1.5 shrink-0">
            <Truck className="h-3 w-3" /> {t("Free Delivery over 49$")}
          </span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1.5 text-pink-300 shrink-0">
            <Zap className="h-3 w-3 fill-current" /> {t("New Handbag Drops")}
          </span>
          <span className="text-white/30 hidden sm:block">|</span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Shield className="h-3 w-3" /> {t("Secure Buy Protection")}
          </span>
        </div>
      </div>

      {/* Hero Banner - Handbag Primary Focus */}
      <section className="px-3 pt-3 pb-2 sm:py-6 max-w-screen-2xl mx-auto">
        <div className="relative h-[600px] sm:h-[850px] rounded-[3rem] sm:rounded-[5rem] overflow-hidden shadow-2xl group border border-black/5 bg-[#F9F9F9]">
          <img 
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=100&w=2400" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4000ms] ease-out" 
            alt="SheDoo Luxury Handbags"
          />
          
          {/* High-End Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-10 sm:p-28 space-y-10">
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20">
                <Sparkles className="h-4 w-4 text-pink-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">SheDoo 2026 Collection</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8] text-white DropShadow-lg">
                  Affordable<br/>
                  <span className="text-pink-500 italic font-light lowercase">Stylish</span><br/>
                  Handbags
                </h1>
                <p className="text-white/70 text-sm sm:text-lg font-medium max-w-xl tracking-wide leading-relaxed drop-shadow-md">
                  Curated for distinction. Discover the SheDoo philosophy of accessible luxury, where every stitch defines contemporary elegance.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-10 pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-pink-400 mb-1">Our Promise</span>
                  <span className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase">Affordable <span className="font-light italic lowercase text-white/50">&</span> Premium</span>
                </div>
                <div className="h-12 w-px bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 mb-1.5">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-white">Authentic</span>
                     </div>
                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Premium Leather</span>
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 mb-1.5">
                        <Truck className="h-4 w-4 text-pink-500" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-white">Express</span>
                     </div>
                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Global Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black hover:bg-black hover:text-white h-28 px-16 text-xs font-black uppercase tracking-[0.6em] transition-all rounded-[3rem] shadow-3xl group active:scale-95 z-10"
              >
                {t("Shop Now")}
                <ShoppingBag className="ml-6 h-6 w-6 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Handbag Stream */}
      <section id="explore-section" className="px-6 sm:px-16 py-32 max-w-screen-2xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/5 rounded-full">
               <TrendingUp className="h-4 w-4 text-black/60" />
               <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Modern Trends 2026</span>
            </div>
            <h2 className="text-5xl sm:text-8xl font-black tracking-tighter uppercase leading-none text-black">
               SheDoo Handbag<br/>
               <span className="text-black/10">Collection</span>
            </h2>
          </div>
          
          <div className="relative w-full lg:w-[400px] group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20 group-hover:text-black focus:text-black transition-colors" />
             <input 
                placeholder={t("Filter by name...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 pl-16 pr-8 bg-black/[0.02] border-2 border-transparent focus:border-black/5 focus:bg-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all outline-none"
             />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-12">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="space-y-6 animate-pulse">
                <div className="aspect-[4/5] bg-gray-50 rounded-[3rem]" />
                <div className="h-3 bg-gray-50 rounded-full w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-48 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-black/[0.03]">
            <ShoppingBag className="h-20 w-20 text-black/5 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-black/20 uppercase tracking-widest">{t("Collection Empty")}</h3>
            <p className="text-[10px] font-bold text-black/10 uppercase tracking-widest mt-2">{t("Stay Tuned for the next drop")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 sm:gap-12">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group flex flex-col h-full bg-white">
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-black/[0.03] shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/10 group-hover:-translate-y-2">
                  <LazyImage 
                    src={product.image || ""} 
                    alt={product.name}
                    className="transition-transform duration-[1500ms] group-hover:scale-110"
                    aspectRatio="aspect-[3/4]"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.badge && (
                      <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                        {product.badge}
                      </span>
                    )}
                    {product.stock !== undefined && product.stock < 10 && (
                      <span className="px-3 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                         Only {product.stock} Left
                      </span>
                    )}
                  </div>

                  {/* Top Right Action */}
                  <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-xl hover:scale-110">
                    <Heart className="h-4 w-4 text-black/20 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Centered Overlay Hook */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8">
                     <div className="bg-white/95 backdrop-blur-xl px-10 py-4 rounded-[2rem] shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Secure Item</span>
                     </div>
                  </div>
                </div>

                <div className="pt-8 px-4 space-y-3 flex-1 flex flex-col text-center">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 group-hover:text-black transition-colors">{product.category}</p>
                    <h3 className="text-base font-black text-black tracking-tight uppercase line-clamp-1">{product.name}</h3>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-black tracking-tighter">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-black/20 line-through font-bold">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    
                    {/* Simplified Rating */}
                    <div className="flex items-center gap-1 pt-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="h-2.5 w-2.5 fill-black text-black" />
                      ))}
                      <span className="text-[9px] font-black ml-1">4.9 / 5.0</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-auto">
                    <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black group-hover:gap-4 transition-all">
                       {t("View Details")}
                       <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Simplified Brands/Trust Section */}
      <section className="bg-black py-24 px-8 overflow-hidden rounded-[4rem] mx-4 mb-20 border border-white/10 shadow-3xl">
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
            <div className="w-16 h-1 bg-pink-500 rounded-full" />
            <h3 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter max-w-2xl leading-tight">
               Crafted for the modern woman who demands more.
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {['EST. 2026', 'SECURED', 'PREMIUM', 'GLOBAL'].map(l => (
                  <span key={l} className="text-white font-black text-xl tracking-[0.5em]">{l}</span>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
