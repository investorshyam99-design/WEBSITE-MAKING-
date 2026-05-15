import { ShoppingCart, Menu, Search, Instagram, MessageCircle, X, Home, Phone, Users, MessageSquare, LogIn, LogOut, Heart, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { PoliciesModal } from "./PoliciesModal";
import { useShop } from "../context/ShopContext";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const { loginWithGoogle, logout, user } = useShop();

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#EDE3D8] flex items-center justify-between bg-[#F5EFE6]">
              <span className="font-black text-lg text-[#1E2A44]">MENU</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#1B1B1B] hover:text-[#1E2A44] hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex flex-col py-4 overflow-y-auto">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <Home className="h-5 w-5" /> Home
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.hash !== '#/') {
                    window.location.hash = '#/';
                  }
                  setTimeout(() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase w-full text-left"
              >
                <Phone className="h-5 w-5" /> Contact Us
              </button>
              <a 
                href="https://chat.whatsapp.com/K2t3JO050Z6GJ662AReKUv"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#25D366] hover:bg-[#F5EFE6] border-b border-gray-100 transition-colors uppercase"
              >
                <Users className="h-5 w-5" /> Join WhatsApp Group
              </a>
              <a 
                href="https://www.instagram.com/jerseyunicorn1?igsh=MXRuN3VwcWtoNzlzdg==" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#E1306C] hover:bg-[#F5EFE6] border-b border-gray-100 transition-colors uppercase"
              >
                <Instagram className="h-5 w-5" /> Join Instagram
              </a>
              <a 
                href="https://wa.me/918788965436"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <MessageSquare className="h-5 w-5" /> Chat with Us
              </a>
              <button 
                onClick={() => {
                  setIsPoliciesOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1E2A44] hover:bg-[#F5EFE6] border-b border-gray-100 transition-colors uppercase w-full text-left"
              >
                <FileText className="h-5 w-5" /> Our Policies
              </button>
              
              {!user ? (
                <button 
                  onClick={() => {
                    loginWithGoogle();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] transition-colors uppercase w-full text-left"
                >
                  <LogIn className="h-5 w-5" /> Register/Login
                </button>
              ) : (
                <div className="mt-2 border-t border-gray-100">
                  <div className="px-6 py-4 text-sm font-semibold text-[#F5EFE6]0">{user.email}</div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-6 py-4 text-base font-bold text-red-600 hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-auto p-6 bg-[#F5EFE6]">
              <div className="flex justify-center items-center gap-2 text-xs font-bold text-[#F5EFE6]0 uppercase">
                <img src="https://i.imgur.com/VaSs3Xd.png" alt="Logo" className="w-[35px] h-[35px] rounded-full opacity-50 grayscale object-cover" />
                Jersey Unicorn
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#1E2A44] text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-semibold tracking-wide uppercase relative flex items-center justify-center">
        <span>⚽ Premium Jerseys | Fast Dispatch</span>
        <div className="absolute right-4 md:right-8 flex items-center gap-4">
          <a 
            href="https://www.instagram.com/jerseyunicorn1?igsh=MXRuN3VwcWtoNzlzdg==" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 hover:text-[#EDE3D8] transition-colors"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Follow Us</span>
          </a>
          <a
            href="https://chat.whatsapp.com/K2t3JO050Z6GJ662AReKUv"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#EDE3D8] transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Join Group</span>
          </a>
        </div>
      </div>
      
      {/* Sticky Header */}
      <header className="bg-white border-b border-[#EDE3D8] px-4 md:px-8 h-[80px] md:h-[96px] flex flex-col justify-center sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-8">
            <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter text-[#1E2A44] flex items-center gap-3">
              <img src="https://i.imgur.com/VaSs3Xd.png" alt="Jersey Unicorn Logo" className="w-[53px] h-[53px] md:w-[70px] md:h-[70px] rounded-full object-cover" />
              JERSEY UNICORN
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link to="/" className="text-[#1E2A44] font-bold border-b-2 border-[#1E2A44]">Home</Link>
            <button onClick={() => {
              if (window.location.hash !== '#/') window.location.hash = '#/';
              setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} className="hover:text-[#1E2A44] transition-colors cursor-pointer">Shop</button>
            <button onClick={() => {
              if (window.location.hash !== '#/') window.location.hash = '#/';
              setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} className="hover:text-[#1E2A44] transition-colors cursor-pointer">Categories</button>
            <button onClick={() => {
              if (window.location.hash !== '#/') window.location.hash = '#/';
              setTimeout(() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} className="hover:text-[#1E2A44] transition-colors cursor-pointer">Contact</button>
            <a href="https://www.instagram.com/jerseyunicorn1?igsh=MXRuN3VwcWtoNzlzdg==" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E2A44] transition-colors">Instagram</a>
          </nav>

          <div className="flex items-center gap-4">
            {!user ? (
               <button 
                 onClick={loginWithGoogle}
                 className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
               >
                 <LogIn className="h-4 w-4" /> Login
               </button>
            ) : (
               <button 
                 onClick={logout}
                 className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors"
                 title={`Logged in as ${user.email}`}
               >
                 <LogOut className="h-4 w-4" /> Logout
               </button>
            )}

            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <button 
              className="md:hidden text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
