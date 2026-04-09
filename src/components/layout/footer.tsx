"use client"

import Link from "next/link";
import { Mail, Phone, ShoppingBag, Crown, ArrowRight, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/settings";

export function Footer() {
  const { t } = useSettings();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8 font-sans mt-auto">
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
              {t("Luxury handbags that empower women to express their unique style. Premium quality, expertly curated, and delivered with care.")}
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://wa.me/255749097220" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
              <a href="mailto:shabanimnango99@gmail.com" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-500 transition-colors shadow-sm">
                <Mail className="h-4 w-4" />
              </a>
              <a href="tel:+255749097220" className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-pink-500 transition-colors shadow-sm">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links (Span 8) */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">{t("Shop")}</h3>
              <ul className="space-y-4">
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("New Arrivals")}</Link></li>
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("Best Sellers")}</Link></li>
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("Limited Edition")}</Link></li>
                <li><Link href="/products" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("All Collection")}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">{t("Customer Support")}</h3>
              <ul className="space-y-4">
                <li><Link href="/track" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("Track My Order")}</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("Shipping & Delivery")}</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("7-Day Returns")}</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-500 hover:text-pink-500 transition-colors block">{t("Contact Us")}</Link></li>
              </ul>
            </div>

            {/* Feature Box */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-start justify-center">
              <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-5 w-5 text-pink-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{t("Safe & Secure Payment")}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{t("Pay on delivery or via secure online checkout.")}</p>
              <Link href="/products" className="text-xs font-bold text-pink-500 flex items-center hover:text-pink-600 transition-colors">
                Shop Collection <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-gray-400 font-medium">
            &copy; 2026 {t("SheDoo Fashion. All rights reserved.")}
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-[11px] text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest font-bold">{t("Privacy Policy")}</Link>
            <Link href="/terms" className="text-[11px] text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest font-bold">{t("Terms of Service")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
