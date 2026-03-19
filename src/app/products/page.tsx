"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Filter, Search, ArrowRight, ChevronDown, X, Truck, CheckCircle } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import Link from "next/link";
import { useSettings } from "@/lib/settings";

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Knitwear"];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity }
];
const sizes = ["All", "XS", "S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const { t, formatPrice } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedSize, setSelectedSize] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      quantity: 1,
      size: (product.sizes && product.sizes[0]) || "M",
      color: (product.colors && product.colors[0]) || "Black",
      rating: product.rating,
      reviews: product.reviews
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) => 
      item.id === product.id && item.size === cartItem.size && item.color === cartItem.color
    );

    if (existingIndex >= 0) existingCart[existingIndex].quantity += 1;
    else existingCart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new CustomEvent('cart-updated'));

    setAddedItems(prev => new Set(prev).add(product.id as string));
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(product.id as string);
        return next;
      });
    }, 2000);
  };
  
  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const loadProducts = async () => {
    setIsLoading(true);
    const productsData = await getProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriceRange = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    const matchesSize = selectedSize === "All" || (product.sizes && product.sizes.includes(selectedSize));
    return matchesCategory && matchesSearch && matchesPriceRange && matchesSize;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      default:
        return 0;
    }
  });

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t("The")} <span className="gradient-text">{t("Collection")}</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-light">{t("Discover pieces that define your universe")}</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 md:w-64 text-sm transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
              >
                <option value="featured">{t("Featured")}</option>
                <option value="price-low">{t("Price: Low to High")}</option>
                <option value="price-high">{t("Price: High to Low")}</option>
                <option value="rating">{t("Highest Rated")}</option>
                <option value="newest">{t("Newest")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Filters Sidebar */}
          <div className="lg:w-72">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)} 
                className="w-full flex items-center justify-between h-12 rounded-xl glass border-primary/20"
              >
                <span className="font-bold">{t("Filters & Refine")}</span>
                <Filter className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Desktop Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-card rounded-2xl border border-border shadow-sm p-6 space-y-8 sticky top-32 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-hide`}>
              
              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t("Category")}</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full flex items-center justify-between text-sm transition-all ${
                        selectedCategory === category
                          ? "text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span className="text-left">{t(category)}</span>
                      {selectedCategory === category && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t("Price Range")}</h3>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`w-full flex items-center justify-between text-sm transition-all ${
                        selectedPriceRange.label === range.label
                          ? "text-primary font-bold"
                          : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span className="text-left">{t(range.label)}</span>
                      {selectedPriceRange.label === range.label && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-4 pt-6 border-t border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t("Size")}</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[40px] px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPriceRange(priceRanges[0]);
                    setSelectedSize("All");
                    setSearchTerm("");
                  }}
                  variant="outline"
                  className="w-full text-xs font-bold uppercase tracking-wider hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                >
                  {t("Clear Filters")}
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active Filters Display */}
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedCategory !== "All" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>{t(selectedCategory)}</span>
                  <button onClick={() => setSelectedCategory("All")} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
              {selectedPriceRange.label !== "All Prices" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>{t(selectedPriceRange.label)}</span>
                  <button onClick={() => setSelectedPriceRange(priceRanges[0])} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
              {selectedSize !== "All" && (
                <div className="glass-white px-4 py-2 rounded-full flex items-center text-xs font-bold text-primary shadow-sm">
                  <span>{t("Size")}: {selectedSize}</span>
                  <button onClick={() => setSelectedSize("All")} className="ml-2 hover:opacity-50"><X className="h-3 w-3" /></button>
                </div>
              )}
            </div>

            {/* Product Count & Info */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-light">
                {t("Showing")} <span className="font-bold text-foreground">{sortedProducts.length}</span> {t("extraordinary pieces")}
              </p>
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full">
                <Truck className="h-3 w-3" />
                <span>{t("Free Worldwide Shipping")}</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-card rounded-md aspect-[3/4] animate-pulse"></div>
                ))
              ) : sortedProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-[3rem] p-12">
                  <div className="w-20 h-20 gradient-bg rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-12">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {t("No Matches Found")}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto font-light">
                    {t("Adjust your filters to discover other extraordinary pieces from our collection.")}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedPriceRange(priceRanges[0]);
                      setSelectedSize("All");
                    }} 
                    className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest"
                  >
                    {t("Reset All Filters")}
                  </Button>
                </div>
              ) : (
                sortedProducts.map((product) => (
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
                            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* SHEIN-style Badge */}
                        {product.badge && (
                          <div className="absolute top-1 left-1 flex flex-col gap-1">
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black text-white rounded-xs uppercase tracking-tight shadow-sm">
                              {t(product.badge)}
                            </span>
                          </div>
                        )}

                        {/* Hover Quick Add Area */}
                        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/5 backdrop-blur-[2px]">
                          <Button 
                            className={`w-full border-none h-7 text-[10px] font-bold tracking-tight uppercase rounded-sm shadow-sm transition-all ${
                              addedItems.has(product.id as string) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/95 text-black hover:bg-black hover:text-white'
                            }`}
                            onClick={(e) => handleQuickAdd(e, product)}
                          >
                            {addedItems.has(product.id as string) ? (
                              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {t("Added")}</span>
                            ) : (
                              t("Add to Bag")
                            )}
                          </Button>
                        </div>

                        {/* Wishlist Button */}
                        <button 
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors shadow-sm touch-target ${
                            favoritedItems.has(product.id as string) ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/60 text-muted-foreground hover:bg-white hover:text-red-500'
                          }`}
                          onClick={(e) => toggleFavorite(e, product.id as string)}
                        >
                          <Heart className={`h-3.5 w-3.5 ${favoritedItems.has(product.id as string) ? 'fill-red-500' : ''}`} />
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
                          <span className="text-[9px] text-muted-foreground">(2k+)</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
