"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, Play, ShoppingBag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import { LazyImage } from "@/components/ui/lazy-image";

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

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
    }
  }, [params.id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const products = await getProducts();
      const foundProduct = products.find(p => p.id === productId);
      setProduct(foundProduct || null);
      if (foundProduct) {
        setSelectedSize(foundProduct.sizes?.[0] || "");
        setSelectedColor(foundProduct.colors?.[0] || "");
        setCurrentImageIndex(0);
      }
      setRelatedProducts(products.filter(p => p.id !== productId).slice(0, 6));
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
  };

  // Build the media array: main image first, then additional images
  const productImages: string[] = [];
  if (product?.image) productImages.push(product.image);
  if (product?.images?.length) productImages.push(...product.images);
  if (productImages.length === 0) productImages.push('https://images.unsplash.com/photo-1490481659019-ba6fbc3c2bf5?w=800&h=800&fit=crop');
  const productMedia = product?.video ? [...productImages, product.video] : productImages;

  const addToCart = () => {
    if (!product) return;
    if (product.sizes?.length && !selectedSize) { alert('Please select a size'); return; }
    if (product.colors?.length && !selectedColor) { alert('Please select a color'); return; }

    const selectedMedia = productMedia[currentImageIndex];
    const isVideo = selectedMedia?.includes('video');
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
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
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">Handbags</Link>
          <span>/</span>
          <span className="text-gray-800 line-clamp-1">{product.name}</span>
        </nav>

        {/* Main grid: Image + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 xl:col-span-5">
            {/* Thumbnails + Main image */}
            <div className="flex gap-3">
              {/* Vertical thumbnails on desktop */}
              {productMedia.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-14 shrink-0">
                  {productMedia.map((media, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative aspect-square overflow-hidden border-2 rounded transition-all ${
                        currentImageIndex === idx ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {media.includes('video') ? (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Play className="h-3 w-3 text-gray-500" />
                        </div>
                      ) : (
                        <LazyImage src={media} alt="" className="w-full h-full" aspectRatio="aspect-square" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative">
                <div className="aspect-square bg-gray-50 border border-gray-200 overflow-hidden rounded">
                  {productMedia[currentImageIndex]?.includes('video') ? (
                    <video src={productMedia[currentImageIndex]} controls className="w-full h-full object-cover" preload="metadata" />
                  ) : (
                    <LazyImage src={productMedia[currentImageIndex]} alt={product.name} className="w-full h-full" />
                  )}
                </div>

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-black text-white px-2 py-0.5">
                    {product.badge}
                  </span>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full border flex items-center justify-center bg-white shadow-sm transition-all ${
                    isFavorited ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Mobile thumbnails */}
            {productMedia.length > 1 && (
              <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto">
                {productMedia.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-14 h-14 border-2 rounded overflow-hidden transition-all ${
                      currentImageIndex === idx ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    {media.includes('video') ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Play className="h-3 w-3" /></div>
                    ) : (
                      <LazyImage src={media} alt="" className="w-full h-full" aspectRatio="aspect-square" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Indicator on desktop */}
            {productMedia.length > 1 && (
              <p className="hidden sm:block text-[10px] text-gray-400 mt-2 text-center">
                {t("Select Style")} — {productMedia.length} {t("options")}
              </p>
            )}
          </div>

          {/* RIGHT: Product Details */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-4">

            {/* Category & title */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t(product.category)}</p>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">{product.rating || "4.8"}</span>
              <span className="text-xs text-gray-400">({product.reviews || 120} reviews)</span>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 -mt-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" /> Tax included &nbsp;·&nbsp;
              <Truck className="h-3 w-3 text-blue-500" /> Free shipping
            </p>

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
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                Quantity
                {product.stock !== undefined && product.stock < 10 && (
                  <span className="ml-2 text-red-500 font-normal">Only {product.stock} left</span>
                )}
              </p>
              <div className="inline-flex items-center border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold border-x border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={addToCart}
                className={`flex-1 h-11 text-sm font-semibold rounded transition-all ${
                  isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isAdded ? (
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Added to Bag</span>
                ) : (
                  <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Add to Bag</span>
                )}
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button className="w-full h-11 text-sm font-semibold rounded bg-orange-500 hover:bg-orange-600 text-white">
                  Buy Now
                </Button>
              </Link>
            </div>

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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">You May Also Like</h2>
              <Link href="/products" className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group bg-white border border-gray-200 hover:border-gray-400 transition-colors block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <LazyImage
                      src={p.image || ""}
                      alt={p.name}
                      className="group-hover:scale-105 transition-transform duration-500"
                      aspectRatio="aspect-[3/4]"
                    />
                    {p.badge && (
                      <span className="absolute top-1 left-1 text-[8px] font-bold uppercase bg-black text-white px-1 py-0.5">
                        {t(p.badge)}
                      </span>
                    )}
                  </div>
                  <div className="p-1.5">
                    <h3 className="text-xs text-gray-700 line-clamp-1 mb-1">{p.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">{formatPrice(p.price)}</span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>
                      )}
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
