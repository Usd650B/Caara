"use client"

import Link from "next/link";
import { Mail, Phone, ShoppingBag, ArrowRight, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { t } = useSettings();
  
  return (
    <footer className="bg-[var(--brand-dark)] text-white pt-20 pb-8 mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 sm:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl tracking-tight font-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                  <span className="text-white">She</span>
                  <span className="text-[var(--brand-primary)]">Doo</span>
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)]" />
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-8">
              {t("Premium handbags for the modern woman. Quality you can trust, style you'll love, prices that make sense.")}
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://wa.me/255749097220" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a href="mailto:shabanimnango99@gmail.com" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <Mail className="h-3.5 w-3.5" />
              </a>
              <a href="tel:+255749097220" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                <Phone className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-5">{t("Shop")}</h3>
              <ul className="space-y-3.5">
                <li><Link href="/products" className="text-sm text-white/50 hover:text-white transition-colors">{t("All Products")}</Link></li>
                <li><Link href="/products" className="text-sm text-white/50 hover:text-white transition-colors">{t("New Arrivals")}</Link></li>
                <li><Link href="/products" className="text-sm text-white/50 hover:text-white transition-colors">{t("Best Sellers")}</Link></li>
                <li><Link href="/products" className="text-sm text-white/50 hover:text-white transition-colors">{t("Limited Edition")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-5">{t("Help")}</h3>
              <ul className="space-y-3.5">
                <li><Link href="/track" className="text-sm text-white/50 hover:text-white transition-colors">{t("Track Order")}</Link></li>
                <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">{t("Shipping Info")}</Link></li>
                <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">{t("Returns")}</Link></li>
                <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">{t("Contact Us")}</Link></li>
              </ul>
            </div>

            {/* Feature Card */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col justify-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(201, 169, 110, 0.1)' }}>
                <ShoppingBag className="h-4 w-4 text-[var(--brand-accent)]" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{t("Pay on Delivery")}</h4>
              <p className="text-xs text-white/40 leading-relaxed mb-4">{t("Cash or mobile money when your order arrives.")}</p>
              <Link href="/products" className="text-[10px] font-bold flex items-center gap-1.5 text-[var(--brand-accent)] hover:text-[var(--brand-accent-light)] transition-colors uppercase tracking-wider">
                Shop Now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-white/20 font-medium">
            &copy; 2026 {t("SheDoo Fashion. All rights reserved.")}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest font-bold">{t("Privacy")}</Link>
            <Link href="/terms" className="text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest font-bold">{t("Terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
