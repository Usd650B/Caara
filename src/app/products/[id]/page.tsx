"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, Play, ShoppingBag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

export default function ProductDetailPage() {
  const { formatPrice, t } = useSettings();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour countdown
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Flash sale effect
  useEffect(() => {
    const flashTimer = setTimeout(() => {
      setIsFlashSale(true);
      setTimeout(() => setIsFlashSale(false), 3000); // Flash for 3 seconds every 10 seconds
    }, 5000);

    return () => clearTimeout(flashTimer);
  }, []);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (productId: string) => {
    // Loading state for new product fetch
    try {
      const products = await getProducts();
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        if (foundProduct.sizes && foundProduct.sizes.length > 0) setSelectedSize(foundProduct.sizes[0]);
        else setSelectedSize("Standard");
        if (foundProduct.colors && foundProduct.colors.length > 0) setSelectedColor(foundProduct.colors[0]);
        else setSelectedColor("Natural Black");
        
        // Reset current image
        setCurrentImageIndex(0);
      }
      
      // Load related products (excluding current product)
      const related = products
        .filter(p => p.id !== productId)
        .slice(0, 4); // Show up to 4 related products
      setRelatedProducts(related);
      
      setReviews([]);
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
    setIsNavigating(false);
  };

  const addToCart = () => {
    if (!product) return;

    // Validate required fields
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const selectedMedia = productMedia[currentImageIndex];
    const isVideo = selectedMedia?.includes('video');

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: isVideo ? product.image : selectedMedia, // Use primary image if video is selected
      quantity,
      size: selectedSize,
      color: selectedColor,
      rating: product.rating,
      reviews: product.reviews,
      selectedVariantImage: isVideo ? product.image : selectedMedia // Extra field for clarity
    };

    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart with same size and color
    const existingIndex = existingCart.findIndex((item: any) => 
      item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );

    if (existingIndex >= 0) {
      // Update quantity
      existingCart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Update cart count in header (if needed)
    const cartCount = existingCart.reduce((total: number, item: any) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount.toString());
    
    // Dispatch custom event to update header cart count
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  // Get product images (use uploaded images or fallback to placeholder)
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image] 
      : ['https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=800&h=800&fit=crop'];

  // Add video to media array if exists
  const productMedia = product?.video 
    ? [...productImages, product.video] 
    : productImages;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productMedia.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productMedia.length) % productMedia.length);
  };

  // Targeted loading indicator for specific sections
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When ID changes, we want a subtle loading state instead of a whole-page skeleton
    if (params.id) {
      setIsNavigating(true);
      // loadProduct is already called in the other useEffect
    }
  }, [params.id]);

  if (isLoading && !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-gray-50 rounded-[2.5rem] animate-pulse" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 bg-gray-50 rounded-xl w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-50 rounded-xl w-1/4 animate-pulse" />
            <div className="h-24 bg-gray-50 rounded-xl w-full animate-pulse" />
            <div className="h-12 bg-gray-50 rounded-xl w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back to Products")}
              </Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-300 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-7xl mx-auto items-start">
          {/* Product Media - 7 Columns */}
          <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
            <div className="relative group overflow-hidden">
              <div className="aspect-[4/5] bg-[#fdfdfd] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-black/[0.03] shadow-sm">
                {productMedia[currentImageIndex]?.includes('video') ? (
                  <video
                    src={productMedia[currentImageIndex]}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <LazyImage 
                    src={productMedia[currentImageIndex]} 
                    alt={product.name}
                    className="w-full h-full"
                  />
                )}
              </div>
              
              {/* Media Navigation - Minimalist */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"
              >
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>

            {/* Thumbnail Media / Type Selection - Balanced Size */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-black/40 px-2">
                <span>Select Style / Type</span>
                <span className="text-black">Option {currentImageIndex + 1}</span>
              </div>
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                {productMedia.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden border-2 transition-all relative group ${
                      currentImageIndex === index ? 'border-black shadow-xl scale-105' : 'border-black/5 hover:border-black/20'
                    }`}
                  >
                    {media.includes('video') ? (
                      <div className="relative w-full h-full">
                        <video src={media} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <LazyImage src={media} className="w-full h-full" aspectRatio="aspect-square" alt="" />
                    )}
                    
                    {currentImageIndex === index && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <CheckCircle className="h-3 w-3 text-black" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col pt-0 lg:pt-4">
            <div className="space-y-6 lg:space-y-10">
              {/* Context & Title */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                    {product.badge || 'Premium Selection'}
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 underline decoration-black/10 underline-offset-4">{t(product.category)}</p>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-black leading-[1.05]">{product.name}</h1>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-black fill-black' : 'text-black/10 fill-black/10'}`} />
                    ))}
                    <span className="text-xs font-black ml-1">4.8</span>
                  </div>
                  <div className="h-4 w-px bg-black/10" />
                  <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">{product.reviews || "120"} Verified Reviews</span>
                </div>
              </div>

              {/* Price Block - Modern & Clean */}
              <div className="flex flex-col gap-2 bg-gradient-to-br from-gray-50/80 to-white p-8 rounded-[2.5rem] border border-black/[0.03] shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <ShoppingBag className="h-24 w-24" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/20">Retail Value</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-black text-black tracking-tighter">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-green-600 uppercase mb-1">Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                      <span className="text-lg text-black/20 line-through font-bold leading-none">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Tax Included & Carbon Neutral Shipping
                </div>
              </div>

              {/* Selections */}
              <div className="space-y-10 py-4">
                {/* Variant Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-black/40">Chromatic Node</span>
                      <span className="text-black bg-black/5 px-3 py-1 rounded-lg">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`group relative px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border-2 overflow-hidden ${
                            selectedColor === color
                              ? "border-black bg-black text-white shadow-xl scale-105"
                              : "border-black/5 hover:border-black/20 text-black/40"
                          }`}
                        >
                          <span className="relative z-10">{t(color)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="text-black/40">Dimensional Scale</span>
                      <span className="text-black bg-black/5 px-3 py-1 rounded-lg">{selectedSize}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[4.5rem] px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border-2 ${
                            selectedSize === size
                              ? "border-black bg-black text-white shadow-xl scale-105"
                              : "border-black/5 hover:border-black/20 text-black/40"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                    <span>Batch Quantity</span>
                    {product.stock !== undefined && product.stock < 10 && (
                      <span className="text-red-500 animate-pulse">Critical: Only {product.stock} Left</span>
                    )}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="inline-flex items-center bg-black/[0.02] border border-black/5 rounded-[1.5rem] p-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"><Minus className="h-4 w-4" /></button>
                      <span className="w-14 text-center text-sm font-black tracking-widest">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 text-[9px] font-black uppercase tracking-widest text-black/20 leading-relaxed">
                      Optimized for supply chain node efficiency.
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="space-y-6 pt-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={addToCart}
                    className={`flex-1 h-20 text-[11px] font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all active:scale-95 ${
                      isAdded ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-black text-white hover:bg-black/90 hover:-translate-y-1'
                    }`}
                  >
                    {isAdded ? (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5" /> Secured to Cart
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5" /> {t("Add to Bag")}
                      </div>
                    )}
                  </Button>
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`w-20 h-20 rounded-[2rem] border-2 flex items-center justify-center transition-all ${
                      isFavorited ? 'bg-red-50 border-red-500 text-red-500' : 'border-black/5 hover:border-black/20 text-black/20'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-gray-50/50 border border-black/[0.03] hover:border-black/10 transition-colors group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Truck className="h-4 w-4 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black">Express Logistics</span>
                        <span className="text-[8px] font-bold text-black/30 uppercase tracking-tighter">Complimentary Global Delivery</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-gray-50/50 border border-black/[0.03] hover:border-black/10 transition-colors group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <Shield className="h-4 w-4 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black">Asset Protocol</span>
                        <span className="text-[8px] font-bold text-black/30 uppercase tracking-tighter">Full Data Encryption Secured</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Description - Simplified */}
              {product.description && (
                <div className="space-y-4 pt-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Product Narrative</h3>
                  <p className="text-sm text-black/60 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Delivery & Security Minimalist Section */}
              <div className="pt-10 space-y-6 border-t border-black/5 mt-10">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest group cursor-pointer hover:text-black transition-colors">
                  <span className="text-black/40 group-hover:text-black">Logistics Breakdown</span>
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest group cursor-pointer hover:text-black transition-colors">
                  <span className="text-black/40 group-hover:text-black">Secure Payment Protocol</span>
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest group cursor-pointer hover:text-black transition-colors">
                  <span className="text-black/40 group-hover:text-black">Authenticity Guarantee</span>
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 pb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                {t("You Might Also Like")}
              </h2>
              <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                {t("See All")}
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group block h-full">
                  <div className="flex flex-col h-full bg-white rounded-sm overflow-hidden border border-transparent hover:border-muted-foreground/20 transition-all duration-200">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {p.image ? (
                        <LazyImage 
                          src={p.image} 
                          alt={p.name}
                          className="group-hover:scale-105 transition-transform duration-700"
                          aspectRatio="aspect-[3/4]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      {p.badge && (
                        <div className="absolute top-1 left-1">
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black text-white rounded-xs uppercase tracking-tight shadow-sm">
                            {t(p.badge)}
                          </span>
                        </div>
                      )}

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
                        {p.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-[15px] font-bold text-foreground">
                            {formatPrice(p.price)}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(p.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs pt-0.5">
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="text-[10px] ml-0.5 font-bold text-foreground">4.8</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground">(500+)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
