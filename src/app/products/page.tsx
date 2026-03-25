"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star, Filter, Search, ChevronDown, X, Truck, ShieldCheck, Zap, Minus, Plus, Diamond } from "lucide-react";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

const categories = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Knitwear"];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "Over $200", min: 200, max: Infinity }
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [drawerSize, setDrawerSize] = useState<string>("M");
  const [drawerQuantity, setDrawerQuantity] = useState<number>(1);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product, (product.sizes && product.sizes[0]) || "M", 1);
    
    setAddedItems(prev => new Set(prev).add(product.id as string));
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(product.id as string);
        return next;
      });
    }, 2000);
  };

  const addToCart = (product: Product, size: string, quantity: number) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      quantity: quantity,
      size: size,
      color: (product.colors && product.colors[0]) || "Black",
      rating: product.rating,
      reviews: product.reviews
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) => 
      item.id === product.id && item.size === cartItem.size && item.color === cartItem.color
    );

    if (existingIndex >= 0) existingCart[existingIndex].quantity += quantity;
    else existingCart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "rating": return (b.rating || 0) - (a.rating || 0);
      case "newest": return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      default: return 0;
    }
  });

  const openDrawer = (product: Product) => {
    setActiveProduct(product);
    setDrawerSize((product.sizes && product.sizes[0]) || "M");
    setDrawerQuantity(1);
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    setActiveProduct(null);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Product Aside/Drawer */}
      {activeProduct && (
        <div 
          className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300"
          onClick={closeDrawer}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeDrawer}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col h-full">
              <div className="w-full aspect-[4/5] bg-muted relative">
                <LazyImage 
                  src={activeProduct.image || ""} 
                  alt={activeProduct.name}
                  className="w-full h-full"
                />
                {activeProduct.badge && (
                  <div className="absolute top-6 left-6">
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest leading-none">
                      {t(activeProduct.badge)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-8 sm:p-12 space-y-10 flex-1">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <Diamond className="h-3 w-3" />
                    <span>{t(activeProduct.category)}</span>
                    <span className="text-black/20 text-[10px]">•</span>
                    <span className="text-black/40">{t("Verified Product")}</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {activeProduct.name}
                  </h2>
                  <div className="flex items-end space-x-4">
                    <span className="text-3xl font-black text-black">
                      {formatPrice(activeProduct.price)}
                    </span>
                    {activeProduct.originalPrice && (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg text-black/30 line-through">
                          {formatPrice(activeProduct.originalPrice)}
                        </span>
                        <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5">
                          -{Math.round(((activeProduct.originalPrice - activeProduct.price) / activeProduct.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-4 border-y border-black/5">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (activeProduct?.rating || 5) ? 'fill-current' : 'text-black/10'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-black/60">{activeProduct.rating || 4.8} / 5.0</span>
                  <span className="text-black/20 text-xs">•</span>
                  <span className="text-xs font-bold uppercase tracking-widest underline cursor-pointer hover:text-primary transition-colors">{t("Read reviews")}</span>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span>{t("Select Size")}</span>
                      <button className="text-black/40 hover:text-black underline">{t("Size Guide")}</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setDrawerSize(s)}
                          disabled={activeProduct?.sizes && !activeProduct.sizes.includes(s)}
                          className={`w-14 h-14 flex items-center justify-center text-xs font-bold transition-all ${
                            drawerSize === s 
                              ? 'bg-black text-white shadow-xl scale-110' 
                              : 'bg-white border border-black/10 text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest block">{t("Quantity")}</span>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center border border-black/10 p-1">
                        <button 
                          onClick={() => setDrawerQuantity(Math.max(1, drawerQuantity - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold">{drawerQuantity}</span>
                        <button 
                          onClick={() => setDrawerQuantity(drawerQuantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-black/40 font-bold">{t("In Stock")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4 pt-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-black text-white h-16 text-sm font-bold uppercase tracking-[0.2em] rounded-none hover:bg-black/90 transition-all shadow-xl active:scale-[0.98]"
                    onClick={() => {
                      if(activeProduct) addToCart(activeProduct, drawerSize, drawerQuantity);
                      closeDrawer();
                    }}
                  >
                    {t("Add to Bag")} — {formatPrice(activeProduct.price * drawerQuantity)}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full h-16 border-black/10 text-sm font-bold uppercase tracking-[0.2em] rounded-none transition-all hover:bg-black hover:text-white"
                    onClick={(e) => toggleFavorite(e, activeProduct?.id as string)}
                  >
                    <Heart className={`mr-2 h-5 w-5 ${favoritedItems.has(activeProduct?.id as string) ? 'fill-red-500 text-red-500' : ''}`} />
                    {favoritedItems.has(activeProduct?.id as string) ? t("Saved") : t("Save to Collection")}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 py-8 border-t border-black/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest block">{t("Premium Quality")}</span>
                      <span className="text-[10px] text-black/40">{t("Certified Artisan")}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest block">{t("Express Ship")}</span>
                      <span className="text-[10px] text-black/40">{t("Fast Delivery")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header Area */}
      <div className="bg-white border-b border-black/5 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-[#f3f4f6] -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-screen-2xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              <span className="w-8 h-[1px] bg-primary"></span>
              <span>{t("Royal Assortment")}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t("The Collection")}
            </h1>
            <p className="text-black/50 text-xl font-light max-w-xl leading-relaxed">
              {t("Explore curated pieces designed to elevate your aesthetic.")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:pb-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 h-4 w-4" />
              <input
                type="text"
                placeholder={t("Search the vault...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 bg-white border border-black/5 w-full md:w-80 text-sm focus:ring-1 focus:ring-black shadow-sm font-medium transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sorting & Stats Bar */}
      <div className="sticky top-[0px] z-30 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest hover:text-primary transition-colors border-r border-black/5 pr-6"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? t("Hide Filters") : t("Show Filters")}</span>
            </button>
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-black/40 pr-6 border-r border-black/5">
              <span>{isLoading ? t("Searching...") : `${filteredProducts.length} ${t("Selected Pieces")}`}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 hidden sm:block">{t("Sort By")}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
            >
              <option value="featured">{t("Featured Drop")}</option>
              <option value="price-low">{t("Price: Ascending")}</option>
              <option value="price-high">{t("Price: Descending")}</option>
              <option value="rating">{t("Royal Rating")}</option>
              <option value="newest">{t("Just Landed")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {showFilters && (
            <div className="lg:w-72 space-y-12 shrink-0 animate-in slide-in-from-left duration-500">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
                  {t("Category Selection")}
                  <ChevronDown className="h-3 w-3" />
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-sm tracking-wide text-left transition-all ${
                        selectedCategory === c 
                          ? 'text-primary font-bold translate-x-2' 
                          : 'text-black/50 hover:text-black hover:translate-x-1'
                      }`}
                    >
                      {t(c)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
                  {t("Price Tier")}
                  <ChevronDown className="h-3 w-3" />
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                  {priceRanges.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setSelectedPriceRange(r)}
                      className={`text-sm tracking-wide text-left transition-all ${
                        selectedPriceRange.label === r.label 
                          ? 'text-primary font-bold translate-x-2' 
                          : 'text-black/50 hover:text-black hover:translate-x-1'
                      }`}
                    >
                      {t(r.label)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
                  {t("Size Profile")}
                  <ChevronDown className="h-3 w-3" />
                </h3>
                <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                  {["All", ...sizes].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-10 flex items-center justify-center text-[10px] font-bold border transition-all ${
                        selectedSize === s 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white border-black/5 text-black hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-[10px] font-bold uppercase tracking-[0.2em] h-12 rounded-none border-black/5 hover:bg-black hover:text-white transition-all"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedPriceRange(priceRanges[0]);
                  setSelectedSize("All");
                  setSearchTerm("");
                }}
              >
                {t("Clear Filters")}
              </Button>
            </div>
          )}

          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12 px-2 sm:px-0">
              {isLoading ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="aspect-[3/4] bg-muted w-full"></div>
                    <div className="h-4 bg-muted w-[60%]"></div>
                    <div className="h-4 bg-muted w-[40%]"></div>
                  </div>
                ))
              ) : (
                sortedProducts.map((p) => (
                  <div 
                    key={p.id} 
                    className="group space-y-4 animate-fade-in cursor-pointer"
                    onClick={() => openDrawer(p)}
                  >
                    <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                      <LazyImage 
                        src={p.image || ""} 
                        alt={p.name}
                        className="transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                        aspectRatio="aspect-[3/4]"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {p.badge && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black text-white text-[8px] font-bold uppercase tracking-wider">
                            {t(p.badge)}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <Button 
                          className="w-full h-10 bg-white text-black hover:bg-black hover:text-white rounded-none text-[10px] font-bold uppercase tracking-widest shadow-xl border-none"
                          onClick={(e) => handleQuickAdd(e, p)}
                        >
                          <ShoppingCart className="h-3 w-3 mr-2" />
                          {addedItems.has(p.id as string) ? t("Added") : t("Quick Add")}
                        </Button>
                      </div>

                      <button 
                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-all shadow-sm ${
                          favoritedItems.has(p?.id as string) ? 'bg-red-50 text-red-500 scale-110' : 'bg-white/60 text-black/40 hover:bg-white hover:text-red-500'
                        }`}
                        onClick={(e) => toggleFavorite(e, p?.id as string)}
                      >
                        <Heart className={`h-3.5 w-3.5 ${favoritedItems.has(p?.id as string) ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-black/80 line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                        {p.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-black">
                          {formatPrice(p.price)}
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs text-black/30 line-through">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
