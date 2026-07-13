import { useProducts, getProductsByCategory } from "../data/products";
import { ProductCard } from "./ProductCard";
import { Link } from "react-router-dom";

const SECTIONS_CONFIG = [
  {
    id: "football",
    sectionId: "section-football",
    title: "FOOTBALL",
    subtitle: "Football culture. Wear the game.",
    viewAllUrl: "/collections/football"
  },
  {
    id: "formula1",
    sectionId: "section-formula1",
    title: "FORMULA 1",
    subtitle: "Built for those who live for speed.",
    viewAllUrl: "/collections/formula-1"
  },
  {
    id: "anime",
    sectionId: "section-anime",
    title: "ANIME",
    subtitle: "Drip for those who move in silence.",
    viewAllUrl: "/collections/anime"
  },
  {
    id: "artists",
    sectionId: "section-artists",
    title: "ARTISTS",
    subtitle: "Wear your obsession.",
    viewAllUrl: "/collections/artists"
  },
  {
    id: "word-drip",
    sectionId: "section-word-drip",
    title: "WORD DRIP",
    subtitle: "Words hit different on cotton.",
    viewAllUrl: "/collections/word-drip"
  }
];

export function CategoriesSection() {
  const { products, isLoading } = useProducts();

  return (
    <div id="categories" className="bg-white relative">
      <div className="py-8 space-y-12 md:space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="text-center text-gray-500 py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-[#1E2A44] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-sm uppercase tracking-wider">Loading products from Shopify...</p>
          </div>
        )}
        
        {!isLoading && SECTIONS_CONFIG.map((section) => {
          const categoryProducts = getProductsByCategory(section.id, products);
          return (
            <section 
              key={section.id} 
              id={section.sectionId} 
              className="scroll-mt-48 mb-4"
            >
              {/* Header block with navy bg and gold/cream border */}
              <div className="mb-4 py-4 px-5 md:py-5 md:px-8 bg-[#14213D] flex items-center justify-between shadow-md border-l-4 border-[#E6C9A8] rounded-r-2xl">
                <div className="flex flex-col items-start justify-center">
                  <h3 className="text-lg md:text-2xl font-black uppercase text-white tracking-tight leading-none mb-1 md:mb-1.5">
                    {section.title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-medium text-white/60 uppercase tracking-wide">
                    {section.subtitle}
                  </p>
                </div>
                <div>
                  <Link 
                    to={section.viewAllUrl}
                    className="text-white/50 hover:text-white text-xs md:text-sm font-black uppercase tracking-wider transition-colors"
                  >
                    View All &rarr;
                  </Link>
                </div>
              </div>

              {categoryProducts.length > 0 ? (
                /* Product Grid */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] md:gap-[20px]">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                /* Placeholder with Skeletons */
                <div className="space-y-4">
                  <p className="text-xs md:text-sm font-bold text-gray-500 px-1 flex items-center gap-1.5">
                    🔥 Dropping Soon — follow us to be the first to know
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] md:gap-[20px]">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#F5EFE6] rounded-[12px] overflow-hidden flex flex-col h-full border border-gray-200/40 shadow-sm relative">
      <div className="aspect-[3/4] bg-gray-200/80 w-full relative overflow-hidden animate-pulse">
        {/* Shimmer line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      </div>
      <div className="p-3 flex flex-col justify-between flex-grow space-y-2 animate-pulse">
        <div className="space-y-1.5">
          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3.5 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
      </div>
    </div>
  );
}
