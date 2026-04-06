"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ShoppingBag, User, LogOut, Package, Mail, Phone, ArrowRight, Crown } from "lucide-react";
import { getCurrentUser, signOutCustomer } from "@/lib/customer-auth";
import { useSettings } from "@/lib/settings";
import { openAuthModal } from "@/components/ui/global-auth-modal";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)
  const { currency, setCurrency, language, setLanguage, t } = useSettings();

  const handleSignIn = () => {
    openAuthModal();
  };

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window === 'undefined') return;
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    }

    // Check user authentication
    const checkAuth = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    // Initial load
    updateCartCount();
    checkAuth();

    // Listen for storage changes
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
    <header className="sticky top-0 z-50 w-full glass-header border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Left - Menu Icon */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden glass rounded-xl border-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Discover")}
              </Link>
              <Link href="/products" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Collections")}
              </Link>
              <Link href="/track" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Track Order")}
              </Link>
              <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Concierge")}
              </Link>
            </nav>
          </div>

          {/* Center - Highly Brandable Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 sm:gap-1.5 opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <Crown className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500/20 rotate-12" />
                <div className="h-[1px] w-4 sm:w-6 bg-yellow-500/30" />
                <Crown className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 fill-yellow-500/20 -rotate-12" />
              </div>
              <span className="text-2xl sm:text-3xl tracking-tighter transition-all duration-700 group-hover:tracking-normal">
                <span className="font-black text-black">She</span>
                <span className="font-light italic text-pink-500 ml-0.5">Doo</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 h-1">
                <div className="h-[1.5px] w-0 group-hover:w-8 bg-black transition-all duration-500 rounded-full opacity-0 group-hover:opacity-100"></div>
                <div className="w-1 h-1 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                <div className="h-[1.5px] w-0 group-hover:w-8 bg-pink-500 transition-all duration-500 rounded-full opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
          </Link>

          {/* Right - User Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Currency & Language Toggles (Desktop only for brevity, or both) */}
            <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 pr-4 mr-2">
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} 
                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
              >
                {language}
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')}
                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
              >
                {currency}
              </button>
            </div>

            <Button variant="ghost" size="icon" className="hidden sm:flex glass rounded-xl border-white/5">
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-3 glass border-white/5 h-11 px-6 rounded-2xl">
                  <div className="w-6 h-6 gradient-bg rounded-lg flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Button>
                
                <div className="absolute right-0 top-full mt-4 w-60 glass rounded-3xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 shadow-2xl border border-white/10 scale-95 group-hover:scale-100 overflow-hidden translate-y-2 group-hover:translate-y-0">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                  <div className="relative z-10 space-y-1">
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated As</p>
                      <p className="text-xs font-bold truncate">{user.email}</p>
                    </div>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start h-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <User className="h-4 w-4 mr-3" />
                        <span className="font-bold text-xs uppercase tracking-widest">{t("Profile")}</span>
                      </Button>
                    </Link>
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="w-full justify-start h-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <Package className="h-4 w-4 mr-3" />
                        <span className="font-bold text-xs uppercase tracking-widest">{t("Order History")}</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start h-11 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all"
                      onClick={() => signOutCustomer()}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="font-bold text-xs uppercase tracking-widest">{t("Sign Out")}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleSignIn}
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex items-center justify-center glass border-white/5 h-11 w-11 rounded-2xl hover:scale-110 transition-all bg-white shadow-md group"
                title="Sign in"
              >
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            )}
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative glass border-white/5 h-11 w-11 rounded-2xl hover:scale-110 transition-all">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full gradient-bg text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce-slow">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-8 glass rounded-[2.5rem] mt-4 mb-4 border border-white/10 animate-in slide-in-from-top-4 duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <nav className="flex flex-col space-y-4 px-8 relative z-10">
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 group">
                <span>Shop All</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 group">
                <span>Collections</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 group">
                <span>Concierge</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              <Link href="/track" onClick={() => setIsMenuOpen(false)} className="text-xl font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 group">
                <span>Track Order</span>
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </Link>
              
              {!user ? (
                <button onClick={() => { handleSignIn(); setIsMenuOpen(false); }} className="text-xl font-black uppercase tracking-widest text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 w-full text-left">
                  <span>Sign In</span>
                  <div className="bg-white p-1.5 rounded-full shadow-sm">
                    <User className="h-5 w-5 text-black" />
                  </div>
                </button>
              ) : (
                <div className="pt-4 mt-2 border-t border-white/10 flex flex-col space-y-2">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.name || user.email?.split('@')[0]}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-lg font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between border-b border-white/5 group">
                    <span>{t("Profile")}</span>
                    <User className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-all" />
                  </Link>
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="text-lg font-black uppercase tracking-widest hover:text-primary transition-all py-3 flex items-center justify-between group">
                    <span>{t("Order History")}</span>
                    <Package className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-all" />
                  </Link>
                  <button onClick={() => { signOutCustomer(); setIsMenuOpen(false); }} className="text-lg font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-all py-3 flex items-center justify-between w-full text-left group">
                    <span>{t("Sign Out")}</span>
                    <LogOut className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-all" />
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
