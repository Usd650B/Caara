"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Star, Truck, Shield, ArrowRight, Heart, 
  CheckCircle, MessageSquare, Package, Mail, Sparkles, Phone
} from "lucide-react";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { trackVisitor } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ui/product-card";
import { ReferralInvite } from "@/components/ui/referral-invite";
import { getPromoPrice } from "@/lib/promo-utils";
import WhatsAppButton from "@/components/ui/whatsapp-button";

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
        const handbags = all.filter(p => !p.category || p.category === "Handbags");
        setProducts(handbags.slice(0, 8)); 
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
      name: "Sarah J.",
      text: "The quality of the leather is incredible. It feels much more expensive than it is. Perfect for work and dinner.",
      rating: 5,
      role: "Verified Buyer"
    },
    {
      name: "Michelle T.",
      text: "Fast delivery to Dar! The beige color is exactly what I wanted. Very minimal and chic.",
      rating: 5,
      role: "Verified Buyer"
    },
    {
      name: "Linda R.",
      text: "I love the minimal design. It goes with everything. Already planning my next purchase!",
      rating: 5,
      role: "Verified Buyer"
    }
  ];

  return (
    <div className="min-h-screen">
      <WhatsAppButton />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-brand-muted">
        <div className="absolute inset-0">
          <img
             src="/images/handbag_hero.png"
             className="w-full h-full object-cover"
             alt="SheDoo Premium Luxury Collection"
          />
           <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent z-[1]" />
        </div>
        
        <div className="section-container relative z-10">
          <div className="max-w-xl animate-fade-up">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-secondary mb-6">
              <Sparkles size={12} /> New Collection 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Elegant Bags <br /> 
              <span className="luxury-italic font-medium">For Every Woman</span>
            </h1>
            <p className="text-lg text-zinc-900 mb-10 max-w-md leading-relaxed font-medium">
              Affordable. Stylish. Delivered to your door. Experience minimal luxury designed for your daily life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn btn-accent px-10">
                Shop Collection
              </Link>
              <Link href="/products" className="btn btn-outline px-10 bg-white/50 backdrop-blur-sm">
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 section-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Featured Products</h2>
            <p className="text-zinc-500">Discover our most loved pieces, curated for elegance and durability.</p>
          </div>
          <Link href="/products" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
            View All Products <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-zinc-100 rounded-2xl mb-4" />
                <div className="h-4 bg-zinc-100 rounded w-2/3 mb-2" />
                <div className="h-4 bg-zinc-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                promoPrice={getPromoPrice(product.id || '', product.price, promos)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="py-24 bg-brand-muted">
        <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Free Delivery</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Swift and safe delivery to your doorstep across the nation at no extra cost.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Premium Quality</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Each piece is crafted with the finest materials and obsessed over for perfection.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Affordable Luxury</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Direct-to-consumer pricing means you get luxury quality without the luxury markup.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 section-container">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Loved by Women</h2>
          <p className="text-zinc-500">Read what our community has to say about their SheDoo experience.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-10 rounded-3xl border border-zinc-100 hover:shadow-soft transition-all duration-500 flex flex-col h-full">
              <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-zinc-600 mb-8 flex-grow leading-relaxed italic">"{t.text}"</p>
              <div>
                <p className="font-bold text-sm tracking-tight">{t.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 mb-20 section-container">
        <div className="bg-black rounded-[2.5rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
             <img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover" alt="CTA BG" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Ready to elevate <br /> your style?</h2>
            <p className="text-zinc-400 mb-12 text-lg">Order now via WhatsApp for personalized service and fast tracking.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://wa.me/255757222444" className="btn btn-accent px-12 h-16 rounded-full group">
                 Order via WhatsApp <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ReferralInvite />
    </div>
  );
}
