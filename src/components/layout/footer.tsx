"use client"

import Link from "next/link";
import { Mail, Phone, ShoppingBag } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { t } = useSettings();
  return (
    <footer className="relative bg-background border-t border-white/10 overflow-hidden pt-16 sm:pt-24 pb-12">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand - Span 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="inline-block group">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                <span className="gradient-text">CAARA</span>
              </span>
              <div className="h-1.5 w-12 gradient-bg mt-2 rounded-full transition-all duration-500 group-hover:w-full"></div>
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md font-light">
              {t("Elevating the ordinary into the extraordinary. Discover a curated universe of fashion that defines your unique essence.")}
            </p>
            <div className="flex items-center space-x-4">
              <a href="mailto:shabanimnango99@gmail.com" className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-2xl group border border-white/5">
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a href="tel:+255749097220" className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-2xl group border border-white/5">
                <Phone className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
              </a>
              <div className="flex-1"></div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">{t("Dimensions")}</h3>
            <ul className="space-y-4">
              {["Discover", "Collections", "The Atelier", "Concierge"].map((link) => (
                <li key={link}>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground transition-all flex items-center group font-medium">
                    <span className="w-0 group-hover:w-4 h-[1px] gradient-bg mr-0 group-hover:mr-3 transition-all"></span>
                    {t(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-secondary">{t("Assistance")}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/track" className="text-muted-foreground hover:text-foreground transition-all flex items-center group font-medium">
                  <span className="w-0 group-hover:w-4 h-[1px] gradient-bg mr-0 group-hover:mr-3 transition-all"></span>
                  {t("Track Order")}
                </Link>
              </li>
              {["Shipping Info", "Returns Policy", "FAQ", "Sustainability"].map((link) => (
                <li key={link}>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-all flex items-center group font-medium">
                    <span className="w-0 group-hover:w-4 h-[1px] gradient-bg mr-0 group-hover:mr-3 transition-all"></span>
                    {t(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free Shipping Highlight */}
        <div className="mt-16 sm:mt-24 p-8 glass rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 gradient-bg opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 gradient-bg rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0 animate-bounce-slow">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold tracking-tight">{t("Worldwide Premium Shipping")}</h4>
                <p className="text-muted-foreground font-light">{t("On the house. Always. Because you deserve the best.")}</p>
              </div>
            </div>
            <div className="px-8 py-3 glass-white text-primary font-black rounded-xl uppercase tracking-widest text-xs shadow-sm">
              Global Standard
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
            &copy; 2024 <span className="gradient-text font-black">CAARA</span>. Defined by Excellence.
          </p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] font-bold">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] font-bold">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
