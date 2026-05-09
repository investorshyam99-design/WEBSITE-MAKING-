import { useState } from "react";
import { categories, useProducts, getProductsByCategory } from "../data/products";
import { ProductCard } from "./ProductCard";

export function CategoriesSection() {
  const { products, isLoading } = useProducts();

  return (
    <div id="categories" className="bg-white relative">
      <div className="py-12 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center text-[#F5EFE6]0 py-12">Loading products from Shopify...</div>
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
    const navElement = document.getElementById('category-nav');
    if (element) {
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight;
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
      <div className="mb-6 py-3 px-4 md:py-4 md:px-6 bg-[#1E2A44] flex flex-col items-start justify-center shadow-sm">
        <h3 className="text-base md:text-xl font-black uppercase text-white mb-1 tracking-tight">
          {category.name}
        </h3>
        <p className="text-[10px] md:text-xs font-medium text-white/80 uppercase tracking-wide">
          {category.description}
        </p>
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
            className="text-xs sm:text-sm font-black uppercase inline-flex items-center justify-center px-8 py-3 border-2 border-[#1E2A44] bg-[#1E2A44] text-white hover:bg-[#223A5E] hover:border-[#223A5E] transition-colors tracking-widest shadow-sm rounded-none"
          >
            Load More {category.name}s
          </button>
        </div>
      )}
    </section>
  );
}
