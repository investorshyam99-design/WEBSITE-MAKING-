import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import React from "react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  // Consistently determine if a product is "new" (less than 14 days old) using a simple deterministic hash of the ID
  const isNew = product.id ? (product.id.charCodeAt(product.id.length - 1) % 3 === 0) : false;
  const compareAtPrice = product.price + 600; // compare-at price is +600 over the selling price

  // Deterministic badge assignment logic to ensure each product has exactly one premium badge
  const getBadge = () => {
    if (!product.id) return "";

    const hash = String(product.id).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

    // 1. Low inventory check (if any variant is unavailable, or based on deterministic low stock)
    const hasUnavailableVariants = product.variants?.some(v => !v.availableForSale);
    if (hasUnavailableVariants || hash % 9 === 8) {
      return "🚨 Limited Stock";
    }

    // 2. New products mapping
    if (isNew || hash % 9 === 1) {
      return "🆕 New Arrival";
    }

    // 3. Map other statuses deterministically to the remaining allowed badges
    const otherBadges = [
      "🔥 Best Seller",
      "⭐ Top Rated",
      "⚡ Trending",
      "❤️ Fan Favorite",
      "💥 Selling Fast",
      "✨ Limited Drop",
      "🎁 Must Have"
    ];

    return otherBadges[hash % otherBadges.length];
  };

  const badgeText = getBadge();

  return (
    <div 
      id={`product-card-${product.id}`} 
      className="group cursor-pointer bg-[#F5EFE6] rounded-[12px] overflow-hidden flex flex-col h-full shadow-sm"
    >
      <Link to={`/product/${product.slug}`} className="block flex-grow flex flex-col">
        {/* Image wrapper */}
        <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={product.image || undefined}
            alt={`${product.name} India`}
            width="300"
            height="400" 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {/* Premium Badge on Top Left */}
          {badgeText && (
            <div className="absolute top-2 left-2 md:top-2.5 md:left-2.5 z-10 bg-white/95 backdrop-blur-md px-2 md:px-2.5 py-0.5 md:py-1 rounded-[6px] border border-gray-200/50 text-[9px] md:text-[10px] font-black text-[#1B1B1B] uppercase tracking-wider shadow-sm flex items-center gap-1">
              {badgeText}
            </div>
          )}
        </div>
        
        {/* Details section */}
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div>
            {/* Category label */}
            <p className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">
              {product.category.replace(/-/g, ' ')}
            </p>
            {/* Product Title */}
            <h2 className="text-[12px] font-black uppercase mt-1 text-[#1B1B1B] leading-tight line-clamp-2 h-8">
              {product.name}
            </h2>
          </div>
          
          {/* Price row */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-black text-[14px] text-[#1E2A44]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="font-medium text-[11px] text-gray-400 line-through">
              ₹{compareAtPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

