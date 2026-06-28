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

  if (categoryProducts.length === 0) return null;

  return (
    <section id={`category-${category.id}`} className="scroll-mt-48 mb-4">
      {/* Heading block */}
      <div className="mb-6 py-4 px-5 md:py-5 md:px-8 bg-[#722F37] flex flex-col items-start justify-center shadow-md border-l-4 border-[#E6C9A8] rounded-r-2xl">
        <h3 className="text-lg md:text-2xl font-black uppercase text-white mb-1 md:mb-2 tracking-tight">
          {category.name}
        </h3>
        <p className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-widest">
          {category.description}
        </p>
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
