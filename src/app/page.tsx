"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Star, Heart, Sparkles,
  Zap, Crown, Diamond, Truck,
  Shield, User, Search
} from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

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
    { id: "Wigs", name: t("Premium Wigs"), icon: Crown },
    { id: "Hair Accessories", name: t("Hair Accessories"), icon: Star },
    { id: "Jewellery", name: t("Exquisite Jewels"), icon: Diamond },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
            <Zap className="h-3 w-3 fill-current" /> {t("New Daily Drops")}
          </span>
          <span className="text-white/30 hidden sm:block">|</span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Shield className="h-3 w-3" /> {t("Secure Pay")}
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="px-3 pt-3 pb-2 sm:py-6 max-w-screen-2xl mx-auto">
        <div className="relative h-[240px] sm:h-[450px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
          <img 
            src="/images/wig_hero.png" 
            className="w-full h-full object-cover" 
            alt="SheDoo Glow"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1620331313184-257dc64572ef?w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-16 sm:justify-center space-y-3">
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] animate-in fade-in slide-in-from-left duration-700">
                SheDoo Glow
              </h1>
              <p className="text-white/80 text-[9px] sm:text-base max-w-md font-medium">
                {t("Premium wigs, hair accessories, and exquisite jewels at prices you can afford.")}
              </p>
            </div>
            <Button 
              onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black hover:bg-black hover:text-white px-6 sm:px-8 h-10 sm:h-12 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all rounded-lg shadow-xl w-fit"
            >
              {t("Explore Now")}
            </Button>
          </div>
        </div>
      </section>

      {/* Category Tabs — Mobile friendly horizontal scroll */}
      <section className="py-4 sm:py-6 px-3 sm:px-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full shrink-0 text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-[#f5f5f5] text-black/40 border-transparent hover:border-black/10 hover:text-black'
              }`}
            >
              <cat.icon className="h-3.5 w-3.5 shrink-0" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Collections Spotlight */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <div 
             onClick={() => { setActiveCategory("Wigs"); document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' }); }}
             className="group relative h-[180px] sm:h-[250px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer"
           >
              <img src="/images/wig_hero.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Wigs" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                 <h4 className="text-white font-black uppercase text-sm sm:text-lg tracking-tight">Luxury Wigs</h4>
                 <p className="text-white/60 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-0.5">Lace Fronts • Silk Base</p>
              </div>
           </div>
           <div 
             onClick={() => { setActiveCategory("Hair Accessories"); document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' }); }}
             className="group relative h-[180px] sm:h-[250px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer"
           >
              <img src="/images/hair_acc.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Accessories" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                 <h4 className="text-white font-black uppercase text-sm sm:text-lg tracking-tight">Style Accents</h4>
                 <p className="text-white/60 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-0.5">Silk • Pearls • Gold</p>
              </div>
           </div>
           <div 
             onClick={() => { setActiveCategory("Jewellery"); document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' }); }}
             className="group relative h-[180px] sm:h-[250px] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer"
           >
              <img src="/images/jewelry.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Jewelry" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end">
                 <h4 className="text-white font-black uppercase text-sm sm:text-lg tracking-tight">Exquisite Jewels</h4>
                 <p className="text-white/60 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mt-0.5">Elegance Redefined</p>
              </div>
           </div>
        </div>
      </section>

      {/* Main Product Grid */}
      <section id="explore-section" className="px-3 sm:px-4 pb-16 max-w-screen-2xl mx-auto space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-3xl font-black tracking-tight uppercase">{t("New Products")}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-black/30 text-[9px] font-bold uppercase tracking-widest">{t("Ready to Ship")}</p>
            </div>
          </div>
          {/* Search — more visible border + focus state */}
          <div className="relative flex-1 max-w-[200px] sm:max-w-xs group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${searchTerm ? 'text-black' : 'text-black/30'}`} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("Search products...")}
              className="w-full pl-11 pr-4 h-12 bg-white border-2 border-black/[0.03] group-hover:border-black/10 focus:border-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="aspect-[3/4] bg-[#f0f0f0] rounded-xl sm:rounded-2xl" />
                <div className="h-3 bg-[#f0f0f0] rounded-full w-2/3 mx-auto" />
                <div className="h-2.5 bg-[#f0f0f0] rounded-full w-1/3 mx-auto" />
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group space-y-3">
                <div className="aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#f9f9f9] relative">
                  <img src={p.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={p.name} />
                  {/* Wishlist — always visible on mobile, hover on desktop */}
                  <button className="absolute top-2.5 right-2.5 h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all sm:opacity-0 sm:group-hover:opacity-100">
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  {/* Add to Cart — slides up on hover (desktop only) */}
                  <div className="absolute inset-x-3 bottom-3 translate-y-8 group-hover:translate-y-0 transition-all duration-400 opacity-0 group-hover:opacity-100 hidden sm:block">
                    <Button className="w-full bg-black/90 text-white hover:bg-black h-10 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                      {t("View Product")}
                    </Button>
                  </div>
                  {/* Badge */}
                  {p.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="text-center space-y-1 px-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-black/20">{p.category}</p>
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-black/80 uppercase line-clamp-1 group-hover:text-black transition-colors">{p.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-sm sm:text-base font-black text-black tracking-tight">{formatPrice(p.price)}</p>
                    {p.originalPrice && (
                      <p className="text-[9px] text-black/30 line-through">{formatPrice(p.originalPrice)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20 sm:py-32 bg-[#fafafa] rounded-2xl border border-black/[0.03]">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-7 w-7 text-black/10" />
              </div>
              <h3 className="text-base sm:text-xl font-black uppercase tracking-tight">{t("No Products Yet")}</h3>
              <p className="text-black/30 text-[9px] font-black uppercase tracking-widest mt-1">{t("Check back soon.")}</p>
              <Button onClick={() => setActiveCategory('All')} className="mt-6 bg-black text-white h-11 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest">
                {t("Show All")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section — cleaner + mobile-friendly */}
      <section className="py-12 sm:py-20 bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-3 gap-6 sm:gap-16 text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-wide">{t("Safe Shopping")}</h4>
                <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-1 hidden sm:block">{t("100% Authentic Products")}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-wide">{t("Free Delivery")}</h4>
                <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-1 hidden sm:block">{t("To Your Door")}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                <User className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-wide">{t("24/7 Support")}</h4>
                <p className="text-white/30 text-[8px] font-bold uppercase tracking-widest mt-1 hidden sm:block">{t("Always Here for You")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
