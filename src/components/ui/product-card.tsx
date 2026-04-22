"use client"

import Link from "next/link";
import { Heart, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import React from "react";
import { isCustomerAuthenticated } from "@/lib/customer-auth";
import { openAuthModal } from "./global-auth-modal";

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, productId: string) => void;
  promoPrice?: number | null;
}

export function ProductCard({ 
  product, 
  isFavorited = false, 
  onToggleFavorite,
  promoPrice
}: ProductCardProps) {
  const { formatPrice, t } = useSettings();
  
  const generateSlug = (name: string | undefined, id: string | undefined) => {
    if (!name) return id || 'product';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${slug}-${id || ''}`;
  };

  const productUrl = `/products/${generateSlug(product?.name, product?.id)}`;

  const handleProductClick = (e: React.MouseEvent) => {
    if (!isCustomerAuthenticated()) {
      e.preventDefault();
      openAuthModal(productUrl);
    }
  };

  const displayPrice = promoPrice != null && promoPrice < product.price ? promoPrice : product.price;
  const hasPromo = promoPrice != null && promoPrice < product.price;

  return (
    <div className="product-card group">
      <Link href={productUrl} onClick={handleProductClick}>
        <div className="image-container rounded-2xl overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50">
              <ShoppingBag className="w-10 h-10 text-zinc-200" strokeWidth={1} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasPromo && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-3 py-1 rounded-full shadow-sm">
                Sale
              </span>
            )}
            {product.badge && !hasPromo && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur-md text-black px-3 py-1 rounded-full">
                {t(product.badge)}
              </span>
            )}
          </div>

          {/* Quick Add Button — Shows on hover desktop, visible on mobile? */}
          <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <button className="w-full h-12 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
               Quick View <ArrowRight size={14} />
             </button>
          </div>
        </div>

        <div className="pt-6 pb-2">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 line-clamp-1 group-hover:opacity-60 transition-opacity">
              {product.name}
            </h3>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(e, product.id as string);
                }}
                className="text-zinc-300 hover:text-black transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} fill={isFavorited ? "currentColor" : "none"} className={isFavorited ? "text-red-500" : ""} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-black">
              {formatPrice(displayPrice)}
            </span>
            {hasPromo && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-3">
             <div className="flex text-amber-400">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
               ))}
             </div>
             <span className="text-[10px] font-medium text-zinc-400">(48)</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
