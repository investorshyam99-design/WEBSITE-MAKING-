import { useState, useEffect, useRef } from "react";

const NAVIGATION_ITEMS = [
  { id: "football", sectionId: "section-football", name: "FOOTBALL" },
  { id: "formula1", sectionId: "section-formula1", name: "FORMULA 1" },
  { id: "anime", sectionId: "section-anime", name: "ANIME" },
  { id: "artists", sectionId: "section-artists", name: "ARTISTS" },
  { id: "word-drip", sectionId: "section-word-drip", name: "WORD DRIP" }
];

export function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string>("football");
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualScroll.current) return;

      const navElement = document.getElementById("category-nav");
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight + 40;

      let currentActive = "football";

      for (const item of NAVIGATION_ITEMS) {
        const element = document.getElementById(item.sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset + 120) {
            currentActive = item.id;
          }
        }
      }

      if (currentActive !== activeCategory) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially
    setTimeout(handleScroll, 200);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeCategory]);

  const scrollToSection = (id: string, sectionId: string) => {
    const element = document.getElementById(sectionId);
    const navElement = document.getElementById("category-nav");

    if (element) {
      const headerHeight = window.innerWidth >= 768 ? 96 : 80;
      const navHeight = navElement ? navElement.offsetHeight : 0;
      const offset = headerHeight + navHeight - 5;

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
      className="sticky top-[80px] md:top-[96px] z-40 bg-[#EDE3D8] border-b border-[#1E2A44]/10 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-2 py-2.5 w-full">
        <div className="flex items-center gap-1.5 md:gap-3 w-full justify-between">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={`nav-${item.id}`}
                onClick={() => scrollToSection(item.id, item.sectionId)}
                className={`flex-1 aspect-square flex items-center justify-center text-center p-1 md:p-2 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-tighter sm:tracking-wide rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer active:scale-95 leading-[1.1] ${
                  isActive
                    ? "bg-[#1E2A44] text-white border-[#1E2A44] shadow-inner"
                    : "bg-[#EDE3D8] text-[#1E2A44] border-[#1E2A44] hover:bg-[#1E2A44] hover:text-white shadow-[2px_2px_0px_0px_#1E2A44]"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
