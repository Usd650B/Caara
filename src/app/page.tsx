"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, Star, Truck, Shield, ArrowRight, Heart, Zap, CheckCircle
} from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const all = await getProducts();
      setProducts(all.filter(p => p.category === "Handbags"));
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-poppins)' }}>

      {/* Announcement Bar */}
      <div className="bg-black text-white py-2">
        <div className="flex justify-center items-center gap-6 sm:gap-10 text-[10px] font-medium uppercase tracking-widest overflow-x-auto px-4 whitespace-nowrap">
          <span className="flex items-center gap-1.5 shrink-0"><Truck className="h-3 w-3" /> Free Worldwide Delivery</span>
          <span className="text-white/30">|</span>
          <span className="flex items-center gap-1.5 text-pink-300 shrink-0"><Zap className="h-3 w-3" /> New Arrivals Weekly</span>
          <span className="text-white/30 hidden sm:block">|</span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0"><Shield className="h-3 w-3" /> Buyer Protection</span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-3 pt-3 pb-4 max-w-screen-xl mx-auto">
        <div className="relative h-[400px] sm:h-[520px] rounded-xl overflow-hidden bg-gray-900">
          <img
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=90&w=2000"
            className="w-full h-full object-cover opacity-60"
            alt="SheDoo Luxury Handbags"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-16">
            <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-2">SheDoo Collection 2026</p>
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-3">
              Premium Handbags<br />
              <span className="text-pink-400">For Every Style</span>
            </h1>
            <p className="text-white/60 text-sm max-w-sm mb-6 leading-relaxed">
              Curated luxury for the modern woman — quality you can feel.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="bg-white text-black hover:bg-pink-500 hover:text-white h-10 px-6 text-sm font-semibold rounded transition-colors">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-gray-100 bg-gray-50 py-4 px-4">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Truck, label: "Free Shipping", sub: "On all orders" },
            { icon: Shield, label: "Buyer Protection", sub: "100% secure" },
            { icon: CheckCircle, label: "Authentic Products", sub: "Quality guaranteed" },
            { icon: Zap, label: "Fast Dispatch", sub: "Within 24 hours" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section id="explore-section" className="px-4 sm:px-6 py-8 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Our Handbag Collection</h2>
            <p className="text-xs text-gray-500 mt-0.5">Handpicked for you</p>
          </div>
          <Link href="/products" className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-2" />
                <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-2.5 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Coming Soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white border border-gray-200 hover:border-gray-400 transition-colors block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <LazyImage
                    src={product.image || ""}
                    alt={product.name}
                    className="group-hover:scale-105 transition-transform duration-500"
                    aspectRatio="aspect-[3/4]"
                  />
                  {product.badge && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-black text-white px-1.5 py-0.5">
                      {product.badge}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Heart className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>

                <div className="p-2">
                  <h3 className="text-xs text-gray-700 line-clamp-2 leading-tight mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <span className="text-[10px] font-semibold text-orange-600">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-2.5 w-2.5 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">({product.reviews || 120})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Brand promise strip */}
      <section className="bg-black mx-4 mb-10 rounded-xl py-10 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-1">Our Promise</p>
            <h3 className="text-xl sm:text-3xl font-bold text-white">
              Affordable. Premium. SheDoo.
            </h3>
          </div>
          <Link href="/products">
            <Button className="bg-white text-black hover:bg-pink-500 hover:text-white h-10 px-6 text-sm font-semibold rounded transition-colors">
              Shop the Collection
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
