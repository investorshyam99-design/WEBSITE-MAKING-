import { useState, useEffect, useRef } from "react";
import { categories } from "../data/products";

export function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScroll.current) return;

      const navElement = document.getElementById("category-nav");
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight + 20;

      let currentActive = "";

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeCategory]);

  const scrollToCategory = (id: string) => {
    const element = document.getElementById(`category-${id}`);
    const navElement = document.getElementById("category-nav");

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
        behavior: "smooth",
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
    <div
      id="category-nav"
      className="sticky top-[80px] md:top-[96px] z-40 bg-[#EDE3D8] border-b border-[#722F37]/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-5 w-full gap-1 sm:gap-2 p-1 sm:p-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={`nav-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={`w-full py-3 md:py-6 flex flex-col items-center justify-center p-1 md:p-2 text-[9px] min-[400px]:text-[10px] sm:text-xs md:text-sm lg:text-base font-black uppercase text-center transition-all leading-tight rounded-xl shadow-sm border-2 ${
                  isActive
                    ? "bg-[#722F37] text-[#EDE3D8] border-[#722F37]"
                    : "bg-[#EDE3D8] text-[#722F37] border-transparent hover:border-[#722F37] hover:bg-[#EAE0D3] active:scale-95"
                }`}
              >
                <span className="leading-tight">
                  {cat.name.split(/[\s\n]+/).map((word, wIndex) => (
                    <span key={wIndex} className="block">
                      {word}
                    </span>
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
