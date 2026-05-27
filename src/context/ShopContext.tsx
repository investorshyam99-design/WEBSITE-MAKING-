import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { auth } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

type CartItem = Product & { 
  quantity: number; 
  selectedSize?: string;
  customization?: { name: string; number: string };
};

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, selectedSize?: string, customization?: { name: string; number: string }) => void;
  removeFromCart: (productId: string, selectedSize?: string, customization?: { name: string; number: string }) => void;
  updateQuantity: (productId: string, selectedSize: string | undefined, quantity: number, customization?: { name: string; number: string }) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  user: { email: string; name: string; uid: string } | null;
  loginWithGoogle: () => void;
  logout: () => void;
  clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; uid: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser({
          email: currentUser.email,
          name: currentUser.displayName || 'User',
          uid: currentUser.uid,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error('Failed to load from local storage', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const clearCart = () => setCart([]);

  const addToCart = (product: Product, selectedSize?: string, customization?: { name: string; number: string }) => {
    setCart((prev) => {
      const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
        if (!itemCustom && !targetCustom) return true;
        if (!itemCustom || !targetCustom) return false;
        return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
      };

      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize && isCustomSame(item.customization, customization)
      );
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize && isCustomSame(item.customization, customization)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize, customization, price: product.price + (customization ? 199 : 0) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string, customization?: { name: string; number: string }) => {
    const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
      if (!itemCustom && !targetCustom) return true;
      if (!itemCustom || !targetCustom) return false;
      return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
    };
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === selectedSize && isCustomSame(item.customization, customization))));
  };

  const updateQuantity = (productId: string, selectedSize: string | undefined, quantity: number, customization?: { name: string; number: string }) => {
    if (quantity < 1) {
      removeFromCart(productId, selectedSize, customization);
      return;
    }
    const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
      if (!itemCustom && !targetCustom) return true;
      if (!itemCustom || !targetCustom) return false;
      return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
    };
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize && isCustomSame(item.customization, customization)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsLoginOpen(false);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain not authorized for Google Sign-In. You must add 'jerseyunicorn.com' to Firebase Console > Authentication > Settings > Authorized domains.");
      } else {
        alert("Failed to sign in (Error: " + error.code + "). " + (error.message || "Please try again."));
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isLoginOpen,
        setIsLoginOpen,
        user,
        loginWithGoogle,
        logout,
        clearCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
