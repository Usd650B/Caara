"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, Star, Truck, Shield, ArrowRight, Heart, Zap, CheckCircle
} from "lucide-react";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { trackVisitor } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    trackVisitor();
    const loadData = async () => {
      setIsLoading(true);
      const [all, promosData] = await Promise.all([getProducts(), getPromos()]);
      setProducts(all.filter(p => p.category === "Handbags"));
      setPromos(promosData);
      setIsLoading(false);
    };
    loadData();
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-100 mb-2 rounded-xl" />
                <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Coming Soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                promoPrice={getPromoPrice(product.id || '', product.price, promos)}
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us — Social Proof Strip */}
      <section className="px-4 sm:px-6 py-12 max-w-screen-xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-500 mb-1">Why SheDoo</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What makes us different</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { emoji: "✨", title: "Premium Quality", desc: "Every bag is handpicked for superior craftsmanship and materials you can feel." },
            { emoji: "🚚", title: "Fast Delivery", desc: "Free shipping in Dar es Salaam. Regional orders arrive within 5-7 business days." },
            { emoji: "🛡️", title: "Buyer Protection", desc: "100% secure checkout with full buyer protection and hassle-free returns." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
              <span className="text-3xl mb-3 block">{emoji}</span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mx-4 sm:mx-6 mb-8">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl max-w-screen-xl mx-auto py-10 px-8 sm:px-16 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Stay in the loop</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Never miss a drop</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Be the first to know about new arrivals, exclusive promos, and limited collections.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 h-11 px-4 border border-gray-200 rounded-xl text-sm focus:border-black focus:outline-none transition-colors" />
            <Button className="bg-black text-white hover:bg-gray-800 h-11 px-6 text-sm font-semibold rounded-xl shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Brand promise strip */}
      <section className="mx-4 sm:mx-6 mb-20">
        <div className="bg-black rounded-2xl max-w-screen-xl mx-auto py-12 px-8 sm:px-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="text-center md:text-left">
            <p className="text-pink-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Our Promise</p>
            <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Affordable. Premium. SheDoo.
            </h3>
          </div>
          <Link href="/products" className="shrink-0">
            <Button className="bg-white text-black hover:bg-pink-500 hover:text-white h-12 px-8 text-sm font-bold rounded-full transition-colors">
              Shop the Collection
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
