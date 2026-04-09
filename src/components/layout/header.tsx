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
                {t("Shop All")}
              </Link>
              <Link href="/products" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Our Bags")}
              </Link>
              <Link href="/track" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("My Order")}
              </Link>
              <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors py-2">
                {t("Help")}
              </Link>
            </nav>
          </div>

          {/* Center - Highly Brandable Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-[1px] w-8 bg-black/10 transition-all duration-700 group-hover:w-12 group-hover:bg-pink-500/30" />
                <Crown className="h-4 w-4 text-pink-500 fill-pink-500/5 transition-transform duration-700 group-hover:rotate-[360deg]" />
                <div className="h-[1px] w-8 bg-black/10 transition-all duration-700 group-hover:w-12 group-hover:bg-pink-500/30" />
              </div>
              <span className="text-3xl sm:text-4xl tracking-[0.1em] transition-all duration-700 group-hover:tracking-[0.2em] font-light">
                <span className="text-black uppercase font-bold">She</span>
                <span className="text-pink-500 italic lowercase -ml-1">Doo</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400 mt-1 transition-colors duration-500 group-hover:text-pink-400">
                Premium Fashion
              </span>
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
                <svg className="h-5 w-5 transform group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
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
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
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
