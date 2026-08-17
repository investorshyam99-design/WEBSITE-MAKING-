import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion, AnimatePresence } from "motion/react";
import {
  useProducts,
  getProductById,
  getProductsByCategory,
  parseSingleShopifyProduct,
  Product
} from "../data/products";
import { fetchShopifyProductByHandle } from "../services/shopify";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TrustSection } from "../components/TrustSection";
import { SEO } from "../components/SEO";
import { addRecentlyViewed } from "../lib/recentlyViewed";
import { RecentlyViewedSection } from "../components/RecentlyViewedSection";
import {
  getProductReviewsInfo,
  ReviewsSection
} from "../components/ReviewsSection";
import { LiveViewerCount } from "../components/LiveViewerCount";
import { DeliveryChecker } from "../components/DeliveryChecker";
import { TrendingSalesIndicator } from "../components/TrendingSalesIndicator";

import { ProductInfoAccordion } from "../components/ProductInfoAccordion";
import { generateProductSEO } from "../lib/productSeoHelper";
import { trackViewContent } from "../lib/pixel";

// Size reservation warning component with 10 minute countdown timer
function SizeReservationWarning({ selectedSize }: { selectedSize: string }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!selectedSize) return;
    // Reset back to 10:00 (600 seconds) when size changes
    setTimeLeft(600);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSize]);

  if (!selectedSize) {
    return (
      <div className="mb-4 px-4 py-3 bg-[#FCF8F2] border border-[#E6C9A8]/40 rounded-xl text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm animate-pulse">
        <span>⚠️ Select a size to reserve your t-shirt (high demand)</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="mb-4 px-4 py-3 bg-[#FCF8F2] border border-amber-500 rounded-xl text-amber-950 text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm">
      <span>⚠️ High demand: Size [{selectedSize}] is reserved for the next <span className="font-black text-amber-600 font-mono text-sm">{formattedTime}</span> minutes.</span>
    </div>
  );
}
import {
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Star,
  CheckCircle2,
  Lock,
  Shirt,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  X,
  Banknote,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useShop } from "../context/ShopContext";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function ProductPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { products } = useProducts(); // still needed for recently viewed, etc
  const { addToCart, setIsCartOpen, isCartOpen } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const activeKey = slug || id || "";
  const decodedKey = useMemo(
    () => (activeKey ? decodeURIComponent(activeKey) : ""),
    [activeKey],
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product independently based on URL
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchProduct = async () => {
      if (!decodedKey) {
        setIsLoading(false);
        return;
      }
      
      // Attempt to fetch from Shopify directly by handle
      try {
        const data = await fetchShopifyProductByHandle(decodedKey);
        if (!isMounted) return;
        
        if (data) {
          const parsed = parseSingleShopifyProduct(data);
          setProduct(parsed);
        } else {
          // Fallback to global store lookup if not found by handle
          // (Shopify handles might differ slightly from our generated slugs in some legacy cases)
          const fallback = getProductById(decodedKey, products);
          if (fallback) {
            setProduct(fallback);
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.error("Error fetching product by handle:", err);
        if (!isMounted) return;
        const fallback = getProductById(decodedKey, products);
        setProduct(fallback || null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [decodedKey, products]);

  const seoDetails = useMemo(() => {
    if (!product) return null;
    return generateProductSEO(product);
  }, [product]);

  // If visited via legacy ID route /product/:id, redirect to custom slug route /product/:slug
  useEffect(() => {
    if (id && product && !isLoading) {
      navigate(`/product/${product.slug}`, { replace: true });
    }
  }, [id, product, isLoading, navigate]);

  useEffect(() => {
    if (product?.id) {
      addRecentlyViewed(product.id);
      trackViewContent(product);
    }
  }, [product?.id]);

  const stats = useMemo(() => {
    if (!product) return { avgRating: "4.9", reviewCount: 120 };
    return getProductReviewsInfo(product);
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const initialColor = searchParams.get("color") || "";
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);

  useEffect(() => {
    if (!selectedColor && product?.variants) {
      const firstColor = product.variants.find(v => v.color)?.color;
      if (firstColor) {
        setSelectedColor(firstColor);
      }
    }
  }, [product, selectedColor]);

  useEffect(() => {
    if (selectedColor) {
      setSearchParams({ color: selectedColor }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedColor, setSearchParams]);

  useEffect(() => {
    if (product && selectedColor) {
      const colorVariant = product.variants?.find(v => v.color === selectedColor && v.image);
      if (colorVariant && colorVariant.image) {
        setActiveImage(colorVariant.image);
      }
    }
  }, [selectedColor, product]);
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const colorsMap = new Map<string, string | undefined>();
    product.variants.forEach(v => {
      if (v.color && !colorsMap.has(v.color)) {
        colorsMap.set(v.color, v.image);
      }
    });
    return Array.from(colorsMap.entries()).map(([color, image]) => ({ color, image }));
  }, [product]);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);

  const variantInventory = useMemo(() => {
    if (!product) return 3;
    const sizePart = selectedSize || 'M';
    const colorPart = selectedColor || '';
    const seed = `${product.name}-${sizePart}-${colorPart}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const qty = (Math.abs(hash) % 5) + 2; // Returns 2, 3, 4, 5, or 6
    return qty;
  }, [product, selectedSize, selectedColor]);

  const [isCustomized, setIsCustomized] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/product/${product.slug}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        showToast("Link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  const shareTelegram = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/product/${product.slug}`;
    const text = `Check out this premium apparel: ${product.name}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, "_blank");
  };

  const shareSnapchat = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/product/${product.slug}`;
    const snapchatUrl = `https://www.snapchat.com/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(snapchatUrl, "_blank");
  };

  const minSwipeDistance = 50;

  useEffect(() => {
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
      setIsScrolledToBottom(isBottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const galleryImages =
    product?.galleryImages || (product ? [product.image] : []);

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = galleryImages.indexOf(activeImage);
      if (currentIndex === -1) return;

      if (isLeftSwipe) {
        const nextIndex = (currentIndex + 1) % galleryImages.length;
        setActiveImage(galleryImages[nextIndex]);
      } else if (isRightSwipe) {
        const prevIndex =
          (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setActiveImage(galleryImages[prevIndex]);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      const variantWithColorConfig = product.variants?.find(v => v.color);
      if (variantWithColorConfig) {
          setSelectedColor(variantWithColorConfig.color!);
          const variantImage = product.variants?.find(v => v.color === variantWithColorConfig.color && v.image)?.image;
          setActiveImage(variantImage || product.image);
      } else {
          setActiveImage(product.image);
      }
    }
  }, [decodedKey, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-[#1E2A44] animate-pulse">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Link
              to="/"
              className="text-[#1E2A44] underline font-bold uppercase tracking-widest"
            >
              Return to shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const proceedToCart = (action: "add" | "buy", isCust: boolean) => {
    if (isCust && !customName.trim()) {
      alert("Please enter a name for customization");
      return;
    }
    addToCart(
      product!,
      selectedSize,
      selectedColor || undefined,
      isCust ? { name: customName, number: customNumber } : undefined,
    );
    setIsCartOpen(true);
    if (action === "buy") {
       navigate("/checkout");
    }
  };

  const handleAction = (action: "add" | "buy") => {
    if (!selectedSize || (product && ['player-version', 'master-version', 'fan-set'].includes(product.category))) {
      setPendingAction(action);
      setIsVariantModalOpen(true);
      return;
    }
    const hasColors = product?.variants?.some(v => v.color);
    // Check if selected variant is available
    if (product?.variants) {
      const selectedVariant = product.variants.find(v => v.title === selectedSize && (!hasColors || v.color === selectedColor));
      if (selectedVariant && !selectedVariant.availableForSale) {
        alert("Selected variation is out of stock");
        return;
      }
    }

    proceedToCart(action, false);
  };

  const handleAddToCart = () => handleAction("add");
  const handleBuyNow = () => handleAction("buy");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)",
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center center" });
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = galleryImages.indexOf(activeImage);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIndex]);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = galleryImages.indexOf(activeImage);
    if (currentIndex === -1) return;
    const prevIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <SEO 
        title={seoDetails?.seoTitle}
        description={seoDetails?.metaDescription}
        image={product?.image}
        type="product"
        product={product}
        canonicalUrl={`https://jerseyunicorn.com/product/${product?.slug || product?.id}`}
      />
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#1E2A44] border border-[#1E2A44]/20 text-white px-6 py-3.5 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-[#F5EFE6]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-sm text-[#1E2A44] animate-pulse">
          <Link
            to="/"
            className="text-[#1E2A44] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link
            to="/"
            className="text-[#1E2A44] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider"
          >
            Shop
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-[#1B1B1B] font-black uppercase tracking-wider truncate">
            {product.name}
          </span>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
          {/* Image Gallery */}
          <div id="product-gallery" className="flex-1">
            <div className="sticky top-24 space-y-4">
              {/* Main Image with Zoom and Swipe */}
              <div
                className="aspect-[4/5] bg-gray-100 rounded-xl flex items-center justify-center p-0 overflow-hidden cursor-crosshair relative group shadow-sm"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEndHandler}
              >
                <img
                  src={activeImage || undefined}
                  alt={seoDetails?.mainImageAlt || `${product.name} – Jersey Unicorn`}
                  fetchPriority="high"
                  className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none md:pointer-events-auto"
                  style={zoomStyle}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-gray-200/50 flex items-center gap-1.5 pointer-events-auto transition-transform hover:scale-105 cursor-default">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-black text-[#1B1B1B] leading-none">{stats.avgRating}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1.5 border-l border-gray-300 ml-0.5 leading-none mt-0.5">
                    {stats.reviewCount}
                  </span>
                </div>

                {/* Overlay Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots for mobile */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 md:hidden">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all",
                            activeImage === img
                              ? "bg-black w-3"
                              : "bg-black/30",
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Zoom Hint */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1B1B1B] rounded shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none hidden md:block">
                  Hover to Zoom
                </div>
              </div>

              {/* Mobile Product Title & Price */}
              <div className="block lg:hidden mt-3 mb-1 px-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-black text-[#1B1B1B] tracking-tight uppercase leading-none">
                      {product.name.replace(/\s*\(.*\)\s*/g, "")}
                    </h1>
                    {product.name.includes("(") && (
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-1">
                        {product.name.substring(
                          product.name.indexOf("(") + 1,
                          product.name.indexOf(")"),
                        )}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href })
                          .catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        setToastMessage("Link copied!");
                        setTimeout(() => setToastMessage(""), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0 mt-1 cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> SHARE
                  </button>
                </div>

                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-black text-[#1E2A44]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xl font-bold text-gray-400 line-through mb-0.5">
                    ₹{(product.price + 600).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 mb-2">
                  <Truck className="w-3.5 h-3.5" />
                  Estimated Delivery: 4-7 Days
                </div>
              </div>

              {/* Thumbnails */}
              {!['player-version', 'master-version', 'fan-set'].includes(product.category) && (
                <div className="mb-2 mt-4 flex items-center gap-2">
                  
                  {selectedColor && (
                    <span className="text-[11px] font-black text-[#1B1B1B] uppercase tracking-widest">{selectedColor}</span>
                  )}
                </div>
              )}
              <div className={cn("flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide", ['player-version', 'master-version', 'fan-set'].includes(product.category) ? "mt-4" : "")}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImage(img);
                      const variantWithImage = product.variants?.find(v => v.image === img);
                      if (variantWithImage && variantWithImage.color) {
                        setSelectedColor(variantWithImage.color);
                      }
                    }}
                    className={cn(
                      "flex-shrink-0 w-20 h-24 rounded-lg border-2 transition-all overflow-hidden",
                      activeImage === img
                        ? "border-[#1E2A44]"
                        : "border-transparent hover:border-gray-200",
                    )}
                  >
                    <img
                      src={img || undefined}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col pb-8 md:pb-0">
            <div className="mb-6">
              <div className="hidden lg:block">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1B1B1B] tracking-tight uppercase leading-none">
                      {product.name.replace(/\s*\(.*\)\s*/g, "")}
                    </h1>
                    {product.name.includes("(") && (
                      <p className="text-sm md:text-base font-bold text-gray-500 uppercase tracking-wide mt-1">
                        {product.name.substring(
                          product.name.indexOf("(") + 1,
                          product.name.indexOf(")"),
                        )}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href })
                          .catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        setToastMessage("Link copied!");
                        setTimeout(() => setToastMessage(""), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0 mt-1 cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> SHARE
                  </button>
                </div>
              </div>
              
              <LiveViewerCount />
            </div>

            <div className="hidden lg:flex flex-col gap-1 mb-8">
              <div className="flex items-end gap-3">
                <span className="text-3xl md:text-4xl font-black text-[#1E2A44]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xl md:text-2xl font-bold text-gray-400 line-through mb-1">
                  ₹{(product.price + 600).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                <Truck className="w-3.5 h-3.5" />
                Estimated Delivery: 4-7 Days
              </div>
            </div>

                        <TrendingSalesIndicator productId={product.id} />
            
            
              {/* Size Selection */}
              {product.variants &&
                product.variants.length > 0 &&
                (product.variants[0].title !== "Default Title" || ['player-version', 'master-version', 'fan-set'].includes(product.category)) && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        Select Size
                      </h3>
                      <button 
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[11px] md:text-xs font-bold text-[#2874F0] hover:text-[#1c56b8] uppercase tracking-widest flex items-center gap-0.5 transition-colors"
                      >
                        SIZE GUIDE <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {(() => {
                        const isJersey = ['player-version', 'master-version', 'fan-set'].includes(product.category);
                        const fixedJerseySizes = [
                          { size: 'S', available: true },
                          { size: 'M', available: true },
                          { size: 'L', available: true },
                          { size: 'XL', available: true },
                          { size: 'XXL', available: true }
                        ];

                        let variantsSource = [];
                        if (isJersey) {
                          variantsSource = fixedJerseySizes;
                        } else {
                          const filteredVariants = selectedColor ? product.variants.filter(v => v.color === selectedColor) : product.variants;
                          variantsSource = filteredVariants.reduce<
                            { size: string; available: boolean }[]
                          >((acc, v) => {
                            const existing = acc.find((a) => a.size === v.title);
                            if (existing) {
                              if (v.availableForSale) existing.available = true;
                            } else {
                              acc.push({
                                size: v.title,
                                available: v.availableForSale,
                              });
                            }
                            return acc;
                          }, []);
                        }

                        return variantsSource.map((variant) => {
                          const { size, available } = variant;
                          const isUnavailable = !available;

                          return (
                            <button
                              key={size}
                              onClick={() => {
                                if (!isUnavailable) handleSizeClick(size);
                              }}
                              disabled={isUnavailable}
                              className={cn(
                                "relative w-10 h-10 border rounded flex items-center justify-center transition-all duration-200 text-xs md:text-sm font-bold tracking-tight shrink-0 select-none",
                                isUnavailable
                                  ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed overflow-hidden"
                                  : selectedSize === size
                                    ? "bg-[#1E2A44] text-white border-[#1E2A44] font-extrabold shadow-sm"
                                    : "bg-white text-[#1B1B1B] border-gray-200 hover:border-black"
                              )}
                            >
                              <span>{size}</span>
                              {isUnavailable && (
                                <svg className="absolute inset-0 w-full h-full text-gray-300 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

               

            {/* Customization Section */}
            {product && ['player-version', 'master-version', 'fan-set'].includes(product.category) && (
              <div className="mt-6 mb-6 p-4 md:p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm md:text-base font-black text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                    🎨 Customize Your Jersey
                  </h3>
                  <span className="text-[10px] md:text-xs font-bold bg-[#1E2A44] text-white px-2.5 py-1 rounded-full whitespace-nowrap">+₹199</span>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Player Name (Optional)"
                    maxLength={12}
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value.toUpperCase());
                      setIsCustomized(true);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] transition-all bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Player Number (Optional)"
                    maxLength={2}
                    value={customNumber}
                    onChange={(e) => {
                      setCustomNumber(e.target.value.replace(/\D/g, ''));
                      setIsCustomized(true);
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Delivery Checker Section */}
            <DeliveryChecker customizationEnabled={!!customName.trim() || !!customNumber.trim()} />

            {/* Low Stock Badge (Task 2B) */}
              {product && (
                <div className="mb-6 flex items-center gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold uppercase text-[11px] md:text-xs tracking-wider shadow-sm w-fit animate-pulse select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  <span>Only {variantInventory} left — grab it fast</span>
                </div>
              )}

              {/* COD Payment Rules Info */}
              <div className="mb-6 p-4 border border-[#1E2A44] bg-[#F8FAFC] rounded-xl flex items-start gap-3">
                <Banknote className="w-6 h-6 text-[#1E2A44] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#1B1B1B] uppercase tracking-wider mb-1">COD Available</span>
                  <span className="text-xs font-bold text-gray-700 mb-1">₹50 Advance Payment Required per jersey</span>
                  <span className="text-xs font-medium text-gray-500 leading-tight">Remaining Amount Payable on Delivery (₹50 COD handling charge applies per jersey)</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100 pb-2">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <Truck className="w-6 h-6 text-gray-700 stroke-[1.5]" />
                  <span className="text-xs font-bold text-gray-700 tracking-wide">Free delivery</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <Banknote className="w-6 h-6 text-gray-700 stroke-[1.5]" />
                  <span className="text-xs font-bold text-gray-700 tracking-wide">Cod available</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <RefreshCcw className="w-6 h-6 text-gray-700 stroke-[1.5]" />
                  <span className="text-xs font-bold text-gray-700 tracking-wide">Easy exchange</span>
                </div>
              </div>
            </div>
          </div>
      </main>
      
      <ProductInfoAccordion product={product} />

      <ReviewsSection product={product} />

      {/* Flipkart Style Permanent Mobile Sticky Buttons */}
      {product && !isCartOpen && (
        <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-[190] flex items-center bg-white border-t border-gray-100 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white text-[#1B1B1B] font-black uppercase tracking-widest text-sm py-4 border-r border-gray-200 active:bg-gray-50 transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-[#1E2A44] text-white font-black uppercase tracking-widest text-sm py-4 active:bg-[#151D2F] transition-colors cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Similar Products */}
      {product && (
        <section className="bg-gray-50 py-12 md:py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg md:text-xl font-black uppercase text-[#1B1B1B] tracking-tight">
                Similar Products
              </h2>
              <div className="h-[1px] flex-grow bg-gray-200 ml-6 hidden md:block"></div>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x pl-4 sm:pl-0 snap-mandatory scrollbar-hide -mx-4 sm:mx-0">
              {getProductsByCategory(product.category, products)
                .filter((p) => p.id !== product.id)
                .slice(0, 12)
                .map((similarProduct) => (
                  <div
                    key={similarProduct.id}
                    className="w-[140px] md:w-[220px] flex-shrink-0 snap-start"
                  >
                    <ProductCard product={similarProduct} />
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewedSection />
      <TrustSection />
      <Footer />

      {/* Variant Selection Modal */}
      <AnimatePresence>
        
      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setIsSizeGuideOpen(false)} 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black uppercase tracking-widest text-sm text-[#1B1B1B]">Size Guide</h3>
            </div>
            <div className="flex-1 overflow-hidden relative touch-none bg-white flex items-center justify-center">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ wheelDisabled: false }}
                pinch={{ disabled: false }}
              >
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img 
                    src={
                      !product ? "https://i.imgur.com/t4wt92I.png" 
                      : ['fan-set', 'master-version'].includes(product.category) ? "https://i.imgur.com/5vhqw6D.png" 
                      : product.category === 'player-version' ? "https://i.imgur.com/cB5TwcK.png" 
                      : "https://i.imgur.com/t4wt92I.png"
                    }
                    alt="Size Guide" 
                    className="w-full h-auto object-contain cursor-move" 
                    style={{ maxHeight: 'calc(90vh - 60px)' }}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}

      {isVariantModalOpen && product && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVariantModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[400px] bg-white z-[201] rounded-t-2xl md:rounded-2xl flex flex-col pb-safe md:pb-0 max-h-[85vh] md:max-h-[80vh] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                <h3 className="text-lg font-bold text-[#1B1B1B]">Select variant</h3>
                <button 
                  onClick={() => setIsVariantModalOpen(false)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto">
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={activeImage || product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{product.category.replace("-", " ")}</span>
                    <h4 className="text-sm font-black text-[#1B1B1B] uppercase leading-tight line-clamp-2 mb-1">{product.name.replace(/\s*\(.*\)\s*/g, "")}</h4>
                    <span className="text-lg font-black text-[#1E2A44]">₹{product.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">Select Size</span>
                    <button 
                      onClick={() => {
                        setIsVariantModalOpen(false);
                        setIsSizeGuideOpen(true);
                      }}
                      className="text-[11px] md:text-xs font-bold text-[#2874F0] hover:text-[#1c56b8] uppercase tracking-widest flex items-center gap-0.5 transition-colors"
                    >
                      SIZE GUIDE <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {(() => {
                      const isJersey = ['player-version', 'master-version', 'fan-set'].includes(product.category);
                      const fixedJerseySizes = [
                        { size: 'S', available: true },
                        { size: 'M', available: true },
                        { size: 'L', available: true },
                        { size: 'XL', available: true },
                        { size: 'XXL', available: true }
                      ];

                      let variantsSource = [];
                      if (isJersey) {
                        variantsSource = fixedJerseySizes;
                      } else {
                        const filteredVariants = selectedColor ? product.variants?.filter(v => v.color === selectedColor) : product.variants;
                        if (!filteredVariants) return null;
                        variantsSource = filteredVariants.reduce<
                          { size: string; available: boolean }[]
                        >((acc, v) => {
                          const existing = acc.find((a) => a.size === v.title);
                          if (existing) {
                            if (v.availableForSale) existing.available = true;
                          } else {
                            acc.push({
                              size: v.title,
                              available: v.availableForSale,
                            });
                          }
                          return acc;
                        }, []);
                      }

                      return variantsSource.map((variant) => {
                        const { size, available } = variant;
                        const isUnavailable = !available;

                        return (
                          <button
                            key={size}
                            onClick={() => {
                              if (!isUnavailable) handleSizeClick(size);
                            }}
                            disabled={isUnavailable}
                            className={cn(
                              "relative w-10 h-10 border rounded flex items-center justify-center transition-all duration-200 text-xs md:text-sm font-bold tracking-tight shrink-0 select-none",
                              isUnavailable
                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed overflow-hidden"
                                : selectedSize === size
                                  ? "bg-[#1E2A44] text-white border-[#1E2A44] font-extrabold shadow-sm"
                                  : "bg-white text-[#1B1B1B] border-gray-200 hover:border-black"
                            )}
                          >
                            <span>{size}</span>
                            {isUnavailable && (
                              <svg className="absolute inset-0 w-full h-full text-gray-300 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
                
                {/* Customization inside variant modal */}
                {['player-version', 'master-version', 'fan-set'].includes(product.category) && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-black text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        🎨 Customize
                      </h3>
                      <span className="text-[10px] font-bold bg-[#1E2A44] text-white px-2 py-0.5 rounded-full whitespace-nowrap">+₹199</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Player Name (Optional)"
                        maxLength={12}
                        value={customName}
                        onChange={(e) => {
                          setCustomName(e.target.value.toUpperCase());
                          setIsCustomized(true);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Player Number (Optional)"
                        maxLength={2}
                        value={customNumber}
                        onChange={(e) => {
                          setCustomNumber(e.target.value.replace(/\D/g, ''));
                          setIsCustomized(true);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-[#1E2A44] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (!selectedSize) {
                      return;
                    }
                    setIsVariantModalOpen(false);
                    const isCust = isCustomized ? { name: customName, number: customNumber } : undefined;
                    addToCart(product!, selectedSize, selectedColor || undefined, isCust);
                    setIsCartOpen(true);
                    if (pendingAction === "buy") {
                      navigate("/checkout");
                    }
                  }}
                  className={cn(
                    "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all",
                    selectedSize 
                      ? "bg-[#1E2A44] text-white hover:bg-[#151D2F] cursor-pointer" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Continue
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
