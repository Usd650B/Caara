"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, Play, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";

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
    setIsLoading(true);
    try {
      const products = await getProducts();
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
      
      // Load related products (excluding current product)
      const related = products
        .filter(p => p.id !== productId)
        .slice(0, 4); // Show up to 4 related products
      setRelatedProducts(related);
      
      // TODO: Load real reviews when review system is implemented
      setReviews([]);
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
  };

  const addToCart = () => {
    if (!product) return;

    // Validate required fields
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      quantity,
      size: selectedSize,
      color: selectedColor,
      rating: product.rating,
      reviews: product.reviews
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
    
    alert('Product added to cart!');
    
    // Optional: Redirect to cart
    // router.push('/cart');
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Product Media */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="aspect-[3/4] sm:aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                {productMedia[currentImageIndex]?.includes('video') ? (
                  <video
                    src={productMedia[currentImageIndex]}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={productMedia[currentImageIndex]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              
              {/* Media Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg touch-target"
                aria-label="Previous product media"
              >
                <ArrowLeft className="h-3 w-3 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg touch-target"
                aria-label="Next product media"
              >
                <ArrowLeft className="h-3 w-3 sm:h-5 sm:w-5 rotate-180" />
              </button>
            </div>

            {/* Thumbnail Media */}
            <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
              {productMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all touch-target ${
                    currentImageIndex === index ? 'border-purple-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-label={`View product ${media.includes('video') ? 'video' : 'image'} ${index + 1}`}
                >
                  {media.includes('video') ? (
                    <div className="relative w-full h-full">
                      <video
                        src={media}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                          <Play className="h-2 w-2 sm:h-3 sm:w-3 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={media} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0"> {/* Added pb for sticky mobile button */}
            {/* Product Info */}
            <div>
              <h1 className="heading-hero text-2xl sm:text-3xl lg:text-4xl mb-2 tracking-tight">{product.name}</h1>
              
              {/* Price & Rating Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through font-medium">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.badge && (
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm bg-black text-white ml-2">
                      {t(product.badge)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">{product.rating || "4.8"}</span>
                  <span className="text-xs text-gray-500">
                    ({product.reviews || Math.floor(Math.random() * 500 + 100)})
                  </span>
                </div>
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-6 py-6 border-y border-gray-100">
              {/* Color Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-900">{t("Color")}</label>
                  <span className="text-xs font-semibold text-gray-500">{selectedColor ? t(selectedColor) : t("Select a color")}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(product.colors || ["Black", "White", "Pink", "Blue"]).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`relative px-4 py-2 text-sm font-bold transition-all rounded-full border-2 focus:outline-none ${
                        selectedColor === color
                          ? "border-black text-black bg-white shadow-sm ring-2 ring-black/10 ring-offset-2"
                          : "border-gray-200 text-gray-600 hover:border-black/30 hover:bg-gray-50"
                      }`}
                    >
                      {t(color)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-900">{t("Size")}</label>
                  <span className="text-xs font-semibold text-primary underline cursor-pointer hover:text-black">{t("Size Guide")}</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {(product.sizes || ["XS", "S", "M", "L", "XL"]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-3 py-2 text-sm font-bold transition-all rounded-lg border-2 focus:outline-none ${
                        selectedSize === size
                          ? "border-black text-black bg-white shadow-sm ring-2 ring-black/10 ring-offset-2"
                          : "border-gray-200 text-gray-600 hover:border-black/30 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">{t("Quantity")}</label>
                <div className="flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-lg p-1 w-max">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 hover:text-black transition-all"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold select-none">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 hover:text-black transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Add to Cart (Desktop only) */}
            <div className="hidden lg:flex space-x-3">
              <Button 
                onClick={addToCart}
                className="flex-1 bg-black text-white hover:bg-black/90 h-14 text-base font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                {t("Add to Cart")}
              </Button>
              <Button variant="outline" className="h-14 px-6 rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-colors">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Sticky Add to Cart */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50 flex space-x-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
              <Button variant="outline" className="h-[3.25rem] px-5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 flex-shrink-0">
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                onClick={addToCart}
                className="flex-1 bg-black text-white hover:bg-black/90 h-[3.25rem] text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg"
              >
                {t("Add to Cart")} • {formatPrice(product.price * quantity)}
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 gap-4 pt-6">
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Truck className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{t("Free International Delivery")}</p>
                  <p className="text-xs text-gray-500 mt-1">{t("Automatically applied at checkout")}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Shield className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{t("Buyer Protection guarantee")}</p>
                  <p className="text-xs text-gray-500 mt-1">{t("Safe & secure payments with full refunds")}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-8 mb-12">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">{t("Product Details")}</h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              </div>
            )}
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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group block h-full">
                  <div className="flex flex-col h-full bg-white rounded-sm overflow-hidden border border-transparent hover:border-muted-foreground/20 transition-all duration-200">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      {p.image ? (
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
