"use client"

import Link from "next/link";
import { Mail, Phone, ShoppingBag, Crown, ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { t } = useSettings();
  
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 font-sans mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info (Span 4) */}
          <div className="md:col-span-4 lg:col-span-5 pr-8">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-1.5">
                <Crown className="h-5 w-5 text-pink-500" />
                <span className="text-2xl tracking-tight">
                  <span className="font-bold text-gray-900">She</span>
                  <span className="font-light italic text-pink-500">Doo</span>
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              {t("Premium luxury handbags at prices you can afford. Elegance and style delivered globally.")}
            </p>
            <div className="flex gap-4">
              <a href="mailto:shabanimnango99@gmail.com" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href="tel:+255749097220" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links (Span 8) */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-6">{t("Explore")}</h3>
              <ul className="space-y-4">
                {["Discover", "Collections", "Popular", "Concierge"].map((link) => (
                  <li key={link}>
                    <Link href="/products" className="text-sm text-gray-500 hover:text-black transition-colors block">
                      {t(link)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-6">{t("Help")}</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/track" className="text-sm text-gray-500 hover:text-black transition-colors block">
                    {t("Track Order")}
                  </Link>
                </li>
                {["Shipping Info", "Returns", "FAQ", "Contact Us"].map((link) => (
                  <li key={link}>
                    <Link href="/contact" className="text-sm text-gray-500 hover:text-black transition-colors block">
                      {t(link)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature Box */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-start justify-center">
              <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-5 w-5 text-pink-500" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{t("Free Worldwide Delivery")}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{t("Global standard shipping wrapped with care.")}</p>
              <Link href="/products" className="text-xs font-semibold text-pink-500 flex items-center hover:text-pink-600 transition-colors">
                Shop Now <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; 2026 {t("SheDoo. All rights reserved.")}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider">{t("Privacy Policy")}</Link>
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider">{t("Terms of Service")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
