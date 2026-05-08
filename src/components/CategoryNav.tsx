import { categories } from "../data/products";

export function CategoryNav() {
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

  return (
    <div id="category-nav" className="sticky top-[80px] md:top-[96px] z-40 bg-[#EDE3D8] border-b border-[#5A2E0F]/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-5 w-full gap-1 sm:gap-2 p-1">
          {categories.map((cat) => (
            <button
              key={`nav-${cat.id}`}
              onClick={() => scrollToCategory(cat.id)}
              className="w-full aspect-square flex flex-col items-center justify-center p-1 md:p-2 text-[11px] sm:text-sm md:text-base lg:text-xl font-black uppercase text-center text-[#5A2E0F] bg-[#EDE3D8] hover:bg-[#5A2E0F] hover:text-[#EDE3D8] focus:bg-[#5A2E0F] focus:text-[#EDE3D8] transition-colors leading-tight"
            >
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
  );
}
