import { useState } from "react";
import { categories, useProducts, getProductsByCategory } from "../data/products";
import { ProductCard } from "./ProductCard";

export function CategoriesSection() {
  const { products, isLoading } = useProducts();

  return (
    <div id="categories" className="bg-white relative">
      <div className="py-8 space-y-12 md:space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
  const [visibleCount, setVisibleCount] = useState(12);
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
    setVisibleCount(categoryProducts.length);
  };

  const getButtonText = (name: string) => {
    const uppercaseName = name.toUpperCase();
    if (uppercaseName.includes('VERSION')) {
      return uppercaseName.replace('VERSION', 'JERSEYS');
    }
    if (uppercaseName.includes('JERSEY') && !uppercaseName.includes('JERSEYS')) {
      return uppercaseName.replace('JERSEY', 'JERSEYS');
    }
    return uppercaseName;
  };

  if (categoryProducts.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="scroll-mt-48 mb-4">
      {/* Heading block */}
      <div className="mb-6 py-4 px-5 md:py-5 md:px-8 bg-[#F5F1EB] flex flex-col items-start justify-center shadow-sm border-l-4 border-[#14213D] rounded-r-2xl">
        <h3 className="text-lg md:text-2xl font-black uppercase text-[#1A1A1A] mb-1 md:mb-2 tracking-tight">
          {category.name}
        </h3>
        <p className="text-xs md:text-sm font-medium text-[#1A1A1A]/70 uppercase tracking-widest">
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
        <div className="mt-8 mb-4 text-center w-full flex justify-center px-4">
          <button 
            onClick={handleLoadMore}
            className="w-full sm:w-auto min-h-[64px] text-base md:text-lg font-black uppercase inline-flex items-center justify-center px-12 py-5 bg-[#14213D] text-[#FFFFFF] hover:bg-[#1D3557] active:scale-[0.98] hover:-translate-y-1 transition-all duration-300 tracking-[0.15em] shadow-[0_8px_30px_rgba(20,33,61,0.25)] hover:shadow-[0_12px_40px_rgba(20,33,61,0.35)] rounded-full mx-1"
          >
            SHOP ALL {getButtonText(category.name)} &rarr;
          </button>
        </div>
      )}
    </section>
  );
}
