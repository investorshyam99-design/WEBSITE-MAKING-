import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import React from "react";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[3/4] bg-gray-50 border border-[#EDE3D8] relative flex items-center justify-center overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-[#5A2E0F] text-white text-[8px] font-bold px-1.5 py-0.5 uppercase shadow-sm">
            Top Rated
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight truncate">
            Sizes: 36—44 • {product.category.replace(/-/g, ' ')}
          </p>
          <h3 className="text-xs font-bold uppercase mt-1 text-[#1A1A1A] group-hover:text-[#5A2E0F] transition-colors truncate">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-sm text-[#5A2E0F]">₹{product.price}</span>
            <button className="bg-black text-white p-1.5 rounded-full hover:bg-[#5A2E0F] transition-colors shadow-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
