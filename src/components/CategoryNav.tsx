import { useState, useEffect, useRef } from "react";
import { categories } from "../data/products";

export function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScroll.current) return;
      
      const navElement = document.getElementById('category-nav');
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight + 20;

      let currentActive = '';
      
      for (const cat of categories) {
        const element = document.getElementById(`category-${cat.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset + 100) {
            currentActive = cat.id;
          }
        }
      }

      if (currentActive !== activeCategory) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeCategory]);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    const navElement = document.getElementById('category-nav');
    
    if (element) {
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight;
      
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      
      isManualScroll.current = true;
      setActiveCategory(id);
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
      
      // Re-enable scroll listener after animation finishes (~800ms)
      scrollTimeout.current = window.setTimeout(() => {
        isManualScroll.current = false;
      }, 800);
    }
  };

  return (
    <div id="category-nav" className="sticky top-[80px] md:top-[96px] z-40 bg-[#EDE3D8] border-b border-[#1E2A44]/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-5 w-full gap-1 sm:gap-2 p-1" style={{ height: "190.08px" }}>
          {categories.map((cat, index) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={`nav-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                style={index === 0 ? { width: "182.075px" } : undefined}
                className={`w-full aspect-square flex flex-col items-center justify-center p-1 md:p-2 text-[11px] sm:text-sm md:text-base lg:text-xl font-black uppercase text-center transition-colors leading-tight ${
                  isActive 
                    ? "bg-[#1E2A44] text-[#EDE3D8]" 
                    : "text-[#1E2A44] bg-[#EDE3D8] hover:bg-[#1E2A44] hover:text-[#EDE3D8]"
                }`}
              >
                <span className="leading-tight">
                  {cat.name.split(' ').map((word, wIndex) => (
                    <span key={wIndex} className="block">{word}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}