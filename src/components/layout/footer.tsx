"use client"

import Link from "next/link";
import { Instagram, Facebook, Twitter, ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { t } = useSettings();
  
  return (
    <footer className="bg-zinc-50 pt-32 pb-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          <div className="md:col-span-4 flex flex-col gap-8">
            <span className="text-2xl font-bold tracking-tighter uppercase italic">SheDoo</span>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Creating a legacy of minimal luxury. We craft handbags that celebrate the modern woman's journey with elegance and quality.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-10 text-black">Shop</h4>
            <ul className="flex flex-col gap-5">
              <li><Link href="/products" className="text-sm text-zinc-500 hover:text-black transition-colors">{t("All Products")}</Link></li>
              <li><Link href="/products" className="text-sm text-zinc-500 hover:text-black transition-colors">{t("New Arrivals")}</Link></li>
              <li><Link href="/products" className="text-sm text-zinc-500 hover:text-black transition-colors">{t("Best Sellers")}</Link></li>
              <li><Link href="/products" className="text-sm text-zinc-500 hover:text-black transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-10 text-black">Experience</h4>
            <ul className="flex flex-col gap-5">
              <li><Link href="/track" className="text-sm text-zinc-500 hover:text-black transition-colors">{t("Track Order")}</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-black transition-colors">The Editorial</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-black transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="text-sm text-zinc-500 hover:text-black transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-10 text-black">Join the Collective</h4>
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">Early access to new drops and faster worldwide logistics.</p>
            <form className="flex flex-col gap-4">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full bg-white border-b border-zinc-200 px-0 py-4 text-sm focus:outline-none focus:border-black transition-colors"
                  required
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            &copy; {new Date().getFullYear()} SheDoo Group. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black">Privacy</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black">Terms</Link>
            <Link href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
