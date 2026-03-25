"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, Star, Sparkles,
  Zap, Truck, Shield, ArrowRight,
  Heart, CheckCircle
} from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const all = await getProducts();
      // Only show handbags — filter strictly by category
      setProducts(all.filter(p => p.category === "Handbags"));
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-poppins)' }}>

      {/* Top Announcement Bar */}
      <div className="bg-black text-white py-2">
        <div className="flex justify-center items-center gap-4 sm:gap-8 text-[9px] font-bold uppercase tracking-widest overflow-x-auto scrollbar-hide px-4 whitespace-nowrap">
          <span className="flex items-center gap-1.5 shrink-0">
            <Truck className="h-3 w-3" /> Free Worldwide Delivery
          </span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1.5 text-pink-300 shrink-0">
            <Zap className="h-3 w-3 fill-current" /> New Handbag Drops
          </span>
          <span className="text-white/30 hidden sm:block">|</span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Shield className="h-3 w-3" /> Secure Buy Protection
          </span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="px-3 pt-3 pb-2 sm:py-6 max-w-screen-2xl mx-auto">
        <div className="relative h-[520px] sm:h-[780px] rounded-3xl sm:rounded-[4rem] overflow-hidden shadow-2xl group border border-black/5 bg-[#1a1a1a]">
          <img
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=90&w=2400"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[5000ms] ease-out opacity-70"
            alt="SheDoo Luxury Handbags"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Content — anchored to bottom-left */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-20 gap-6">
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 w-fit">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">SheDoo 2026 Collection</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-tight text-white drop-shadow-lg">
                Affordable<br />
                <span className="text-pink-500 italic font-light normal-case">Stylish </span>
                Handbags
              </h1>
              <p className="mt-3 text-white/60 text-sm sm:text-base font-medium max-w-md leading-relaxed">
                Curated luxury for the modern woman — premium quality at prices that make sense.
              </p>
            </div>

            {/* Promise chips */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Affordable & Premium</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Truck className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Express Global Delivery</span>
              </div>
            </div>

            {/* CTA */}
            <div>
              <Button
                onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-black hover:bg-pink-500 hover:text-white h-14 px-10 text-[10px] font-black uppercase tracking-[0.4em] transition-all rounded-2xl shadow-xl group active:scale-95"
              >
                Shop Now
                <ShoppingBag className="ml-3 h-5 w-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section id="explore-section" className="px-4 sm:px-10 py-16 max-w-screen-2xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none text-black">
              The Collection
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-2">
              SheDoo Handbags — handpicked for you
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              placeholder="Search handbags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-5 pr-5 bg-black/[0.03] border border-black/5 focus:border-black/20 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="aspect-[3/4] bg-gray-100 rounded-3xl" />
                <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-40 bg-gray-50 rounded-3xl border border-dashed border-black/10">
            <ShoppingBag className="h-16 w-16 text-black/10 mx-auto mb-4" />
            <h3 className="text-xl font-black text-black/20 uppercase tracking-widest">
              {searchTerm ? "No Matches" : "Coming Soon"}
            </h3>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 border border-black/[0.04] shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-black/10 group-hover:-translate-y-1">
                  <LazyImage
                    src={product.image || ""}
                    alt={product.name}
                    className="transition-transform duration-[1200ms] group-hover:scale-108"
                    aspectRatio="aspect-[3/4]"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                      {product.badge}
                    </span>
                  )}
                  {product.stock !== undefined && product.stock < 10 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                      Only {product.stock} Left
                    </span>
                  )}

                  {/* Wishlist */}
                  <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md">
                    <Heart className="h-3.5 w-3.5 text-black/30 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-5">
                    <div className="bg-white/95 backdrop-blur px-6 py-2.5 rounded-xl shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <span className="text-[9px] font-black uppercase tracking-widest text-black">View Details</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="pt-4 px-1 space-y-2">
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-black tracking-tighter">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-black/25 line-through font-bold">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="h-2.5 w-2.5 fill-black/70 text-black/70" />
                    ))}
                    <span className="text-[9px] font-black text-black/30 ml-1">4.9</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Brand Strip ── */}
      <section className="bg-black py-16 px-6 rounded-3xl mx-4 mb-16">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-2">Our Promise</p>
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">
              Affordable.<br/>Premium. SheDoo.
            </h3>
          </div>
          <div className="flex flex-wrap gap-6 sm:gap-10 opacity-40">
            {['Authentic', 'Secured', 'Premium', 'Global'].map(l => (
              <span key={l} className="text-white font-black text-sm tracking-[0.3em] uppercase">{l}</span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
