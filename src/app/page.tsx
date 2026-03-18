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
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="text-center max-w-7xl mx-auto w-full relative z-10">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Animated Badge */}
            <div className="inline-flex items-center space-x-2 glass px-3 py-2 sm:px-6 sm:py-3 rounded-full shadow-xl border border-white/20">
              <Sparkles className="h-3 w-3 sm:h-5 sm:w-5 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold gradient-text uppercase tracking-widest">{t("The Art of Being Unforgettable")}</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-tight lg:leading-[1.1]" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
                {t("Every Queen")}<br className="sm:hidden" /> <span className="gradient-text">{t("Wears CARA")}</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light max-w-2xl mx-auto tracking-wide px-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t("Elevate your style with premium pieces designed for the extraordinary.")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="gradient-bg text-white hover:opacity-90 px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold tracking-wider shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                >
                  {t("Enter the World")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="glass border-primary/20 text-foreground hover:bg-primary/10 px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold tracking-wider transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                {t("Discover More")}
              </Button>
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

      {/* Featured Products */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold gradient-text uppercase tracking-widest">{t("Trending Now")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
              {t("The Collection")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-light tracking-wide px-4">{t("Curated pieces that become part of your identity")}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="glass rounded-xl animate-pulse aspect-[3/4]"></div>
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
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-card rounded-xl">
                    <div className="relative overflow-hidden aspect-[3/4]">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Badge */}
                      {product.badge === "New" && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 text-[9px] font-bold gradient-bg text-white rounded uppercase tracking-wider shadow">
                            {t("NEW")}
                          </span>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                        <Button 
                          className="flex-1 bg-white/95 text-black hover:bg-black hover:text-white border-none h-8 text-[10px] font-bold tracking-wider uppercase rounded-lg shadow-lg"
                          onClick={(e) => {
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
                          {t("Add")}
                        </Button>
                        <Button 
                          size="icon"
                          className="bg-white/95 text-black border-none h-8 w-8 rounded-lg shadow-lg hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Saved to your collection! ❤️');
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-card relative">
                      <h3 className="font-bold text-foreground text-xs leading-tight mb-1 truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-sm font-black text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through font-medium">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="text-[10px] font-bold text-muted-foreground">4.8</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-[0.03]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
              {t("The CARA Culture")}
            </h2>
            <p className="text-muted-foreground text-lg font-light tracking-wide">{t("More than fashion, it's a movement")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl text-center space-y-4 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-white text-3xl font-black">B</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Be Bold</h3>
              <p className="text-muted-foreground font-light tracking-wide">Dare to stand out, embrace your uniqueness</p>
            </div>
            <div className="glass p-8 rounded-3xl text-center space-y-4 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-white text-3xl font-black">E</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Be Extraordinary</h3>
              <p className="text-muted-foreground font-light tracking-wide">Elevate every moment, make it count</p>
            </div>
            <div className="glass p-8 rounded-3xl text-center space-y-4 hover:shadow-2xl transition-all duration-500 group">
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-6 group-hover:rotate-0 transition-transform">
                <span className="text-white text-3xl font-black">Y</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Be You</h3>
              <p className="text-muted-foreground font-light tracking-wide">Authenticity is your greatest power</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Truck className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t("Global Free Shipping")}</h3>
              <p className="text-muted-foreground font-light tracking-wide">{t("Complimentary shipping on all orders worldwide")}</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Diamond className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t("Premium Quality")}</h3>
              <p className="text-muted-foreground font-light tracking-wide">{t("Hand-selected fabrics and artisan craftsmanship")}</p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <Users className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{t("24/7 Support")}</h3>
              <p className="text-muted-foreground font-light tracking-wide">{t("Our styling experts are always here for you")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair)', letterSpacing: '-0.02em' }}>
                {t("Ready to Become Iconic?")}
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg sm:text-xl font-light tracking-wide" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t("Join the movement. Wear CARA. Create your legacy.")}
              </p>
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-xl font-bold tracking-wider shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-2xl"
                >
                  {t("Begin Your Journey")} <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
