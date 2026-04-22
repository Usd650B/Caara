"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, User, LogOut, Package, ArrowRight, Globe, Search } from "lucide-react";
import { getCurrentUser, signOutCustomer } from "@/lib/customer-auth";
import { useSettings } from "@/lib/settings";
import { openAuthModal } from "@/components/ui/global-auth-modal";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const { currency, setCurrency, language, setLanguage, t } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignIn = () => {
    openAuthModal();
  };

  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window === 'undefined') return;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    }

    const checkAuth = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    updateCartCount();
    checkAuth();

    const handleStorageChange = () => {
      updateCartCount();
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleStorageChange);
    window.addEventListener('customer-auth-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
      window.removeEventListener('customer-auth-changed', handleStorageChange);
    };
  }, []);

  return (
    <header className={`header-sticky ${scrolled ? 'header-scrolled' : 'bg-transparent'}`}>
      <div className="section-container">
        <div className="flex h-20 items-center justify-between">
          
          {/* Left — Mobile menu + Search icon */}
          <div className="flex items-center gap-4 lg:w-1/3">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/products" className="text-xs font-semibold uppercase tracking-widest hover:opacity-60 transition-opacity">
                {t("Shop")}
              </Link>
              <Link href="/products" className="text-xs font-semibold uppercase tracking-widest hover:opacity-60 transition-opacity">
                {t("New In")}
              </Link>
              <Link href="/track" className="text-xs font-semibold uppercase tracking-widest hover:opacity-60 transition-opacity">
                {t("Track")}
              </Link>
            </nav>
          </div>

          {/* Center — Logo */}
          <div className="lg:w-1/3 flex justify-center">
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold tracking-[-0.05em] uppercase text-brand-primary" style={{ fontFamily: 'var(--font-outfit)' }}>
                She<span className="text-brand-accent">Doo</span>
              </span>
            </Link>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center justify-end gap-1 lg:w-1/3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-4 border-r border-zinc-200 pr-6 mr-2">
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} 
                className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50"
              >
                {language}
              </button>
              <span className="text-zinc-300">/</span>
              <button 
                onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')}
                className="text-[10px] font-bold uppercase tracking-widest hover:opacity-50"
              >
                {currency}
              </button>
            </div>
            
            {user ? (
               <div className="relative group">
                <button className="p-2 hover:opacity-60 transition-opacity">
                  <User size={22} strokeWidth={1.5} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-soft p-2 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-zinc-100">
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-zinc-50 rounded-xl transition-colors">
                    <User size={14} /> Profile
                  </Link>
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-zinc-50 rounded-xl transition-colors">
                    <Package size={14} /> Orders
                  </Link>
                  <button 
                    onClick={() => signOutCustomer()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleSignIn} className="p-2 hover:opacity-60 transition-opacity">
                <User size={22} strokeWidth={1.5} />
              </button>
            )}

            <Link href="/cart" className="relative p-2 hover:opacity-60 transition-opacity">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ═══ Mobile Drawer ═══ */}
        <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          <div 
            className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-white transition-transform duration-500 ease-luxury ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full p-8">
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold tracking-tighter uppercase">SheDoo</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>

              <nav className="flex flex-col gap-8 mb-auto">
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold tracking-tight">Shop All</Link>
                <Link href="/products" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold tracking-tight">New Arrivals</Link>
                <Link href="/track" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold tracking-tight">Track Order</Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold tracking-tight">Contact</Link>
              </nav>

              <div className="pt-8 border-t border-zinc-100 flex flex-col gap-6">
                <div className="flex gap-4">
                  <button onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} className="text-xs font-bold uppercase tracking-widest">{language === 'EN' ? 'English' : 'Kiswahili'}</button>
                  <button onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')} className="text-xs font-bold uppercase tracking-widest">{currency}</button>
                </div>
                <div className="flex gap-4">
                   <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Globe size={18} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
