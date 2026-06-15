import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';
import { useProducts } from '../data/products';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged, User, setPersistence, browserLocalPersistence } from 'firebase/auth';

type CartItem = Product & { 
  quantity: number; 
  selectedSize?: string;
  selectedColor?: string;
  customization?: { name: string; number: string };
};

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }) => void;
  removeFromCart: (productId: string, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }) => void;
  updateQuantity: (productId: string, selectedSize: string | undefined, selectedColor: string | undefined, quantity: number, customization?: { name: string; number: string }) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  user: { email: string; name: string; uid: string } | null;
  isAuthLoading: boolean;
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // Explicitly set persistence to LOCAL to ensure session survives refreshes
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Auth persistence error:", error);
      }

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth State Changed. Current User:", currentUser);
        if (currentUser && (currentUser.email || currentUser.phoneNumber)) {
          const identifier = currentUser.email || currentUser.phoneNumber || '';
          setUser({
            email: identifier,
            name: currentUser.displayName || identifier,
            uid: currentUser.uid,
          });
          
          // Save user into Firestore (don't await to avoid UI blocking)
          const userRef = doc(db, 'users', currentUser.uid);
          setDoc(userRef, {
            email: identifier,
            name: currentUser.displayName || identifier,
            lastLogin: new Date().toISOString()
          }, { merge: true }).catch(e => {
            console.error("Failed to save user record", e);
          });
        } else {
          setUser(null);
        }
        setIsAuthLoading(false);
      });
    };
    
    initAuth();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Visitor Tracking
  useEffect(() => {
    let visitorId = localStorage.getItem('visitor_id');
    const isNewVisitor = !visitorId;
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('visitor_id', visitorId);
    }

    const trackVisitor = async () => {
      try {
        if (!visitorId) return;
        let cumulativeTime = parseInt(localStorage.getItem('cumulative_time_spent') || '0', 10);
        
        const visitorRef = doc(db, 'visitors', visitorId);
        await setDoc(visitorRef, {
          userAgent: navigator.userAgent,
          lastVisit: new Date().toISOString(),
          isNewVisitor: isNewVisitor,
          language: navigator.language || 'Unknown',
          timeSpent: cumulativeTime
        }, { merge: true });
      } catch (e) {
        console.error("Failed to track visitor", e);
      }
    };
    
    // Slight delay to not block main thread on load
    setTimeout(trackVisitor, 1500);

    const interval = setInterval(() => {
       let cumulativeTime = parseInt(localStorage.getItem('cumulative_time_spent') || '0', 10);
       cumulativeTime += 10; // add 10 seconds tracking
       localStorage.setItem('cumulative_time_spent', cumulativeTime.toString());
       trackVisitor(); // update firestore
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const { products, isLoading: isProductsLoading } = useProducts();

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

  // Sync Cart prices with fresh products from Shopify
  useEffect(() => {
    if (isProductsLoading || products.length === 0 || cart.length === 0) return;
    setCart(prev => {
      let changed = false;
      const newCart = prev.map(item => {
        const freshProduct = products.find(p => p.id === item.id);
        if (freshProduct) {
          const customPrice = item.customization ? 199 : 0;
          const freshPrice = freshProduct.price + customPrice;
          if (item.price !== freshPrice) {
            changed = true;
            return { ...item, price: freshPrice };
          }
        }
        return item;
      });
      return changed ? newCart : prev;
    });
  }, [products, isProductsLoading]);

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

  const addToCart = (product: Product, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }) => {
    setCart((prev) => {
      const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
        if (!itemCustom && !targetCustom) return true;
        if (!itemCustom || !targetCustom) return false;
        return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
      };

      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization)
      );
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      let itemImage = product.image;
      if (product.variants && selectedColor) {
         const matchingVariant = product.variants.find(v => v.color === selectedColor && v.image);
         if (matchingVariant && matchingVariant.image) {
             itemImage = matchingVariant.image;
         }
      }
      
      return [...prev, { ...product, image: itemImage, quantity: 1, selectedSize, selectedColor, customization, price: product.price + (customization ? 199 : 0) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize?: string, selectedColor?: string, customization?: { name: string; number: string }) => {
    const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
      if (!itemCustom && !targetCustom) return true;
      if (!itemCustom || !targetCustom) return false;
      return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
    };
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization))));
  };

  const updateQuantity = (productId: string, selectedSize: string | undefined, selectedColor: string | undefined, quantity: number, customization?: { name: string; number: string }) => {
    if (quantity < 1) {
      removeFromCart(productId, selectedSize, selectedColor, customization);
      return;
    }
    const isCustomSame = (itemCustom: { name: string; number: string } | undefined, targetCustom: { name: string; number: string } | undefined) => {
      if (!itemCustom && !targetCustom) return true;
      if (!itemCustom || !targetCustom) return false;
      return itemCustom.name === targetCustom.name && itemCustom.number === targetCustom.number;
    };
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor && isCustomSame(item.customization, customization)
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
      // Ensure persistence is set before login
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      // Use popup for all devices. Redirect flow often loses state or fails in embedded browsers/iframes setup.
      const result = await signInWithPopup(auth, provider);
      console.log("Logged in user:", result.user);
      if (result.user && result.user.email) {
        setUser({
          email: result.user.email,
          name: result.user.displayName || 'User',
          uid: result.user.uid,
        });
        
        const userRef = doc(db, 'users', result.user.uid);
        setDoc(userRef, {
          email: result.user.email,
          name: result.user.displayName || 'User',
          lastLogin: new Date().toISOString()
        }, { merge: true }).catch((e) => {
          console.error("Failed to save user record on first login", e);
        });
      }
      setIsLoginOpen(false);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Not Authorized: Because you are hosting on a custom domain (" + window.location.hostname + "), Google Sign-In is blocked. You must create your own Firebase project, add " + window.location.hostname + " to Authorized Domains, and replace the Firebase config.");
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, do nothing
      } else if (error.code === 'auth/popup-blocked') {
        alert("Popup blocked by your browser! Please allow popups for this site or open in a standard browser (like Chrome or Safari) to log in.");
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
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isLoginOpen,
        setIsLoginOpen,
        user,
        isAuthLoading,
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
