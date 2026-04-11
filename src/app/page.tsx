"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, Star, Truck, Shield, ArrowRight, Heart, Zap, CheckCircle, 
  Wallet, RefreshCcw, StarHalf, MessageSquare, Clock, Package, MapPin, Sparkles, Mail,
  UserPlus, Gift, Users
} from "lucide-react";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { trackVisitor } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";
import { openAuthModal } from "@/components/ui/global-auth-modal";
import { getCurrentUser } from "@/lib/customer-auth";

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
    <div className="min-h-screen bg-[var(--background)]" style={{ fontFamily: 'var(--font-outfit)' }}>

      {/* ═══ 1. HERO — Full-bleed with floating card ═══ */}
      <section className="relative min-h-[100vh] w-full flex items-end justify-start overflow-hidden bg-[var(--brand-dark)]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-lifestyle.png"
            className="w-full h-full object-cover object-top"
            alt="SheDoo Collection"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)] via-[var(--brand-dark)]/30 to-transparent" />
        </div>
        
        {/* Content — Bottom-left aligned */}
        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 sm:px-10 pb-20 lg:pb-28">
          <div className="max-w-2xl">
            {/* Accent pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-[0.25em] px-5 py-2.5 rounded-full mb-8">
              <Sparkles className="h-3 w-3 text-[var(--brand-accent)]" />
              Spring/Summer 2026
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-white leading-[1.05] tracking-tight mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Beautiful Bags <br />
              For <span className="italic text-[var(--brand-accent)]">You</span>
            </h1>
            
            <p className="text-white/60 text-base sm:text-lg max-w-lg mb-10 leading-relaxed font-light">
              The best handbags for modern women. High quality, beautiful designs, and free delivery in Dar es Salaam.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <button className="bg-[var(--brand-primary)] text-white px-8 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:shadow-[0_10px_30px_rgba(232,54,78,0.35)] hover:-translate-y-0.5 transition-all duration-300">
                  Shop Collection
                </button>
              </Link>
              <Link href="/products">
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 sm:px-10 py-4 text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-white hover:text-[var(--brand-dark)] transition-all duration-300">
                  Explore Lookbook
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Stats Card — right side (desktop) */}
        <div className="absolute bottom-20 right-10 hidden lg:block z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-7 text-white max-w-[220px]">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex -space-x-2">
                {['N', 'A', 'Z'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white/20" style={{ background: i === 0 ? 'var(--brand-primary)' : i === 1 ? 'var(--brand-accent)' : 'var(--brand-dark-light)' }}>
                    {l}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-white/70">+2.4k</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Happy Customers</p>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />)}
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 2. MARQUEE TRUST STRIP ═══ */}
      <section className="bg-[var(--brand-dark)] py-4 overflow-hidden border-t border-white/5">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center shrink-0">
              {[
                "Free Delivery Nationwide",
                "Pay On Delivery Available",
                "14-Day Free Returns",
                "Secure Checkout",
                "Premium Quality Guaranteed",
                "WhatsApp Support 24/7",
              ].map((text, i) => (
                <span key={i} className="flex items-center mx-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] mr-4 shrink-0" />
                  <span className="text-[11px] text-white/50 font-bold uppercase tracking-[0.2em]">{text}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>


      {/* ═══ 3. FEATURED PRODUCTS ═══ */}
      <section className="py-24 px-4 sm:px-8 max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-3 block">Top Choices</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-[var(--brand-dark)] tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Most Popular Bags
            </h2>
          </div>
          <Link href="/products" className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--brand-dark)] hover:text-[var(--brand-primary)] transition-colors">
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 mb-4 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded-full w-4/5 mb-2.5" />
                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-[var(--muted)] rounded-2xl border border-dashed border-gray-200">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Coming Soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {products.slice(0, 4).map((product, idx) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  badge: idx === 0 ? "Best Seller" : idx === 1 ? "Most Loved" : idx === 2 ? "Low Stock" : undefined
                }}
                promoPrice={getPromoPrice(product.id || '', product.price, promos)}
              />
            ))}
          </div>
        )}
      </section>


      {/* ═══ 4. SPLIT FEATURE — Image + Text ═══ */}
      <section className="bg-[var(--muted)]">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Image Side */}
          <div className="relative overflow-hidden min-h-[400px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1000" 
              className="absolute inset-0 w-full h-full object-cover"
              alt="SheDoo craftsmanship"
            />
            {/* Color accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 gradient-warm" />
          </div>

          {/* Text Side */}
          <div className="flex items-center px-8 sm:px-14 lg:px-20 py-20 lg:py-28">
            <div className="max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-6 block">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl text-[var(--brand-dark)] mb-8 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                Made With <br />
                <span className="text-[var(--brand-primary)]">Care</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-12 text-sm">
                Every SheDoo bag is made to last. We bring you beautiful, strong bags directly from the makers, giving you the best prices.
              </p>
              
              <div className="space-y-8">
                {[
                  { num: "01", title: "Good Quality", desc: "We check every bag carefully before sending it to you." },
                  { num: "02", title: "Best Prices", desc: "We sell directly to you, so you save money." },
                  { num: "03", title: "Fast Help", desc: "Chat with us anytime on WhatsApp." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="flex gap-5 group">
                    <span className="text-[var(--brand-accent)] text-xs font-bold mt-0.5 shrink-0">{num}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--brand-dark)] mb-1.5 uppercase tracking-wider">{title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 5. REVIEWS ═══ */}
      <section className="py-24 px-4 sm:px-8">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />)}
            </div>
            <h2 className="text-3xl sm:text-4xl text-[var(--brand-dark)] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Loved by <span className="text-[var(--brand-primary)]">2,400+</span> Women
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Real reviews from real customers across East Africa.</p>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[var(--border)] hover:border-[var(--brand-primary)]/20 hover:shadow-lg transition-all duration-400 group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="h-3.5 w-3.5 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />)}
                  </div>
                  <span className="text-gray-300 font-medium text-[10px] uppercase tracking-widest">{t.date}</span>
                </div>
                <p className="text-[var(--brand-dark)] text-sm leading-relaxed mb-8 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: 'var(--brand-primary)' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <span className="text-[var(--brand-dark)] font-bold text-xs block">{t.name}</span>
                    <span className="text-gray-400 text-[10px] uppercase tracking-widest font-medium flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-emerald-500" /> Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ 6. BRAND STORY — Dark Section ═══ */}
      <section className="bg-[var(--brand-dark)] text-white py-28 px-6 sm:px-8 relative overflow-hidden">
        {/* Background accent shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-5 blur-3xl" style={{ background: 'var(--brand-accent)' }} />
        
        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-6 block">About Us</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl mb-8 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                Beautiful Bags for <br />
                <span className="text-[var(--brand-accent)]">Every Woman</span>
              </h2>
              <p className="text-white/50 text-sm leading-loose mb-12 max-w-lg">
                At SheDoo, we believe every woman should have beautiful bags that make her feel good, without paying too much. We are based in Dar es Salaam and we bring you the best styles at fair prices.
              </p>
              <Link href="/products">
                <button className="bg-white text-[var(--brand-dark)] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-[var(--brand-primary)] hover:text-white transition-all duration-300">
                  Discover More
                </button>
              </Link>
            </div>

            {/* Right — Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "100%", label: "Quality Inspected", icon: Shield },
                { value: "24/7", label: "WhatsApp Support", icon: MessageSquare },
                { value: "Free", label: "Nationwide Delivery", icon: Truck },
                { value: "14 Days", label: "Easy Returns", icon: RefreshCcw },
              ].map(({ value, label, icon: Icon }, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
                  <Icon className="h-5 w-5 text-[var(--brand-accent)] mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{value}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══ 8. EXCLUSIVE OFFERS — Signup + Referral ═══ */}
      <section className="py-24 px-4 sm:px-8 bg-[var(--brand-dark)] relative overflow-hidden">
        {/* Subtle bg shapes */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[120px]" style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px]" style={{ background: 'var(--brand-accent)' }} />

        <div className="max-w-screen-xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--brand-accent)] mb-4 block">Special Offers</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Save Your <span className="text-[var(--brand-accent)] italic">Money</span>
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">Join SheDoo and get special discounts on your bags.</p>
          </div>

          {/* Two Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

            {/* Card 1 — Signup Bonus */}
            <div className="group relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 sm:p-10 hover:border-[var(--brand-primary)]/30 transition-all duration-500 overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" style={{ background: 'var(--brand-primary)' }} />
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 text-[var(--brand-primary-light)] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6">
                  <UserPlus className="h-3 w-3" />
                  New Members
                </div>

                {/* Big number */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-6xl sm:text-7xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>10</span>
                  <span className="text-2xl font-bold text-[var(--brand-primary)]">%</span>
                  <span className="text-base font-bold text-white/50 ml-2">OFF</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Sign Up Bonus</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                  Create a free account today and get 10% off your first bag.
                </p>

                <button
                  onClick={() => { const u = getCurrentUser(); if (!u) openAuthModal(); }}
                  className="inline-flex items-center gap-2 bg-[var(--brand-primary)] text-white px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg hover:shadow-[0_10px_30px_rgba(232,54,78,0.35)] hover:-translate-y-0.5 transition-all duration-300 group/btn"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create Account
                  <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2 — Referral Bonus */}
            <div className="group relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 sm:p-10 hover:border-[var(--brand-accent)]/30 transition-all duration-500 overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700" style={{ background: 'var(--brand-accent)' }} />

              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-[var(--brand-accent)]/10 border border-[var(--brand-accent)]/20 text-[var(--brand-accent-light)] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6">
                  <Gift className="h-3 w-3" />
                  Refer & Earn
                </div>

                {/* Big number */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-6xl sm:text-7xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>15</span>
                  <span className="text-2xl font-bold text-[var(--brand-accent)]">%</span>
                  <span className="text-base font-bold text-white/50 ml-2">OFF</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Invite Friends</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                  Send your code to 5 friends. When they buy, both of you get 15% off!
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { const u = getCurrentUser(); if (!u) openAuthModal(); }}
                    className="inline-flex items-center gap-2 bg-[var(--brand-accent)] text-[var(--brand-dark)] px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg hover:shadow-[0_10px_30px_rgba(201,169,110,0.35)] hover:-translate-y-0.5 transition-all duration-300 group/btn"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Start Inviting
                    <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Max 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Line */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 pt-10 border-t border-white/5">
            {[
              "No minimum purchase",
              "Stackable with other offers",
              "Valid on all products",
            ].map((text) => (
              <span key={text} className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                <CheckCircle className="h-3 w-3 text-emerald-400/50" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. NEWSLETTER ═══ */}
      <section className="py-20 px-6 sm:px-8 bg-white border-t border-[var(--border)]">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--brand-accent-50)' }}>
            <Mail className="h-5 w-5 text-[var(--brand-accent)]" />
          </div>
          <h3 className="text-2xl text-[var(--brand-dark)] mb-3 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Get Weekly Updates
          </h3>
          <p className="text-gray-400 text-xs mb-8 tracking-wider">Get news about new bags and special discounts in your email.</p>
          <div className="flex gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 h-12 px-5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 transition-all placeholder:text-gray-300" 
            />
            <button className="h-12 px-6 bg-[var(--brand-dark)] text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-[var(--brand-primary)] transition-all duration-300 shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

// Helper icons (kept for compatibility with other components)
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

// Mail icon import is from lucide-react, added at the top
