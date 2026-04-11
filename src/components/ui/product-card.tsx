import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/firestore";
import { useSettings } from "@/lib/settings";
import React from "react";
import { isCustomerAuthenticated } from "@/lib/customer-auth";
import { openAuthModal } from "./global-auth-modal";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, productId: string) => void;
  variant?: 'default' | 'compact';
  promoPrice?: number | null; // discounted price from active promo
}

export function ProductCard({ 
  product, 
  isFavorited = false, 
  onToggleFavorite,
  variant = 'default',
  promoPrice
}: ProductCardProps) {
  const { formatPrice, t } = useSettings();
  const router = useRouter();

  const colorCount = product.colors?.length || 0;
  const optionsCount = (product.colors?.length || 0) + (product.sizes?.length || 0);

  const isCompact = variant === 'compact';
  
  const generateSlug = (name: string, id: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${slug}-${id}`;
  };

  const productUrl = `/products/${generateSlug(product.name, product.id || '')}`;

  const handleProductClick = (e: React.MouseEvent) => {
    if (!isCustomerAuthenticated()) {
      e.preventDefault();
      openAuthModal(productUrl);
    }
  };

  // If promo price exists and is lower, use it
  const displayPrice = promoPrice != null && promoPrice < product.price ? promoPrice : product.price;
  const hasPromo = promoPrice != null && promoPrice < product.price;

  return (
    <Link
      href={productUrl}
      onClick={handleProductClick}
      className={`group flex flex-col h-full bg-white transition-all duration-300 ${isCompact ? 'card-compact' : 'card-modern p-3'}`}
    >
      {/* Image Container */}
      <div
        className={`relative overflow-hidden w-full ${
          isCompact
            ? 'rounded-xl mb-3 aspect-[4/5]'
            : 'rounded-[1.25rem] mb-4 aspect-square sm:aspect-[4/5]'
        } bg-[#F1F5F9] flex items-center justify-center transition-all duration-500`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-200" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-10">
          {hasPromo && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-emerald-600/30">
              PROMO
            </span>
          )}
          {product.badge && !hasPromo && (
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg ${
              product.badge === 'Sale' ? 'bg-red-600 text-white shadow-red-600/30' : 
              product.badge === 'New' ? 'bg-black text-white shadow-black/30' : 'bg-gray-900 text-white shadow-gray-900/30'
            }`}>
              {t(product.badge)}
            </span>
          )}
          {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30 animate-pulse">
              Only {product.stock} Left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-gray-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-gray-600/30">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              onToggleFavorite(e, product.id as string);
            }}
            className={`absolute top-3 sm:top-4 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-10 md:opacity-0 md:translate-y-[-4px] md:group-hover:opacity-100 md:group-hover:translate-y-0 ${
              isFavorited ? 'opacity-100 !translate-y-0 ring-2' : 'hover:scale-110 hover:bg-white'
            }`}
            style={isFavorited ? { background: 'var(--brand-primary-50)', borderColor: 'var(--brand-primary)', '--tw-ring-color': 'rgba(14,165,233,0.3)' } as any : {}}
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-all duration-300 ${
                isFavorited ? 'scale-110' : 'text-gray-500 hover:text-gray-900'
              }`}
              style={isFavorited ? { fill: 'var(--brand-primary)', color: 'var(--brand-primary)' } : {}}
            />
          </button>
        )}

        {/* Quick View / Color count pill */}
        {colorCount > 1 && !isCompact && (
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-end z-10 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-800 shadow-lg">
              +{colorCount} Colors
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={`flex flex-col flex-grow ${isCompact ? 'px-2 pb-2' : 'px-2 pb-2'}`}>
        {/* Product name */}
        <h3 className={`text-[var(--brand-dark)] line-clamp-2 font-bold leading-snug group-hover:text-[var(--brand-primary)] transition-colors duration-300 ${
          isCompact ? 'text-[12px] sm:text-[13px] mb-1.5' : 'text-[14px] sm:text-[16px] mb-2'
        }`}>
          {product.name}
        </h3>

        {/* Price */}
        <div className={`flex items-center flex-wrap gap-2 ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
          <span className={`font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-base sm:text-lg'}`}>
            {formatPrice(displayPrice)}
          </span>
          {hasPromo ? (
            <>
              <span className="text-xs sm:text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                -{Math.round(((product.price - displayPrice) / product.price) * 100)}%
              </span>
            </>
          ) : (
            <>
              {(() => {
                // Only show discount if originalPrice is explicitly higher OR for 30% of products (Clearance)
                const isClearance = product.id ? product.id.charCodeAt(0) % 3 === 0 : false;
                const hasExplicitOriginal = product.originalPrice && product.originalPrice > product.price;
                
                 if (hasExplicitOriginal || isClearance) {
                   const rawOriginal = hasExplicitOriginal 
                     ? product.originalPrice 
                     : product.price * (1.2 + (isClearance ? 0.15 : 0));
                   
                   const originalPrice = rawOriginal as number;
                   const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                   
                   return (
                     <>
                       <span className="text-xs sm:text-sm text-gray-400 line-through">
                         {formatPrice(originalPrice)}
                       </span>
                      <span className="text-[9px] sm:text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tight">
                        {isClearance && !hasExplicitOriginal ? 'Clearance' : 'Offer'}
                      </span>
                    </>
                  );
                }
                return null;
              })()}
            </>
          )}
        </div>

        {/* Rating & Options */}
        <div className={`flex items-center justify-between mt-auto ${isCompact ? 'pt-1' : 'pt-1.5'}`}>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = product.rating && Number(product.rating) > 0 
                  ? Number(product.rating)
                  : (4.7 + (product.id ? (product.id.charCodeAt(0) % 3) * 0.1 : 0.1));
                return (
                  <Star 
                    key={i}
                    className={`${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${
                      i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                );
              })}
            </div>
            <span className={`font-semibold text-gray-500 ${isCompact ? 'text-[10px]' : 'text-[11px] sm:text-xs'}`}>
              ({product.reviews && product.reviews > 0 
                ? product.reviews 
                : (product.id ? Math.floor(18 + (product.id.charCodeAt(0) % 25)) : 24)})
            </span>
          </div>
          
          {optionsCount > 1 && !isCompact && (
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold whitespace-nowrap bg-gray-100 px-2 py-1 rounded-full">
              {optionsCount} COLORS
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
