import { ShoppingCart, Menu, Search, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#5A2E0F] text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-semibold tracking-wide uppercase relative flex items-center justify-center">
        <span>🚚 Prepaid Orders Only | Premium Jerseys | Fast Dispatch</span>
        <a 
          href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute right-4 md:right-8 flex items-center gap-1.5 hover:text-[#EDE3D8] transition-colors"
        >
          <Instagram className="h-3.5 w-3.5" />
          <span className="hidden sm:inline-block">Follow Us</span>
        </a>
      </div>
      
      {/* Sticky Header */}
      <header className="bg-white border-b border-[#EDE3D8] px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-[#5A2E0F] flex items-center gap-2">
              <img src="/logo.png" alt="Jersey Unicorn Logo" className="w-10 h-10 object-contain" />
              JERSEY UNICORN
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link to="/" className="text-[#5A2E0F] font-bold border-b-2 border-[#5A2E0F]">Home</Link>
            <a href="/#categories" className="hover:text-[#5A2E0F] transition-colors">Shop</a>
            <a href="/#categories" className="hover:text-[#5A2E0F] transition-colors">Categories</a>
            <a href="#footer" className="hover:text-[#5A2E0F] transition-colors">Contact</a>
            <a href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" target="_blank" rel="noopener noreferrer" className="hover:text-[#5A2E0F] transition-colors">Instagram</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors">
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button className="text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors relative">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              <span className="absolute -top-1 -right-1 bg-[#5A2E0F] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </button>
            <button className="md:hidden text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
