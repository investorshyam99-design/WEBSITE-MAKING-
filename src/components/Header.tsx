import {
  ShoppingCart,
  Menu,
  Search,
  Instagram,
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { PoliciesModal } from "./PoliciesModal";
import { useShop } from "../context/ShopContext";

export function Header() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const { setIsLoginOpen, logout, user, isAuthLoading, setIsCartOpen, cart } =
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
              <span className="font-black text-lg text-[#722F37]">MENU</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#1B1B1B] hover:text-[#722F37] hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col py-4 overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#722F37] border-b border-gray-100 transition-colors uppercase"
              >
                <Home className="h-5 w-5" /> Home
              </Link>



              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname !== "/") {
                    navigate("/");
                  }
                  setTimeout(
                    () =>
                      document
                        .getElementById("footer")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    100,
                  );
                }}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#722F37] border-b border-gray-100 transition-colors uppercase w-full text-left"
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
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#722F37] border-b border-gray-100 transition-colors uppercase"
              >
                <MessageSquare className="h-5 w-5" /> Chat with Us
              </a>

              {!isAuthLoading && !user ? (
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#722F37] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
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
                      className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#722F37] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                    >
                      <ShieldAlert className="h-5 w-5" /> Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#722F37] hover:bg-[#F5EFE6] transition-colors uppercase w-full text-left"
                  >
                    <FileText className="h-5 w-5" /> My Orders
                  </Link>
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
            </div>

            <div className="mt-auto p-6 bg-[#F5EFE6]">
              <div className="flex justify-center items-center gap-2 text-xs font-bold text-[#F5EFE6]0 uppercase">
                <img
                  src="https://i.imgur.com/yZBllZJ.jpeg"
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
      <div className="bg-[#722F37] text-white py-1.5 px-4 text-[10px] md:text-xs font-semibold tracking-wide uppercase relative flex items-center overflow-hidden h-7">
        <div className="whitespace-nowrap animate-marquee flex items-center pr-8">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span>FREE DELIVERY</span>
              <span className="mx-8">&bull;</span>
            </div>
          ))}
          {[...Array(20)].map((_, i) => (
            <div key={"second-" + i} className="flex items-center">
              <span>FREE DELIVERY</span>
              <span className="mx-8">&bull;</span>
            </div>
          ))}
        </div>
        <div className="absolute right-4 md:right-8 flex items-center gap-4 bg-[#722F37] pl-4 z-10">
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
            <Link
              to="/"
              className="text-2xl md:text-3xl font-black tracking-tighter text-[#722F37] flex items-center gap-3"
            >
              <img
                src="https://i.imgur.com/yZBllZJ.jpeg"
                alt="Jersey Unicorn Logo"
                className="w-[53px] h-[53px] md:w-[70px] md:h-[70px] rounded-full object-cover"
              />
              JERSEY UNICORN
            </Link>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium uppercase tracking-wider">
            <Link
              to="/"
              className="text-[#722F37] font-bold border-b-2 border-[#722F37]"
            >
              Home
            </Link>
            <button
              onClick={() => {
                if (window.location.pathname !== "/") navigate("/");
                setTimeout(
                  () =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  100,
                );
              }}
              className="hover:text-[#722F37] transition-colors cursor-pointer"
            >
              Shop
            </button>
            <button
              onClick={() => {
                if (window.location.pathname !== "/") navigate("/");
                setTimeout(
                  () =>
                    document
                      .getElementById("categories")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  100,
                );
              }}
              className="hover:text-[#722F37] transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => {
                if (window.location.pathname !== "/") navigate("/");
                setTimeout(
                  () =>
                    document
                      .getElementById("footer")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  100,
                );
              }}
              className="hover:text-[#722F37] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <a
              href="https://www.instagram.com/jerseyunicorn1?igsh=MXRuN3VwcWtoNzlzdg=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#722F37] transition-colors"
            >
              Instagram
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {!isAuthLoading && !user ? (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#722F37] transition-colors"
              >
                <LogIn className="h-4 w-4" /> Login
              </button>
            ) : !isAuthLoading && user ? (
              <div className="hidden md:flex items-center gap-4">
                {user.email === "investorshyam99@gmail.com" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#722F37] transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B1B1B] hover:text-[#722F37] transition-colors"
                >
                  Orders
                </Link>
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
              className="text-[#1B1B1B] hover:text-[#722F37] transition-colors"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[#1B1B1B] hover:text-[#722F37] transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              className="md:hidden text-[#1B1B1B] hover:text-[#722F37] transition-colors"
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
