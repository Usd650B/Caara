"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, Play, ShoppingBag, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, getOrders, getPromos, Product, Order, Promo } from "@/lib/firestore";
import { trackDetailedProductClick, trackAddToCart, syncCartState } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";
import { isCustomerAuthenticated } from "@/lib/customer-auth";
import { openAuthModal } from "@/components/ui/global-auth-modal";

export default function ProductDetailPage() {
  const { formatPrice, t } = useSettings();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("Dar es salaam");
  const [productReviews, setProductReviews] = useState<{rating: number, review: string, customer: string, date: string, adminReply?: string}[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    // Try to load any previously selected delivery region
    const savedRegion = typeof window !== 'undefined' ? localStorage.getItem('deliveryRegion') : null;
    if (savedRegion) {
      setSelectedRegion(savedRegion);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (slugOrId: string) => {
    setIsLoading(true);
    try {
      const [products, promosData] = await Promise.all([getProducts(), getPromos()]);
      setPromos(promosData);
      // Pluck the last segment after the dash to find the ID (e.g. "luxury-bag-A1b2C" -> "A1b2C")
      const realId = slugOrId.split('-').pop();
      const foundProduct = products.find(p => p.id === slugOrId || p.id === realId);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        setSelectedSize(foundProduct.sizes?.[0] || "");
        setSelectedColor(foundProduct.colors?.[0] || "");
        setCurrentImageIndex(0);
        trackDetailedProductClick(foundProduct);

        // Load real reviews from delivered orders
        const allOrders = await getOrders();
        const reviewsData: {rating: number, review: string, customer: string, date: string, adminReply?: string}[] = [];
        let totalRating = 0;

        allOrders.forEach(order => {
          if (order.rating && order.items?.some(item => item.productId === foundProduct.id)) {
            const dateStr = order.createdAt ? new Date((order.createdAt as any).seconds * 1000).toLocaleDateString() : 'Recent';
            reviewsData.push({
              rating: order.rating,
              review: order.review || '',
              customer: order.customerName,
              date: dateStr,
              adminReply: order.adminReply || ''
            });
            totalRating += order.rating;
          }
        });

        setProductReviews(reviewsData);
        if (reviewsData.length > 0) {
          setAverageRating(Math.round((totalRating / reviewsData.length) * 10) / 10);
        } else {
          setAverageRating(foundProduct.rating || 0); // fallback to db or 0
        }
      }
      setRelatedProducts(products.filter(p => p.id !== foundProduct?.id).slice(0, 6));
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
  };

  const promoPrice = product ? getPromoPrice(product.id || '', product.price, promos) : null;

  // Build the media array: main image first, then additional images
  const productImages: string[] = [];
  if (product?.image) productImages.push(product.image);
  if (product?.images?.length) productImages.push(...product.images);
  if (productImages.length === 0) productImages.push('https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=800&h=800&fit=crop');
  const productMedia = product?.video ? [...productImages, product.video] : productImages;
  const addToCart = () => {
    // Check for authentication first
    if (!isCustomerAuthenticated()) {
      openAuthModal();
      return;
    }

    if (!product) return;
    if (product.sizes?.length && !selectedSize) { alert('Please select a size'); return; }
    if (product.colors?.length && !selectedColor) { alert('Please select a color'); return; }

    const selectedMedia = productMedia[currentImageIndex];
    const isVideo = selectedMedia?.includes('video');
    const finalPrice = (promoPrice != null && promoPrice < product.price) ? promoPrice : product.price;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.originalPrice,
      category: product.category,
      image: isVideo ? product.image : selectedMedia,
      quantity,
      size: selectedSize,
      color: selectedColor,
      rating: product.rating,
      reviews: product.reviews,
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) =>
      item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );
    if (existingIndex >= 0) existingCart[existingIndex].quantity += quantity;
    else existingCart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(existingCart));
    const cartCount = existingCart.reduce((total: number, item: any) => total + item.quantity, 0);
    localStorage.setItem('cartCount', cartCount.toString());
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setIsAdded(true);
    trackAddToCart();
    syncCartState(existingCart);
    setTimeout(() => setIsAdded(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 animate-pulse rounded" />
          <div className="space-y-4">
            <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse" />
            <div className="h-20 bg-gray-100 rounded w-full animate-pulse" />
            <div className="h-10 bg-gray-100 rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-3">Product Not Found</h1>
        <Link href="/products"><Button variant="outline">Back to Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-4">

        {/* Breadcrumb */}
        <nav className="relative z-20 flex items-center gap-2 text-[13px] sm:text-[13px] font-medium text-gray-500 mb-4">
          <Link href="/" className="hover:text-black hover:underline transition-colors px-1 -ml-1 py-1 cursor-pointer">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/products" className="hover:text-black hover:underline transition-colors px-1 py-1 cursor-pointer">
            Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-black line-clamp-1 px-1 py-1">{product.name}</span>
        </nav>

        {/* Main grid: Image + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">

          {/* LEFT: Image Gallery */}
          <div className="w-full">
            {/* Thumbnails + Main image */}
            <div className="flex gap-4">
              {/* Vertical thumbnails on desktop */}
              {productMedia.length > 1 && (
                <div className="hidden sm:flex flex-col gap-3 w-16 shrink-0">
                  {productMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative aspect-[4/5] overflow-hidden rounded-lg transition-all ${
                        currentImageIndex === idx ? 'ring-1 ring-black ring-offset-2' : 'opacity-60 hover:opacity-100 bg-[#f7f7f7]'
                      }`}
                    >
                      {media.includes('video') ? (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Play className="h-4 w-4 text-gray-500" />
                        </div>
                      ) : (
                        <img src={media} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative">
                <div className="aspect-[4/5] bg-[#F7F7F7] overflow-hidden rounded-2xl flex items-center justify-center p-4 sm:p-8">
                  {productMedia[currentImageIndex]?.includes('video') ? (
                    <video src={productMedia[currentImageIndex]} controls className="w-full h-full object-contain rounded-lg" preload="metadata" />
                  ) : (
                    <img src={productMedia[currentImageIndex]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300" />
                  )}
                </div>

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-sm shadow-sm">
                    {product.badge}
                  </span>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all z-10 bg-white/90 backdrop-blur-sm ${
                    isFavorited ? 'text-red-500 scale-110' : 'text-gray-400 hover:scale-110 hover:text-gray-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile thumbnails */}
            {productMedia.length > 1 && (
              <div className="flex sm:hidden gap-3 mt-4 overflow-x-auto pb-2 snap-x">
                {productMedia.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-16 aspect-[4/5] rounded-lg overflow-hidden transition-all snap-center ${
                      currentImageIndex === idx ? 'ring-1 ring-black ring-offset-2' : 'opacity-60 bg-[#f7f7f7]'
                    }`}
                  >
                    {media.includes('video') ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Play className="h-3 w-3" /></div>
                    ) : (
                      <img src={media} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="w-full max-w-lg space-y-4 md:sticky md:top-28">

            {/* Category & title */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t(product.category)}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => {
                  const displayRating = averageRating > 0 ? averageRating : (product.id ? 4.7 + (product.id.charCodeAt(0) % 3) * 0.1 : 4.8);
                  return (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : (product.id ? (4.7 + (product.id.charCodeAt(0) % 3) * 0.1).toFixed(1) : '4.8')}
              </span>
              <a href="#reviews" className="text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-tight">
                ({productReviews.length > 0 ? productReviews.length : (product.reviews && product.reviews > 0 ? product.reviews : (product.id ? Math.floor(18 + (product.id.charCodeAt(0) % 25)) : 24))} reviews)
              </a>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {promoPrice != null && promoPrice < product.price ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(promoPrice)}</span>
                  <span className="text-base text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {Math.round(((product.price - promoPrice) / product.price) * 100)}% OFF — PROMO
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {(() => {
                    // Same logic as ProductCard for consistency
                    const isClearance = product.id ? product.id.charCodeAt(0) % 3 === 0 : false;
                    const hasExplicitOriginal = product.originalPrice && product.originalPrice > product.price;
                    
                    if (hasExplicitOriginal || isClearance) {
                      const originalPrice = hasExplicitOriginal 
                        ? product.originalPrice 
                        : product.price * (1.2 + (isClearance ? 0.15 : 0));
                      const originalPriceNum = originalPrice as number;
                      const discount = Math.round(((originalPriceNum - product.price) / originalPriceNum) * 100);
                      
                      return (
                        <div className="flex items-center gap-3">
                          <span className="text-base text-gray-400 line-through">{formatPrice(originalPrice!)}</span>
                          <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-red-100">
                             {isClearance && !hasExplicitOriginal ? 'Supplier Clearance' : 'Limited Offer'}
                          </span>
                          <span className="text-xs font-bold text-red-600">
                            {discount}% OFF
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 -mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" /> Tax included
            </p>

            {/* Delivery Region Selection */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700">
                Delivery Region
              </p>
              <select 
                value={selectedRegion}
                onChange={(e) => {
                   setSelectedRegion(e.target.value);
                   // Persist globally for the checkout session
                   localStorage.setItem('deliveryRegion', e.target.value);
                }}
                className="w-full bg-white border border-gray-200 rounded p-2.5 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              >
                <option value="Dar es salaam">Dar es salaam — Free Shipping</option>
                <optgroup label="Regions / Mikoani (10,000 TZS)">
                  <option value="Arusha">Arusha</option>
                  <option value="Kilimanjaro">Kilimanjaro</option>
                  <option value="Mwanza">Mwanza</option>
                  <option value="Tanga">Tanga</option>
                  <option value="Dodoma">Dodoma</option>
                  <option value="Morogoro">Morogoro</option>
                </optgroup>
              </select>
              
              <div className="flex items-center gap-2 mt-2">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {selectedRegion === "Dar es salaam" 
                    ? "Free doorstep delivery in Dar es salaam" 
                    : `Estimated shipping to ${selectedRegion}: ${formatPrice(3.81)}`}
                </span>
              </div>
            </div>

            {/* Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs border rounded transition-all ${
                        selectedColor === color
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {t(color)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Size: <span className="font-normal text-gray-500">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[2.5rem] px-3 py-1.5 text-xs border rounded transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-700">
                Quantity
                {product.stock !== undefined && product.stock < 10 && (
                  <span className="ml-2 text-red-500 font-normal">Only {product.stock} left</span>
                )}
              </p>
              <div className="inline-flex items-center border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center text-xs font-semibold border-x border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={addToCart}
                className={`flex-1 h-10 text-xs font-semibold rounded-lg transition-all ${
                  isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Added to Bag</span>
                ) : (
                  <span className="flex items-center gap-1.5"><ShoppingBag className="h-3 w-3" /> Add to Bag</span>
                )}
              </Button>
              <Button 
                onClick={() => {
                  if (!isCustomerAuthenticated()) {
                    openAuthModal();
                    return;
                  }
                  addToCart();
                  router.push('/cart'); // Route to cart so they see the 15% referral prompt
                }}
                className="flex-1 h-10 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
              >
                Buy Now
              </Button>
            </div>

            {/* Added to cart success notice with Bonus prompt */}
            {isAdded && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Added to your bag!</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    <strong>Want 15% off?</strong> Buy with others to get your bonus!
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <Link href="/cart">
                      <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-bold tracking-wider">
                        Invite Friends
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Static tip for both buttons */}
            {!isAdded && (
               <p className="text-[10px] text-gray-500 mt-3 font-medium flex items-center gap-1.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                 <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                 Tip: Buy with others to get a 15% bonus on your order!
               </p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-100">
                <Truck className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Free Shipping</p>
                  <p className="text-[10px] text-gray-400">Fast doorstep delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-100">
                <Shield className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Buyer Protection</p>
                  <p className="text-[10px] text-gray-400">Secure payment</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Product Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div id="reviews" className="mt-16 pt-12 border-t border-gray-100 scroll-mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => {
                    const displayRating = averageRating > 0 ? averageRating : (product.id ? 4.7 + (product.id.charCodeAt(0) % 3) * 0.1 : 4.8);
                    return (
                      <Star key={s} className={`h-5 w-5 ${s <= displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    );
                  })}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : (product.id ? (4.7 + (product.id.charCodeAt(0) % 3) * 0.1).toFixed(1) : '4.8')} out of 5
                </span>
                <span className="text-sm text-gray-500">
                  Based on {productReviews.length > 0 ? productReviews.length : (product.reviews && product.reviews > 0 ? product.reviews : (product.id ? Math.floor(18 + (product.id.charCodeAt(0) % 25)) : 24))} ratings
                </span>
              </div>
            </div>
          </div>

          {productReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.map((rev, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                        {rev.customer?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{rev.customer || 'Anonymous Buyer'}</p>
                        <p className="text-xs font-medium text-green-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle className="h-3 w-3" /> Verified Purchase
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{rev.date}</span>
                  </div>
                  
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  
                  {rev.review ? (
                     <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{rev.review}&rdquo;</p>
                  ) : (
                     <p className="text-sm text-gray-400 italic">No written review provided.</p>
                  )}
                  
                  {rev.adminReply && (
                    <div className="mt-3 ml-4 border-l-2 border-black/10 pl-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Seller Reply</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <Star className="h-10 w-10 text-gray-300 mx-auto mb-3" />
               <p className="font-semibold text-gray-700">No reviews yet</p>
               <p className="text-sm text-gray-500 mt-1">Be the first to review this product after purchase!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">You May Also Like</h2>
              <Link href="/products" className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8">
              {relatedProducts.slice(0, 6).map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
