"use client"

import { useState, useEffect } from "react";
import { 
  Minus, Plus, ArrowLeft, Truck, Shield, Star, Heart, 
  ShoppingBag, CheckCircle, ChevronDown, ChevronUp, Share2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getProducts, getPromos, Product, Promo } from "@/lib/firestore";
import { trackDetailedProductClick, trackAddToCart, syncCartState } from "@/lib/analytics";
import { useSettings } from "@/lib/settings";
import { ProductCard } from "@/components/ui/product-card";
import { getPromoPrice } from "@/lib/promo-utils";
import { isCustomerAuthenticated } from "@/lib/customer-auth";
import { openAuthModal } from "@/components/ui/global-auth-modal";
import { COLOR_MAP } from "@/lib/colors";
import WhatsAppButton from "@/components/ui/whatsapp-button";

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
  const [promos, setPromos] = useState<Promo[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");

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
      const realId = slugOrId.split('-').pop();
      const foundProduct = products.find(p => p.id === slugOrId || p.id === realId);
      setProduct(foundProduct || null);
      
      if (foundProduct) {
        setSelectedSize(foundProduct.sizes?.[0] || "");
        setSelectedColor(foundProduct.colors?.[0] || "");
        trackDetailedProductClick(foundProduct);
        setRelatedProducts(products.filter(p => p.id !== foundProduct?.id).slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
    setIsLoading(false);
  };

  const promoPriceValue = product ? getPromoPrice(product.id || '', product.price, promos) : null;

  const addToCart = () => {
    if (!isCustomerAuthenticated()) {
      openAuthModal();
      return;
    }
    if (!product) return;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: promoPriceValue || product.price,
      image: product.image,
      quantity,
      size: selectedSize,
      color: selectedColor,
    };

    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = existingCart.findIndex((item: any) =>
      item.id === product.id && item.size === selectedSize && item.color === selectedColor
    );
    if (existingIndex >= 0) existingCart[existingIndex].quantity += quantity;
    else existingCart.push(cartItem);

    localStorage.setItem('cart', JSON.stringify(existingCart));
    localStorage.setItem('cartCount', existingCart.reduce((t: number, i: any) => t + i.quantity, 0).toString());
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setIsAdded(true);
    trackAddToCart();
    syncCartState(existingCart);
    setTimeout(() => setIsAdded(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-black animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-container py-32 text-center">
        <h1 className="text-2xl font-bold mb-8">Product not found</h1>
        <Link href="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const images = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <WhatsAppButton />
      
      <div className="section-container py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-24">
        {/* Left: Gallery */}
        <div className="w-full md:w-3/5">
          <div className="grid grid-cols-1 gap-4">
             {images.map((img, i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-50 relative group">
                   <img src={img} alt={product.name} className="w-full h-full object-cover" />
                   {i === 0 && product.badge && (
                      <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                        {product.badge}
                      </span>
                   )}
                </div>
             ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-2/5 flex flex-col gap-10 md:sticky md:top-32 self-start">
          <div className="animate-fade-up">
             <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 font-outfit">
               <Link href="/products" className="hover:text-black">Shop</Link>
               <span>/</span>
               <span className="text-black italic">{product.name}</span>
             </nav>
             <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
             <div className="flex items-center gap-4 mb-6">
                <div className="flex text-amber-400">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-xs font-medium text-zinc-400 font-outfit">Excellent · 48 Reviews</span>
             </div>
             
             <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{formatPrice(promoPriceValue || product.price)}</span>
                {promoPriceValue && (
                   <span className="text-lg text-zinc-400 line-through">{formatPrice(product.price)}</span>
                )}
             </div>
          </div>

          <div className="flex flex-col gap-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
               <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-400 font-outfit">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                     {product.colors.map(color => (
                        <button 
                           key={color}
                           onClick={() => setSelectedColor(color)}
                           className={`w-12 h-12 rounded-full border-2 transition-all p-1 ${selectedColor === color ? 'border-black' : 'border-transparent hover:border-zinc-200'}`}
                           title={color}
                        >
                           <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || '#eee' }} />
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
               <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-400 font-outfit">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                     {product.sizes.map(size => (
                        <button 
                           key={size}
                           onClick={() => setSelectedSize(size)}
                           className={`h-11 px-6 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'}`}
                        >
                           {size}
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* Quantity */}
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-zinc-400 font-outfit">Quantity</h3>
               <div className="flex items-center gap-4 bg-zinc-100 rounded-full w-fit p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">
                     <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold font-outfit">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all">
                     <Plus size={14} />
                  </button>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
               <button 
                  onClick={addToCart}
                  className={`btn h-16 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${isAdded ? 'bg-green-600 border-green-600 text-white' : 'btn-primary'}`}
               >
                  {isAdded ? <CheckCircle size={20} className="mr-2" /> : <ShoppingBag size={20} className="mr-2" />}
                  {isAdded ? 'Added to Bag' : 'Add to Bag'}
               </button>
               <button className="btn btn-outline h-16 rounded-full text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Heart size={20} /> Add to Wishlist
               </button>
            </div>

            {/* Accordion */}
            <div className="border-t border-zinc-100 pt-8 mt-4 flex flex-col gap-4">
               {[
                 { id: 'details', label: 'Features & Materials', content: product.description || 'Premium craftsmanship with high-quality materials designed for longevity and style.' },
                 { id: 'shipping', label: 'Shipping Info', content: 'Free doorstep delivery in Dar es Salaam. Nationwide shipping available with tracking.' },
                 { id: 'returns', label: 'Returns', content: '14-day hassle-free returns. Simply contact us via WhatsApp for a swap or return.' }
               ].map((item) => (
                  <div key={item.id} className="border-b border-zinc-100 pb-4">
                     <button 
                        onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-widest py-2"
                     >
                        {item.label}
                        {activeAccordion === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                     </button>
                     {activeAccordion === item.id && (
                        <div className="pt-4 animate-fade-up">
                           <p className="text-zinc-500 text-sm leading-relaxed">{item.content}</p>
                        </div>
                     )}
                  </div>
               ))}
            </div>
            
            <div className="flex items-center gap-6 pt-4">
               <div className="flex items-center gap-2 text-zinc-400">
                  <Shield size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
               </div>
               <div className="flex items-center gap-2 text-zinc-400">
                  <Truck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fast Delivery</span>
               </div>
               <button className="ml-auto text-zinc-400 hover:text-black transition-colors">
                  <Share2 size={18} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
         <section className="section-container border-t border-zinc-100 py-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
               <div className="max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">You May Also Like</h2>
                  <p className="text-zinc-500">Pairs perfectly with your new SheDoo bag.</p>
               </div>
               <Link href="/products" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">
                  View Shop 
               </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-x-8 sm:gap-y-16">
               {relatedProducts.map((p) => (
                  <ProductCard 
                     key={p.id} 
                     product={p} 
                  />
               ))}
            </div>
         </section>
      )}
    </div>
  );
}
