import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../data/products";
import React from "react";
import { useShop } from "../context/ShopContext";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[3/4] bg-[#F5EFE6] relative flex items-center justify-center overflow-hidden rounded-xl">
          <img 
            src={product.image || undefined} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-[#e83e44] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-sm z-10">
            -50%
          </div>
        </div>
        <div className="mt-3 px-1">
          <p className="text-[10px] text-gray-400 capitalize font-medium tracking-tight truncate">
            {product.category.replace(/-/g, ' ')}
          </p>
          <h3 className="text-sm font-semibold mt-0.5 text-[#1B1B1B] group-hover:text-[#722F37] transition-colors truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold text-base text-[#1B1B1B]">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="font-medium text-sm text-gray-400 line-through">₹{(product.price * 2).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

