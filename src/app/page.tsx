"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, Star, Truck, Shield, ArrowRight, Heart, Zap, CheckCircle, 
  Wallet, RefreshCcw, StarHalf, MessageSquare, Clock, Package, MapPin
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
      try {
        const [all, promosData] = await Promise.all([getProducts(), getPromos()]);
        // Filter handbags and sort/limit for "Featured" look
        const handbags = all.filter(p => p.category === "Handbags");
        setProducts(handbags.slice(0, 6)); // Best 6 products
        setPromos(promosData);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const testimonials = [
    {
      name: "Neema K.",
      text: "I love this bag! The quality is amazing for the price. Definitely exceeded my expectations.",
      rating: 5,
      date: "2 days ago"
    },
    {
      name: "Aisha M.",
      text: "Got mine in 2 days. The color is exactly like the photo. Definitely ordering again soon!",
      rating: 5,
      date: "1 week ago"
    },
    {
      name: "Zuwena R.",
      text: "Perfect size and very elegant. I've received so many compliments at work already.",
      rating: 5,
      date: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-outfit)' }}>

      {/* 1. 🔥 HERO SECTION */}
      <section className="relative h-[600px] sm:h-[700px] w-full overflow-hidden">
        <img
          src="/images/hero-lifestyle.png"
          className="w-full h-full object-cover object-center"
          alt="Elegant woman with SheDoo handbag"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
          <div className="max-w-screen-xl mx-auto px-6 sm:px-12 w-full pt-20 md:pt-0">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-pink-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6 animate-bounce">
                New Collection 2026
              </span>
              <h1 className="text-4xl sm:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Luxury Handbags <br />
                <span className="text-pink-400">For Your Style</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 font-medium mb-10 leading-relaxed max-w-lg">
                Premium quality bags. Affordable prices. <br className="hidden sm:block" />
                Trusted by modern women.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-white text-black hover:bg-pink-500 hover:text-white px-10 py-7 text-lg font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-pink-500/20 group">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ✅ TRUST BAR */}
      <section className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            {[
              { icon: Truck, text: "Free Delivery Available", sub: "Speedy & Secure" },
              { icon: Wallet, text: "Pay on Delivery", textAlt: "Secure Options", sub: "Flexible Payments" },
              { icon: RefreshCcw, text: "7-Day Return Guarantee", sub: "Hassle-free" },
              { icon: Shield, text: "Secure Checkout", sub: "100% Protected" },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 sm:justify-center group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{text}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 👜 FEATURED COLLECTION */}
      <section className="py-20 px-4 sm:px-6 max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-md">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Best Sellers</h2>
            <p className="text-gray-500 text-base">Handpicked favorites that combine timeless elegance with modern flair.</p>
          </div>
          <Link href="/products" className="group text-sm font-bold text-black border-b-2 border-black pb-1 hover:text-pink-500 hover:border-pink-500 transition-colors inline-flex items-center gap-2">
            View All Products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-100 mb-4 rounded-3xl" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Coming Soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  badge: idx === 0 ? "🔥 Best Seller" : idx === 1 ? "⭐ Most Loved" : idx === 2 ? "Limited Stock" : undefined
                }}
                promoPrice={getPromoPrice(product.id || '', product.price, promos)}
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. 💬 SOCIAL PROOF */}
      <section className="bg-black py-24">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved by Modern Women</h2>
            <p className="text-white/60 max-w-xl mx-auto">Join thousands of happy customers who elevated their style with SheDoo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-white/30 text-xs">{t.date}</span>
                </div>
                <p className="text-white/80 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                    {t.name[0]}
                  </div>
                  <span className="text-white font-semibold text-sm">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 🎯 WHY CHOOSE US */}
      <section className="py-24 px-6 sm:px-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Why Choose <span className="text-pink-500">SheDoo?</span>
            </h2>
            <div className="space-y-8">
              {[
                { title: "Affordable luxury", desc: "We believe style shouldn't cost a fortune. Get the look and feel of luxury at prices you'll love.", icon: Crown },
                { title: "Unique designs", desc: "Handpicked collections you won't find at Jumia or typical Instagram sellers.", icon: Star },
                { title: "Fast & reliable delivery", desc: "We ship your orders within 24-48 hours with real-time tracking.", icon: Truck },
                { title: "Customer-first support", desc: "Our team is available on WhatsApp and Phone for anything you need.", icon: MessageSquare },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="flex gap-4 group">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6 text-pink-500 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1000" 
                className="w-full h-full object-cover"
                alt="SheDoo craftsmanship"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl max-w-xs border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-bold text-gray-900">Quality Guaranteed</span>
              </div>
              <p className="text-xs text-gray-500">Every bag undergoes intensive quality checks before dispatch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 📍 ABOUT US & LOCATION (The "Trust Builder") */}
      <section className="bg-gray-50 py-24 px-6 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="/images/about-us.png" 
                  className="w-full h-auto object-cover"
                  alt="SheDoo Warehouse and Office"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="mb-8">
                <span className="text-pink-500 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Meet the Brand</span>
                <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                  Authentic Service, <br />
                  <span className="text-pink-500">Real People.</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium">
                  At SheDoo, we aren't just an online store. We are a dedicated team of fashion enthusiasts committed to bringing premium quality handbags to the modern woman without the luxury markup.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Our Warehouse & HQ</h4>
                      <p className="text-gray-500 text-sm leading-relaxed mb-2">
                        We operate from our main office and central warehouse located in:
                      </p>
                      <div className="flex items-center gap-2 text-pink-600 font-bold uppercase tracking-wider text-xs">
                        <MapPin className="h-4 w-4" />
                        Mbezi Mwisho, Dar es Salaam
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-2xl font-black text-gray-900 mb-1">100%</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Direct Inspection On Each Item</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-2xl font-black text-gray-900 mb-1">3hr</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Average Response On WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ⏳ URGENCY SECTION */}
      <section className="px-6 sm:px-8 mb-24">
        <div className="max-w-screen-xl mx-auto rounded-[40px] bg-gradient-to-r from-pink-600 to-rose-700 py-16 px-10 text-center relative overflow-hidden">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
              <Clock className="h-4 w-4 text-white animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Selling Fast!</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Wait No More! <br />
              Limited stock available – selling fast!
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto">
              Our restocks take months. Don't miss out on your favorite style today.
            </p>
            <Link href="/products">
              <Button className="bg-white text-pink-600 hover:bg-black hover:text-white px-12 py-8 text-xl font-black rounded-full transition-all duration-300 shadow-2xl active:scale-95 uppercase tracking-tighter">
                Shop Now Before It’s Gone
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. 📦 Newsletter Strip */}
      <section className="max-w-screen-xl mx-auto px-6 sm:px-8 mb-24">
        <div className="bg-gray-50 rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Stay in the spotlight</h3>
            <p className="text-gray-500 font-medium">Be the first to see new arrivals and seasonal promos.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[400px]">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 h-14 px-6 border border-gray-200 rounded-full text-sm focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/10 transition-all font-medium" 
            />
            <Button className="bg-black text-white hover:bg-pink-600 h-14 px-10 text-sm font-bold rounded-full transition-colors shrink-0">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}

// Helper icons
const Crown = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);
