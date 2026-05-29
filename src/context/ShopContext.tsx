import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
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
    // Handle redirect result for mobile logins silently
    getRedirectResult(auth).then((result) => {
      if (result) {
        setIsLoginOpen(false);
      }
    }).catch((error) => {
      console.error("Redirect sign-in error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Not Authorized: Because you are hosting on a custom domain (" + window.location.hostname + "), Google Sign-In is blocked. You must create your own Firebase project, add " + window.location.hostname + " to Authorized Domains, and replace the Firebase config.");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser({
          email: currentUser.email,
          name: currentUser.displayName || 'User',
          uid: currentUser.uid,
        });
        
        // Save user into Firestore users collection for admins to see
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName || 'User',
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.error("Failed to save user record", e);
        }
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

  // Save to LocalStorage and Sync Abandoned Carts to Firestore
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    async function syncAbandonedCarts() {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid), where('status', '==', 'pending_cart'));
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'orders', d.id)));
        await Promise.all(deletePromises);

        if (cart.length > 0) {
           const addPromises = cart.map((item, index) => {
              const orderId = `cart_${user.uid}_${Date.now()}_${index}`;
              return setDoc(doc(db, 'orders', orderId), {
                 userId: user.uid,
                 productName: `${item.quantity}x ${item.name}`,
                 image: item.image,
                 size: item.selectedSize || 'N/A',
                 customization: item.customization ? `${item.customization.name} (${item.customization.number})` : null,
                 price: item.price * item.quantity,
                 status: 'pending_cart',
                 createdAt: new Date(),
                 fullName: user.name
              });
           });
           await Promise.all(addPromises);
        }
      } catch (e) {
        console.error("Failed to sync abandoned cart", e);
      }
    }
    syncAbandonedCarts();
  }, [cart, user]);

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
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use redirect on mobile to avoid popup blockers in in-app browsers like FB/Insta
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        setIsLoginOpen(false);
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Not Authorized: Because you are hosting on a custom domain (" + window.location.hostname + "), Google Sign-In is blocked. You must create your own Firebase project, add " + window.location.hostname + " to Authorized Domains, and replace the Firebase config.");
      } else if (error.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup is blocked on desktop
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing
      } else {
        alert("Failed to sign in. Please try again. (" + error.code + ")");
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
