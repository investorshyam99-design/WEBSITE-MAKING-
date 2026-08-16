import {
  ShoppingCart,
  Menu,
  Search,
  MessageCircle,
  X,
  Home,
  Phone,
  Users,
  MessageSquare,
  LogIn,
  LogOut,
  Heart,
  FileText,
  ChevronDown,
  Shirt,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { PoliciesModal } from "./PoliciesModal";
import { useShop } from "../context/ShopContext";

export function Header() {
  const navigate = useNavigate();
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const { setIsLoginOpen, logout, user, isAuthLoading, setIsCartOpen, cart, isSearchOpen, setIsSearchOpen } =
    useShop();

  // Calculate total cart items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setInitialSearchQuery("");
        }}
        initialQuery={initialSearchQuery}
      />
      <PoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
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
              <Link
                to="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <Truck className="h-5 w-5" /> Track Order
              </Link>
              {!isAuthLoading && !user ? (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1E2A44] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                >
                  <LogIn className="h-5 w-5" /> Register/Login
                </button>
              ) : !isAuthLoading && user ? (
                <div className="mt-2 py-2 border-t border-gray-100">
                  <div className="px-6 py-2 text-sm font-semibold text-gray-400">
                    {user.email}
                  </div>
                  {user.email === "investorshyam99@gmail.com" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1E2A44] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                    >
                      <ShieldAlert className="h-5 w-5" /> Admin Panel
                    </Link>
                  )}
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
              ) : (
                <div className="flex items-center gap-3 px-6 py-4 text-base font-bold text-gray-400 uppercase w-full text-left">
                  Loading account...
                </div>
              )}
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1E2A44] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left border-t border-gray-100"
              >
                <FileText className="h-5 w-5" /> My Orders
              </Link>

              

              <a
                href="https://chat.whatsapp.com/IsSp5rdtYC5H9CjhLXbga2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-green-800 hover:bg-[#F5EFE6] transition-colors w-full text-left border-t border-gray-100"
              >
                <Users className="h-5 w-5 text-green-600" /> 👥 WhatsApp Community
              </a>
            </div>

            <div className="mt-auto p-6 bg-[#F5EFE6]">
              <div className="flex justify-center items-center gap-2 text-xs font-bold text-[#F5EFE6]0 uppercase">
                <img
                  src="https://i.imgur.com/ZrEPSNI.jpeg"
                  alt="Logo"
                  className="w-[35px] h-[35px] rounded-full opacity-50 grayscale object-cover"
                />
                Jersey Unicorn
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#1E2A44] text-white py-1.5 text-[10px] md:text-xs font-semibold tracking-wide uppercase relative flex items-center overflow-hidden h-7">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(30)].map((_, i) => (
            <span key={i} className="flex items-center mx-4">
               🚚 Free Delivery <span className="mx-2 text-gray-400">&bull;</span> 💳 COD Available <span className="mx-2 text-gray-400">&bull;</span> 🔄 Easy Exchange <span className="mx-4 text-gray-400">&bull;</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sticky Header */}
      <header className="bg-white border-b border-[#EDE3D8] px-4 md:px-8 h-[80px] md:h-[96px] flex flex-col justify-center sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-black tracking-tighter text-[#1E2A44] flex items-center gap-3"
            >
              <img
                src="https://i.imgur.com/ZrEPSNI.jpeg"
                alt="Jersey Unicorn Logo"
                className="w-[53px] h-[53px] md:w-[70px] md:h-[70px] rounded-full object-cover"
              />
              JERSEY UNICORN
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link
              to="/"
              className="text-[#1E2A44] font-bold border-b-2 border-[#1E2A44]"
            >
              Home
            </Link>
            
            <Link to="/collection/all" className="hover:text-[#1E2A44] transition-colors cursor-pointer">Shop</Link>
            <Link to="/collection/player-version" className="hover:text-[#1E2A44] transition-colors cursor-pointer">Player Version</Link>
            <Link to="/collection/tees" className="hover:text-[#1E2A44] transition-colors cursor-pointer">Tees</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/account"
              className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
            >
              My Orders
            </Link>
            {!isAuthLoading && !user ? (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
              >
                <LogIn className="h-4 w-4" /> Login
              </button>
            ) : !isAuthLoading && user ? (
              <div className="hidden md:flex items-center gap-4">
                {user.email === "investorshyam99@gmail.com" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors"
                  title={`Logged in as ${user.email}`}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 cursor-wait">
                Loading...
              </div>
            )}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-[#1B1B1B] hover:text-[#1E2A44] transition-colors"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[#1B1B1B] hover:text-[#1E2A44] transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
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
