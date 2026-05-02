import { categories, getProductsByCategory } from "../data/products";
import { ProductCard } from "./ProductCard";

export function CategoriesSection() {
  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    const offset = 130; // Handle sticky header + subnav
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div id="categories" className="bg-white pt-8 relative">
      {/* Sticky Horizontal Anchor Navigation */}
      <div className="sticky top-[64px] md:top-[72px] z-40 bg-white/95 backdrop-blur-md border-y border-[#EDE3D8] shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 overflow-x-auto scrollbar-hide w-full divide-x divide-[#EDE3D8]">
            {categories.map((cat, index) => (
              <button
                key={`nav-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className="py-4 px-2 text-[10px] md:text-sm lg:text-base font-black uppercase text-center text-gray-500 hover:text-[#5A2E0F] hover:bg-[#fbfbfb] transition-all flex flex-col items-center justify-center gap-1 group"
              >
                <span className="bg-[#EDE3D8] text-[#5A2E0F] px-2 py-0.5 rounded text-[10px] group-hover:bg-[#5A2E0F] group-hover:text-white transition-colors mb-1">
                  0{index + 1}
                </span>
                <span className="leading-tight">
                  {cat.name.split(' ').map((word, wIndex) => (
                    <span key={wIndex} className="block">{word}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.id);
          
          return (
            <section id={`category-${category.id}`} key={category.id} className="scroll-mt-48">
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
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button className="text-[10px] font-bold uppercase border-b-2 border-transparent hover:border-[#5A2E0F] text-[#1A1A1A] hover:text-[#5A2E0F] transition-all">
                  Load More {category.name}s
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
