import React from 'react';
import { useRecentlyViewed } from '../lib/recentlyViewed';
import { useProducts, getProductById } from '../data/products';
import { ProductCard } from './ProductCard';

export function RecentlyViewedSection() {
  const recentIds = useRecentlyViewed();
  const { products } = useProducts();

  if (recentIds.length === 0 || products.length === 0) {
    return null;
  }

  // Map IDs to products, preserving recent order, filter out missing ones
  const recentProducts = recentIds
    .map(id => getProductById(id, products))
    .filter(Boolean)
    .slice(0, 6); // Max 6 on home page

  if (recentProducts.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase text-[#1B1B1B] tracking-tight">
            Recently Viewed
          </h2>
          <div className="h-[1px] flex-grow bg-gray-200 ml-6 hidden md:block"></div>
        </div>
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x pl-4 sm:pl-0 snap-mandatory scrollbar-hide -mx-4 sm:mx-0">
          {recentProducts.map(product => (
            <div key={product!.id} className="w-[140px] md:w-[220px] flex-shrink-0 snap-start">
              <ProductCard product={product!} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
