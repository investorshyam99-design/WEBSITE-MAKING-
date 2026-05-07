import { ShoppingCart, Menu, Search, Instagram, MessageCircle, X, Home, Phone, Users, MessageSquare, LogIn, LogOut, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { useShop } from "../context/ShopContext";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, wishlist, setIsCartOpen, setIsWishlistOpen, loginWithGoogle, logout, user } = useShop();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemsCount = wishlist.length;

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
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#EDE3D8] flex items-center justify-between bg-[#f5f5f5]">
              <span className="font-black text-lg text-[#5A2E0F]">MENU</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#1A1A1A] hover:text-[#5A2E0F] hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex flex-col py-4 overflow-y-auto">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1A1A1A] hover:bg-[#f5f5f5] hover:text-[#5A2E0F] border-b border-gray-100 transition-colors uppercase"
              >
                <Home className="h-5 w-5" /> Home
              </Link>
              <a 
                href="#footer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1A1A1A] hover:bg-[#f5f5f5] hover:text-[#5A2E0F] border-b border-gray-100 transition-colors uppercase"
              >
                <Phone className="h-5 w-5" /> Contact Us
              </a>
              <a 
                href="https://chat.whatsapp.com/Jlqr9TdMDIQHmhx2kTOflz"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#25D366] hover:bg-[#f5f5f5] border-b border-gray-100 transition-colors uppercase"
              >
                <Users className="h-5 w-5" /> Join WhatsApp Group
              </a>
              <a 
                href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#E1306C] hover:bg-[#f5f5f5] border-b border-gray-100 transition-colors uppercase"
              >
                <Instagram className="h-5 w-5" /> Join Instagram
              </a>
              <a 
                href="https://wa.me/918788965436"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1A1A1A] hover:bg-[#f5f5f5] hover:text-[#5A2E0F] border-b border-gray-100 transition-colors uppercase"
              >
                <MessageSquare className="h-5 w-5" /> Chat with Us
              </a>
              
              {!user ? (
                <button 
                  onClick={() => {
                    loginWithGoogle();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1A1A1A] hover:bg-[#f5f5f5] hover:text-[#5A2E0F] transition-colors uppercase w-full text-left"
                >
                  <LogIn className="h-5 w-5" /> Register/Login
                </button>
              ) : (
                <div className="mt-2 border-t border-gray-100">
                  <div className="px-6 py-4 text-sm font-semibold text-gray-500">{user.email}</div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-6 py-4 text-base font-bold text-red-600 hover:bg-[#f5f5f5] transition-colors uppercase w-full text-left"
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-auto p-6 bg-[#f5f5f5]">
              <div className="flex justify-center items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                <img src="https://i.imgur.com/Qb89oaI.png" alt="Logo" className="w-8 h-8 opacity-50 grayscale" />
                Jersey Unicorn
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#5A2E0F] text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-semibold tracking-wide uppercase relative flex items-center justify-center">
        <span>⚽ Premium Jerseys | Fast Dispatch</span>
        <div className="absolute right-4 md:right-8 flex items-center gap-4">
          <a 
            href="https://www.instagram.com/jerseyunicorn_?igsh=ejZjdm8yamhnaGZ0" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 hover:text-[#EDE3D8] transition-colors"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Follow Us</span>
          </a>
          <a
            href="https://chat.whatsapp.com/Jlqr9TdMDIQHmhx2kTOflz"
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
            <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter text-[#5A2E0F] flex items-center gap-3">
              <img src="https://i.imgur.com/Qb89oaI.png" alt="Jersey Unicorn Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
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
            {!user ? (
               <button 
                 onClick={loginWithGoogle}
                 className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors"
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
              className="text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <button 
              className="text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors relative hidden md:block"
              onClick={() => setIsWishlistOpen(true)}
            >
              <Heart className="h-5 w-5 md:h-6 md:w-6" />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItemsCount}
                </span>
              )}
            </button>

            <button 
              className="text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5A2E0F] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount > 9 ? "9+" : cartItemsCount}
                </span>
              )}
            </button>
            
            <button 
              className="md:hidden text-[#1A1A1A] hover:text-[#5A2E0F] transition-colors"
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
