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
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          
          {/* Left — Mobile menu + Desktop Nav */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-dark)] hover:text-[var(--brand-primary)] transition-colors">
                {t("Shop")}
              </Link>
              <Link href="/products" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-dark)] hover:text-[var(--brand-primary)] transition-colors">
                {t("New In")}
              </Link>
              <Link href="/track" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-dark)] hover:text-[var(--brand-primary)] transition-colors">
                {t("Track Order")}
              </Link>
              <Link href="/contact" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-dark)] hover:text-[var(--brand-primary)] transition-colors">
                {t("Contact")}
              </Link>
            </nav>
          </div>

          {/* Center — Logo */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl tracking-tight font-black transition-all duration-300" style={{ fontFamily: 'var(--font-playfair)' }}>
                <span className="text-[var(--brand-dark)]">She</span>
                <span className="text-[var(--brand-primary)]">Doo</span>
              </span>
              <div className="w-2 h-2 rounded-full bg-[var(--brand-accent)] group-hover:scale-150 transition-transform duration-300" />
            </div>
          </Link>

          {/* Right — Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency & Language (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-1">
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} 
                className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--brand-primary)] transition-colors"
              >
                {language}
              </button>
              <span className="text-gray-200">|</span>
              <button 
                onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')}
                className="text-[10px] font-bold uppercase tracking-widest hover:text-[var(--brand-primary)] transition-colors"
              >
                {currency}
              </button>
            </div>

            <Button variant="ghost" size="icon" className="hidden sm:flex h-10 w-10 rounded-lg hover:bg-[var(--muted)]">
              <Search className="h-4 w-4" />
            </Button>
            
            {user ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2.5 h-10 px-4 rounded-lg hover:bg-[var(--muted)]">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'var(--brand-primary)' }}>
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </Button>
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl border border-[var(--border)] scale-95 group-hover:scale-100 translate-y-2 group-hover:translate-y-0">
                  <div className="px-3 py-2.5 border-b border-[var(--border)] mb-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Signed in as</p>
                    <p className="text-xs font-bold text-[var(--brand-dark)] truncate">{user.email}</p>
                  </div>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 rounded-lg text-xs font-bold hover:bg-[var(--muted)]">
                      <User className="h-3.5 w-3.5 mr-2.5" />
                      {t("Profile")}
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 rounded-lg text-xs font-bold hover:bg-[var(--muted)]">
                      <Package className="h-3.5 w-3.5 mr-2.5" />
                      {t("Orders")}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start h-9 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => signOutCustomer()}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2.5" />
                    {t("Sign Out")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleSignIn}
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex h-10 w-10 rounded-lg hover:bg-[var(--muted)] group"
                title="Sign in"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </Button>
            )}
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg hover:bg-[var(--muted)]">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* ═══ Mobile Drawer ═══ */}
        <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-400 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-400 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-[var(--border)]">
                <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                  <span className="text-[var(--brand-dark)]">She</span>
                  <span className="text-[var(--brand-primary)]">Doo</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg hover:bg-[var(--muted)] h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-6">
                {/* User Section */}
                <div className="px-6 mb-8">
                  {user ? (
                    <div className="flex items-center gap-4 bg-[var(--muted)] p-4 rounded-xl">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--brand-primary)' }}>
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-0.5">Welcome back</p>
                        <p className="font-bold text-sm text-[var(--brand-dark)] truncate">{user.name || user.email?.split('@')[0]}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[var(--brand-dark)] text-white p-6 rounded-xl">
                      <p className="text-base font-bold mb-3">Join SheDoo</p>
                      <p className="text-white/50 text-xs mb-4">Sign in to get exclusive offers and track your orders.</p>
                      <Button 
                        onClick={() => { handleSignIn(); setIsMenuOpen(false); }}
                        className="bg-white text-[var(--brand-dark)] hover:bg-white/90 rounded-lg font-bold text-xs uppercase tracking-wider h-10 w-full"
                      >
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>

                {/* Nav Links */}
                <nav className="px-6 space-y-1 mb-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3 px-3">Shop</p>
                  {[
                    { label: "All Products", href: "/products" },
                    { label: "New Arrivals", href: "/products" },
                    { label: "Track Order", href: "/track" },
                    { label: "Contact Us", href: "/contact" },
                  ].map(({ label, href }) => (
                    <Link key={label} href={href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-3.5 rounded-lg hover:bg-[var(--muted)] group transition-colors">
                      <span className="text-sm font-bold text-[var(--brand-dark)]">{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </nav>

                {/* Support */}
                <div className="px-6 mb-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3 px-3">Support</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href="https://wa.me/255749097220" className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl group">
                      <Phone className="h-4 w-4 text-emerald-600 mb-1.5" />
                      <span className="text-[10px] font-bold text-emerald-700">WhatsApp</span>
                    </a>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center p-4 bg-blue-50 rounded-xl group">
                      <Mail className="h-4 w-4 text-blue-600 mb-1.5" />
                      <span className="text-[10px] font-bold text-blue-700">Email</span>
                    </Link>
                  </div>
                </div>

                {/* Preferences */}
                <div className="px-6 pt-6 border-t border-[var(--border)]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 mb-3 px-3">Settings</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLanguage(language === 'EN' ? 'SW' : 'EN')} 
                      className="flex-1 py-3 bg-[var(--muted)] rounded-lg border border-[var(--border)] flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-bold">{language === 'EN' ? 'English' : 'Kiswahili'}</span>
                    </button>
                    <button 
                      onClick={() => setCurrency(currency === 'USD' ? 'TZS' : 'USD')}
                      className="flex-1 py-3 bg-[var(--muted)] rounded-lg border border-[var(--border)] flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <span className="text-xs font-bold">{currency}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              {user && (
                <div className="p-6 border-t border-[var(--border)]">
                  <Button 
                    variant="ghost" 
                    onClick={() => { signOutCustomer(); setIsMenuOpen(false); }}
                    className="w-full h-11 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 font-bold uppercase tracking-wider text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
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
