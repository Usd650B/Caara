"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Star, Heart, Sparkles, TrendingUp, 
  Zap, Crown, Diamond, Truck, Clock, Flame, 
  ArrowRight, Filter, Shield, User, Search
} from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = [
    { id: "All", name: t("All"), icon: Sparkles },
    { id: "Dresses", name: t("Dresses"), icon: Diamond },
    { id: "Tops", name: t("Tops"), icon: Crown },
    { id: "Bottoms", name: t("Bottoms"), icon: Heart },
    { id: "Accessories", name: t("Accessories"), icon: Star },
    { id: "Shoes", name: t("Shoes"), icon: Zap },
  ];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-poppins)' }}>
      {/* Subtle Top Bar */}
      <div className="bg-[#f0f0f0] text-black/40 py-1.5 border-b border-black/5">
        <div className="container mx-auto px-4 flex justify-center items-center gap-6 overflow-hidden text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3 w-3" /> {t("Free Delivery over 49$")}
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> {t("Secure Pay")}
          </span>
          <span className="flex items-center gap-1.5 text-black">
            <Zap className="h-3 w-3 fill-current" /> {t("New Daily Drops")}
          </span>
        </div>
      </div>

      {/* Simplified Hero Section - Clean & Fixed Image */}
      <section className="px-4 py-4 sm:py-6 max-w-screen-2xl mx-auto">
        <div className="relative h-[300px] sm:h-[450px] rounded-3xl overflow-hidden group shadow-lg">
          <img 
            src="/images/banner.png" 
            className="w-full h-full object-cover" 
            alt="SheDoo Trends"
            onError={(e) => {
              // Fallback to a clean placeholder if image fails
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent p-10 sm:p-16 flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
                SheDoo <br className="sm:hidden" /> Trends
              </h1>
              <p className="text-white/80 text-xs sm:text-base max-w-md font-medium">
                Modern essentials carefully curated for you. Elevate your everyday style effortlessly.
              </p>
            </div>
            <Button className="bg-white text-black hover:bg-black hover:text-white px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg shadow-xl w-fit">
              Explore Now
            </Button>
          </div>
        </div>
      </section>

      {/* Clean Category Circles - Reduced Size */}
      <section className="py-8 px-4 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex justify-between items-center sm:justify-center gap-8 sm:gap-14 min-w-max">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center group space-y-3 shrink-0"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${activeCategory === cat.id ? 'bg-black text-white shadow-lg' : 'bg-[#f5f5f5] text-black/20 hover:bg-black/5 hover:text-black'}`}>
                <cat.icon className={`h-6 w-6 sm:h-7 sm:w-7`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeCategory === cat.id ? 'text-black' : 'text-black/30'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid - High Density/Cleaner spacing */}
      <section className="px-4 py-12 max-w-screen-2xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 pt-2 border-b border-gray-100">
           <div className="space-y-1 text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">New Generation</h2>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 <p className="text-black/30 text-[9px] font-bold uppercase tracking-widest">Global Stock Hub Ready</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-black/20 h-4 w-4" />
                 <input 
                   placeholder="Scout trends..." 
                   className="w-full pl-12 pr-6 h-12 bg-[#f9f9f9] border-none rounded-xl text-[9px] font-black uppercase tracking-widest focus:ring-0"
                 />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-12 sm:gap-x-6 sm:gap-y-14">
           {isLoading ? (
             Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                   <div className="aspect-[3/4] bg-[#f9f9f9] rounded-2xl" />
                   <div className="h-4 bg-[#f9f9f9] rounded-full w-2/3 mx-auto" />
                   <div className="h-3 bg-[#f9f9f9] rounded-full w-1/3 mx-auto" />
                </div>
             ))
           ) : filteredProducts.length > 0 ? (
             filteredProducts.map((p) => (
               <Link key={p.id} href={`/products/${p.id}`} className="group space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#f9f9f9] relative transition-all duration-700 hover:shadow-2xl">
                     <img src={p.image} className="w-full h-full object-cover transition-all duration-700" alt={p.name} />
                     <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center transition-all hover:bg-black hover:text-white shadow-xl">
                           <Heart className="h-4 w-4" />
                        </button>
                     </div>
                     <div className="absolute inset-x-4 bottom-4 translate-y-12 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                        <Button className="w-full bg-black/90 text-white hover:bg-black h-11 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl">Visual Study</Button>
                     </div>
                  </div>
                  <div className="text-center space-y-1.5">
                     <p className="text-[8px] font-black uppercase tracking-widest text-black/20">{p.category}</p>
                     <h3 className="text-[11px] font-bold text-black/80 uppercase line-clamp-1 group-hover:text-black transition-colors">{p.name}</h3>
                     <p className="text-base font-black text-black tracking-tight">{formatPrice(p.price)}</p>
                  </div>
               </Link>
             ))
           ) : (
             <div className="col-span-full text-center py-32 bg-[#fafafa] rounded-3xl border border-black/[0.03]">
                <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShoppingBag className="h-8 w-8 text-black/10" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">System Empty</h3>
                <p className="text-black/30 text-[9px] font-black uppercase tracking-widest mt-1">Check global branches for the next release.</p>
                <Button onClick={() => setActiveCategory('All')} className="mt-6 bg-black text-white h-12 px-8 rounded-xl font-black text-[9px] uppercase tracking-widest">Reset Discovery</Button>
             </div>
           )}
        </div>
      </section>

      {/* Trust Section Simplified - Clean Fonts */}
      <section className="py-24 bg-[#050505] text-white">
         <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
               <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                     <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide">Elite Gate</h4>
                    <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em] mt-2">Certified Authentic Assets</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                     <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide">Global Stream</h4>
                    <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em] mt-2">Verified Logistics Network</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                     <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide">Strategic Aid</h4>
                    <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.2em] mt-2">Active Intelligence Channel</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
