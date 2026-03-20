"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, Star, ArrowRight, Heart, Sparkles, TrendingUp, Users, Gift, Zap, Crown, Diamond, Truck } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";

export default function Home() {
  const { t, formatPrice } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const featuredProducts = products.slice(0, 8); // Show more products for better visual impact

  const categories = [
    { id: "all", name: t("All"), icon: Sparkles, color: "from-purple-500 to-pink-500" },
    { id: "dresses", name: t("Dresses"), icon: Diamond, color: "from-pink-500 to-rose-500" },
    { id: "tops", name: t("Tops"), icon: Crown, color: "from-blue-500 to-purple-500" },
    { id: "sets", name: t("Sets"), icon: Heart, color: "from-green-500 to-teal-500" },
    { id: "new", name: t("New"), icon: Zap, color: "from-yellow-500 to-orange-500" },
    { id: "trending", name: t("Trending"), icon: TrendingUp, color: "from-red-500 to-pink-500" }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      text: "Absolutely love the quality! The dresses fit perfectly and the shipping was super fast.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Emily K.",
      text: "Best shopping experience! The clothes are exactly as described and the customer service is amazing.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Jessica L.",
      text: "I'm obsessed with my new outfit! So many compliments whenever I wear it.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=50&h=50&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden bg-[#fafafa]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f3f4f6] hidden lg:block"></div>
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] animate-pulse delay-700"></div>

        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="space-y-8 sm:space-y-10 text-left order-2 lg:order-1 max-w-2xl">
              <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-black/80">
                  {t("Spring Collection 2026")}
                </span>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tighter text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t("Every Queen")}<br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 gradient-text italic">{t("Wears CARA")}</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/10 -z-10 rotate-[-1deg]"></span>
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-black/60 max-w-lg leading-relaxed font-light" style={{ fontFamily: 'var(--font-poppins)' }}>
                  {t("Discover the art of being unforgettable with our premium pieces designed for the extraordinary woman.")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/products" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-black text-white hover:bg-black/90 px-10 py-7 text-sm font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {t("Shop The Looks")}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-black/10 hover:bg-black hover:text-white px-10 py-7 text-sm font-bold uppercase tracking-[0.2em] rounded-none transition-all duration-300"
                >
                  {t("View Campaign")}
                </Button>
              </div>

              {/* Stats/Highlights */}
              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-black/5">
                <div>
                  <div className="text-2xl font-bold">12k+</div>
                  <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">{t("Happy Queens")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">450+</div>
                  <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">{t("Unique Styles")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24h</div>
                  <div className="text-[10px] uppercase tracking-widest text-black/40 font-bold">{t("Global Ship")}</div>
                </div>
              </div>
            </div>

            {/* Visual Content */}
            <div className="relative order-1 lg:order-2 h-[450px] sm:h-[600px] lg:h-[800px] group">
              {/* Main Image Container */}
              <div className="relative w-full h-full overflow-hidden rounded-[2rem] lg:rounded-none lg:rounded-tl-[10rem] lg:rounded-br-[10rem] shadow-2xl">
                <img 
                  src="/images/hero-woman.png" 
                  alt={t("CARA Fashion Collection")}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 ease-out"
                />
                
                {/* Floating Elements on Image */}
                <div className="absolute bottom-8 left-8 p-6 glass rounded-2xl border border-white/40 shadow-xl backdrop-blur-md hidden sm:block animate-bounce-slow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                      <img src="https://images.unsplash.com/photo-1494790108757-1c987281c12d?w=100&h=100&fit=crop" alt="User" />
                    </div>
                    <div>
                      <div className="flex text-yellow-500 mb-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                      <p className="text-xs font-bold text-black uppercase tracking-tighter">"Absolutely Divine Quality"</p>
                    </div>
                  </div>
                </div>

                {/* Badge Overlay */}
                <div className="absolute top-8 right-8 w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-full flex items-center justify-center text-center transform -rotate-12 shadow-2xl">
                  <div className="text-white">
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter leading-none">{t("New")}</div>
                    <div className="text-xl sm:text-2xl font-black">{t("Drop")}</div>
                    <div className="text-[10px] sm:text-xs font-bold">{t("2026")}</div>
                  </div>
                </div>
              </div>

              {/* Decorative Geometric Shapes */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-[16px] border-primary/10 rounded-full -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary/10 rounded-[3rem] -z-10 rotate-45"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Categories */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
              {t("Define Your Universe")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-light tracking-wide px-4">{t("Every piece tells your story")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group relative p-3 sm:p-4 md:p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                  activeCategory === category.id 
                    ? 'gradient-bg text-white shadow-2xl scale-110 z-10' 
                    : 'glass hover:shadow-xl border-border'
                }`}
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    activeCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-primary/10'
                  }`}>
                    <category.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                      activeCategory === category.id ? 'text-white' : 'text-primary'
                    }`} />
                  </div>
                  <span className={`font-semibold text-xs sm:text-sm tracking-wide uppercase text-center ${
                    activeCategory === category.id ? 'text-white' : 'text-foreground'
                  }`}>
                    {category.name}
                  </span>
                </div>
                {activeCategory === category.id && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Gallery Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#fafafa]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative h-[500px] sm:h-[700px] overflow-hidden rounded-[2.5rem] group shadow-2xl">
              <img 
                src="/images/woman-2.png" 
                alt="CARA Lifestyle" 
                className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-12 left-12 space-y-4">
                <span className="text-white/80 text-sm font-bold uppercase tracking-[0.3em]">{t("STREET STYLE '26")}</span>
                <h3 className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t("Urban Confidence.")}
                </h3>
              </div>
            </div>
            
            <div className="lg:col-span-5 space-y-12 lg:pl-12">
              <div className="space-y-6">
                <div className="w-12 h-[2px] bg-primary"></div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t("Made For The Iconic You.")}
                </h2>
                <p className="text-black/50 text-xl font-light leading-relaxed">
                  {t("Whether it's the boardroom or the boulevard, CARA ensures you're never just another face in the crowd. Our latest city-ready collection is here.")}
                </p>
                <div className="pt-4">
                  <Link href="/products" className="inline-block border-b-2 border-black pb-2 text-sm font-bold uppercase tracking-widest hover:border-primary transition-colors">
                    {t("Explore The Edit")}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop" alt="Look 1" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-lg mt-8 transform hover:-translate-y-2 transition-transform duration-500 delay-100">
                  <img src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=500&fit=crop" alt="Look 2" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/5 text-primary rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t("Seasonal Essentials")}</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t("The Collection")}
              </h2>
              <p className="text-black/50 text-lg max-w-xl font-light tracking-wide">{t("Curated pieces that blend contemporary trends with timeless elegance.")}</p>
            </div>
            
            <Link href="/products" className="group flex items-center space-x-2 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">
              <span>{t("Browse All Products")}</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-card rounded-md animate-pulse aspect-[3/4]"></div>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 glass rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2 tracking-tight" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
                  {t("The Future Awaits")}
                </h3>
                <p className="text-muted-foreground mb-6 font-light px-4">{t("Something extraordinary is coming your way")}</p>
                <Button className="gradient-bg text-white hover:opacity-90 font-semibold tracking-wider px-6 py-3 text-sm sm:text-base" asChild>
                  <Link href="/products">Explore the Universe</Link>
                </Button>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block h-full">
                  <div className="flex flex-col h-full bg-white rounded-sm overflow-hidden border border-transparent hover:border-muted-foreground/20 transition-all duration-200">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* SHEIN-style Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-1 left-1">
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black text-white rounded-xs uppercase tracking-tight shadow-sm">
                            {t("NEW")}
                          </span>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/5 backdrop-blur-[2px]">
                        <Button 
                          className="w-full bg-white/95 text-black hover:bg-black hover:text-white border-none h-7 text-[10px] font-bold tracking-tight uppercase rounded-sm shadow-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const cartItem = {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              quantity: 1,
                              size: "M",
                              color: "Black"
                            };
                            const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                            existingCart.push(cartItem);
                            localStorage.setItem('cart', JSON.stringify(existingCart));
                            window.dispatchEvent(new CustomEvent('cart-updated'));
                            alert('Added to cart! ✨');
                          }}
                        >
                          {t("Add to Bag")}
                        </Button>
                      </div>

                      {/* Wishlist Button */}
                      <button 
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/60 hover:bg-white text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          alert('Saved! ❤️');
                        }}
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="p-1.5 sm:p-2 flex flex-col flex-1 space-y-1">
                      <h3 className="text-[11px] sm:text-xs text-muted-foreground font-normal line-clamp-1 group-hover:text-foreground transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-[15px] font-bold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        {product.originalPrice && (
                          <span className="text-[10px] font-bold text-red-500">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs pt-0.5">
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="text-[10px] ml-0.5 font-bold text-foreground">4.8</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground">(1k+)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#0f0f0f] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[150px] -z-0"></div>
        
        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t("The CARA Culture")}
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto mb-8"></div>
            <p className="text-white/60 text-xl font-light tracking-widest uppercase">{t("Fashion. Attitude. Legacy.")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6 group">
              <div className="text-7xl font-black text-white/5 group-hover:text-primary/20 transition-colors duration-500" style={{ fontFamily: 'var(--font-playfair)' }}>01</div>
              <h3 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>{t("Be Bold")}</h3>
              <p className="text-white/50 text-lg font-light leading-relaxed">
                {t("Dare to stand out from the crowd. Our pieces are designed for those who aren't afraid to make a statement.")}
              </p>
              <div className="w-12 h-[2px] bg-white/10 group-hover:w-full transition-all duration-700"></div>
            </div>
            
            <div className="space-y-6 group">
              <div className="text-7xl font-black text-white/5 group-hover:text-primary/20 transition-colors duration-500" style={{ fontFamily: 'var(--font-playfair)' }}>02</div>
              <h3 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>{t("Be Extraordinary")}</h3>
              <p className="text-white/50 text-lg font-light leading-relaxed">
                {t("Elevate every moment from ordinary to iconic. Your style is your superpower in every room you enter.")}
              </p>
              <div className="w-12 h-[2px] bg-white/10 group-hover:w-full transition-all duration-700"></div>
            </div>
            
            <div className="space-y-6 group">
              <div className="text-7xl font-black text-white/5 group-hover:text-primary/20 transition-colors duration-500" style={{ fontFamily: 'var(--font-playfair)' }}>03</div>
              <h3 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>{t("Be You")}</h3>
              <p className="text-white/50 text-lg font-light leading-relaxed">
                {t("Authenticity is the ultimate luxury. We create fashion that amplifies your true self, never masks it.")}
              </p>
              <div className="w-12 h-[2px] bg-white/10 group-hover:w-full transition-all duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-black/5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 border border-black/5 group-hover:bg-black group-hover:text-white">
                <Truck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-poppins)' }}>{t("Global Concierge Shipping")}</h3>
                <p className="text-black/40 text-sm font-light leading-relaxed max-w-[250px] mx-auto">{t("Complimentary express shipping on all orders worldwide, handled with care.")}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 border border-black/5 group-hover:bg-black group-hover:text-white">
                <Diamond className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-poppins)' }}>{t("Artisan Craftsmanship")}</h3>
                <p className="text-black/40 text-sm font-light leading-relaxed max-w-[250px] mx-auto">{t("Each piece is a testament to quality, using only the finest sustainable fabrics.")}</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 border border-black/5 group-hover:bg-black group-hover:text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-poppins)' }}>{t("Personal Stylist Support")}</h3>
                <p className="text-black/40 text-sm font-light leading-relaxed max-w-[250px] mx-auto">{t("Our experts are available 24/7 to help you curate your perfect wardrobe.")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-black/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-black text-white rounded-[3rem] p-12 sm:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {t("The Throne Awaits.")}
                </h2>
                <p className="text-white/60 text-xl font-light tracking-widest uppercase">{t("Become a CARA Queen Today")}</p>
              </div>
              <p className="text-white/40 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                {t("Join our exclusive community and get early access to limited drops, private sales, and personalized styling recommendations.")}
              </p>
              <div className="pt-8">
                <Link href="/products">
                  <Button 
                    size="lg" 
                    className="bg-white text-black hover:bg-white/90 px-12 py-8 text-sm font-bold uppercase tracking-[0.3em] rounded-none transition-all duration-500 transform hover:scale-110"
                  >
                    {t("Enter The Dynasty")} <ArrowRight className="ml-4 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
