import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, LayoutGrid, User, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { cn } from "../lib/utils";

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    user,
    isSearchOpen,
    setIsSearchOpen,
    isLoginOpen,
    setIsLoginOpen,
    isCartOpen,
    setIsCartOpen,
  } = useShop();

  // Calculate live cart item count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Active route / modal checks
  const isHomeActive =
    location.pathname === "/" &&
    !isSearchOpen &&
    !isLoginOpen &&
    !isCartOpen &&
    !location.hash.includes("categories");

  const isCollectionsActive =
    location.pathname === "/" &&
    location.hash.includes("categories") &&
    !isSearchOpen &&
    !isLoginOpen &&
    !isCartOpen;
    
  const isAccountActive = location.pathname === "/account" || isLoginOpen;

  const handleHomeClick = () => {
    // Close any open modals first
    setIsSearchOpen(false);
    setIsLoginOpen(false);
    setIsCartOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearchClick = () => {
    setIsLoginOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(!isSearchOpen);
  };

  const handleCollectionsClick = () => {
    setIsSearchOpen(false);
    setIsLoginOpen(false);
    setIsCartOpen(false);

    if (location.pathname !== "/") {
      navigate("/#categories");
      setTimeout(() => {
        const el = document.getElementById("categories");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      navigate("/#categories");
      const el = document.getElementById("categories");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAccountClick = () => {
    setIsSearchOpen(false);
    setIsCartOpen(false);
    if (user) {
      setIsLoginOpen(false);
      navigate("/account");
    } else {
      setIsLoginOpen(!isLoginOpen);
    }
  };

  const handleCartClick = () => {
    setIsSearchOpen(false);
    setIsLoginOpen(false);
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-[#EDE3D8] z-[200] md:hidden flex items-center justify-around px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {/* 1. Home */}
      <button
        onClick={handleHomeClick}
        className="flex flex-col items-center justify-center w-14 h-full relative"
      >
        <Home
          className={cn(
            "w-[22px] h-[22px] transition-all",
            isHomeActive
              ? "text-[#1E2A44] fill-[#1E2A44]"
              : "text-[#aaaaaa]"
          )}
        />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
            isHomeActive ? "text-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        >
          Home
        </span>
      </button>

      {/* 2. Search */}
      <button
        onClick={handleSearchClick}
        className="flex flex-col items-center justify-center w-14 h-full relative"
      >
        <Search
          className={cn(
            "w-[22px] h-[22px] transition-all",
            isSearchOpen ? "text-[#1E2A44] stroke-[2.5]" : "text-[#aaaaaa]"
          )}
        />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
            isSearchOpen ? "text-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        >
          Search
        </span>
      </button>

      {/* 3. Collections */}
      <button
        onClick={handleCollectionsClick}
        className="flex flex-col items-center justify-center w-14 h-full relative"
      >
        <LayoutGrid
          className={cn(
            "w-[22px] h-[22px] transition-all",
            isCollectionsActive ? "text-[#1E2A44] fill-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
            isCollectionsActive ? "text-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        >
          Catalog
        </span>
      </button>

      {/* 4. Account */}
      <button
        onClick={handleAccountClick}
        className="flex flex-col items-center justify-center w-14 h-full relative"
      >
        <User
          className={cn(
            "w-[22px] h-[22px] transition-all",
            isAccountActive ? "text-[#1E2A44] fill-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        />
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
            isAccountActive ? "text-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        >
          Account
        </span>
      </button>

      {/* 5. Cart */}
      <button
        onClick={handleCartClick}
        className="flex flex-col items-center justify-center w-14 h-full relative"
      >
        <div className="relative">
          <ShoppingBag
            className={cn(
              "w-[22px] h-[22px] transition-all",
              isCartOpen ? "text-[#1E2A44] fill-[#1E2A44]" : "text-[#aaaaaa]"
            )}
          />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#e83e44] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
              {cartItemCount}
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-wider mt-1 transition-colors",
            isCartOpen ? "text-[#1E2A44]" : "text-[#aaaaaa]"
          )}
        >
          Cart
        </span>
      </button>
    </div>
  );
}
