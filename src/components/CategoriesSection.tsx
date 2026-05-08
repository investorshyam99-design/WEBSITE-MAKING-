import { useState } from "react";
import { categories, useProducts, getProductsByCategory } from "../data/products";
import { ProductCard } from "./ProductCard";

export function CategoriesSection() {
  const { products, isLoading } = useProducts();

  return (
    <div id="categories" className="bg-white relative">
      <div className="py-12 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center text-gray-500 py-12">Loading products from Shopify...</div>
        )}
        {!isLoading && categories.map((category) => (
          <CategoryBlock key={category.id} category={category} products={products} />
        ))}
      </div>
    </div>
  );
}

function CategoryBlock({ category, products }: { category: any, products: any[], key?: string | number }) {
  const [visibleCount, setVisibleCount] = useState(8);
  const categoryProducts = getProductsByCategory(category.id, products);
  
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    const offset = 130;
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  if (categoryProducts.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="scroll-mt-48">
      {/* Heading block */}
      <div className="mb-8 p-6 bg-[#f5f5f5] border border-[#EDE3D8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#5A2E0F]"></div>
        <div>
          <h3 className="text-lg md:text-2xl font-black uppercase text-[#1A1A1A] mb-2 tracking-tight">
            {category.name}
          </h3>
          <p className="text-xs md:text-sm font-medium text-[#5A2E0F]/80 uppercase tracking-wide">
            {category.description}
          </p>
        </div>
        <button 
          onClick={() => scrollToCategory(category.id)}
          className="text-[10px] font-bold uppercase border-b border-[#1A1A1A] hover:text-[#5A2E0F] hover:border-[#5A2E0F] transition-colors whitespace-nowrap"
        >
          Back to Top ↑
        </button>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categoryProducts.slice(0, visibleCount).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {visibleCount < categoryProducts.length && (
        <div className="mt-8 text-center">
          <button 
            onClick={handleLoadMore}
            className="text-xs sm:text-sm font-black uppercase inline-flex items-center justify-center px-8 py-3 border-2 border-[#5A2E0F] bg-[#5A2E0F] text-white hover:bg-[#4A260C] hover:border-[#4A260C] transition-colors tracking-widest shadow-sm rounded-none"
          >
            Load More {category.name}s
          </button>
        </div>
      )}
    </section>
  );
}
