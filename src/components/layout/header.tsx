"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, ShoppingBag, User, LogOut, Package, Mail, Phone, ArrowRight, Crown, Globe } from "lucide-react";
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

        {/* Mobile Luxury Sidebar (Drawer) */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Header inside drawer */}
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-widest uppercase">Member Lounge</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-8">
                {/* Greeting / Profile Section */}
                <div className="px-6 mb-10">
                  {user ? (
                    <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                      <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-[10px] uppercase tracking-widest text-pink-500 mb-1">Welcome back</p>
                        <p className="font-bold text-gray-900 truncate">{user.name || user.email?.split('@')[0]}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black text-white p-6 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/20 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                      <p className="text-xl font-bold mb-4 relative z-10">Sign in for exclusive drops</p>
                      <Button 
                        onClick={() => { handleSignIn(); setIsMenuOpen(false); }}
                        className="bg-white text-black hover:bg-white/90 rounded-xl font-bold text-xs uppercase tracking-widest relative z-10 h-11 w-full"
                      >
                        Sign In Now
                      </Button>
                    </div>
                  )}
                </div>

                {/* Main Links */}
                <nav className="px-6 space-y-2 mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-2 mb-4">Collection</p>
                  <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 group transition-all">
                    <span className="text-lg font-bold text-gray-800">Shop All</span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link href="/products" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 group transition-all">
                    <span className="text-lg font-bold text-gray-800">Best Sellers</span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link href="/track" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 group transition-all">
                    <span className="text-lg font-bold text-gray-800">Track Manifest</span>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </Link>
                </nav>

                {/* Personalized Support */}
                <div className="px-6 mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-2 mb-4">Concierge</p>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="https://wa.me/255749097220" className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl group transition-all">
                      <Phone className="h-5 w-5 text-green-600 mb-2" />
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">WhatsApp</span>
                    </a>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl group transition-all">
                      <Mail className="h-5 w-5 text-blue-600 mb-2" />
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tighter">Email HQ</span>
                    </Link>
                  </div>
                </div>

                {/* 🌍 Region & Language Settings */}
                <div className="px-6 mb-10 pt-8 border-t border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 ml-2 mb-4">Preferences</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} 
                      className="flex-1 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between px-5 group active:scale-95 transition-all text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black mb-1">Language</span>
                        <span className="text-xs font-bold">{language === 'EN' ? 'English' : 'Kiswahili'}</span>
                      </div>
                      <Globe className="h-3 w-3 text-gray-300 group-hover:text-black" />
                    </button>
                    <button 
                      onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')}
                      className="flex-1 py-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between px-5 group active:scale-95 transition-all text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black mb-1">Currency</span>
                        <span className="text-xs font-bold">{currency}</span>
                      </div>
                      <Crown className="h-3 w-3 text-gray-300 group-hover:text-black" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer inside drawer */}
              {user && (
                <div className="p-6 border-t border-gray-50">
                  <Button 
                    variant="ghost" 
                    onClick={() => { signOutCustomer(); setIsMenuOpen(false); }}
                    className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold uppercase tracking-widest text-xs"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
