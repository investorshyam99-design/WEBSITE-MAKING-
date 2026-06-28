import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useProducts,
  getProductById,
  getProductsByCategory,
} from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import {
  ReviewsSection,
  getProductReviewsInfo,
} from "../components/ReviewsSection";
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
  Instagram,
  Send,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useShop } from "../context/ShopContext";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function ProductPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const { addToCart, setIsCartOpen } = useShop();

  const activeKey = slug || id || "";
  const decodedKey = useMemo(
    () => (activeKey ? decodeURIComponent(activeKey) : ""),
    [activeKey],
  );

  const product = useMemo(
    () => getProductById(decodedKey, products),
    [decodedKey, products],
  );

  // If visited via legacy ID route /product/:id, redirect to custom slug route /products/:slug
  useEffect(() => {
    if (id && product && !isLoading) {
      navigate(`/products/${product.slug}`, { replace: true });
    }
  }, [id, product, isLoading, navigate]);

  const stats = useMemo(() => {
    if (!product) return { avgRating: "4.9", reviewCount: 120 };
    return getProductReviewsInfo(product.id);
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
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
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
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

  const shareWhatsApp = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
    const text = `Check out this premium apparel: ${product.name} at ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareInstagram = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Link copied! Paste it in Instagram.");
        setTimeout(() => {
          window.open("https://instagram.com", "_blank");
        }, 800);
      })
      .catch(() => {
        window.open("https://instagram.com", "_blank");
      });
  };

  const shareTelegram = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
    const text = `Check out this premium apparel: ${product.name}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, "_blank");
  };

  const shareSnapchat = () => {
    if (!product) return;
    const shareUrl = `${window.location.origin}/products/${product.slug}`;
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
          <div className="text-center text-[#F5EFE6]0">Loading...</div>
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
              className="text-[#722F37] underline font-bold uppercase tracking-widest"
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

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    const hasColors = product?.variants?.some(v => v.color);
    if (hasColors && !selectedColor) {
      alert("Please select a color first");
      return;
    }
    
    // Check if selected variant is available
    if (product?.variants) {
      const selectedVariant = product.variants.find(v => v.title === selectedSize && (!hasColors || v.color === selectedColor));
      if (selectedVariant && !selectedVariant.availableForSale) {
        alert("Selected variation is out of stock");
        return;
      }
    }

    if (isCustomized && !customName.trim()) {
      alert("Please enter a name for customization");
      return;
    }
    addToCart(
      product!,
      selectedSize,
      selectedColor || undefined,
      isCustomized ? { name: customName, number: customNumber } : undefined,
    );
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    const hasColors = product?.variants?.some(v => v.color);
    if (hasColors && !selectedColor) {
      alert("Please select a color first");
      return;
    }

    // Check if selected variant is available
    if (product?.variants) {
      const selectedVariant = product.variants.find(v => v.title === selectedSize && (!hasColors || v.color === selectedColor));
      if (selectedVariant && !selectedVariant.availableForSale) {
        alert("Selected variation is out of stock");
        return;
      }
    }

    if (isCustomized && !customName.trim()) {
      alert("Please enter a name for customization");
      return;
    }
    addToCart(
      product!,
      selectedSize,
      selectedColor || undefined,
      isCustomized ? { name: customName, number: customNumber } : undefined,
    );
    setIsCartOpen(true);
  };

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
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#722F37] border border-[#722F37]/20 text-white px-6 py-3.5 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4.5 h-4.5 text-green-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-[#F5EFE6]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-sm text-[#F5EFE6]0">
          <Link
            to="/"
            className="text-[#722F37] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link
            to="/"
            className="text-[#722F37] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider"
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
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out pointer-events-none md:pointer-events-auto"
                  style={zoomStyle}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />

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

              {/* Thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "flex-shrink-0 w-20 h-24 rounded-lg border-2 transition-all overflow-hidden",
                      activeImage === img
                        ? "border-[#722F37]"
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
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {stats.avgRating} ({stats.reviewCount} Reviews)
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-[#1B1B1B] tracking-tight mb-2 uppercase leading-none">
                {product.name.replace(/\s*\(.*\)\s*/g, "")}
              </h1>
              {product.name.includes("(") && (
                <p className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-wide">
                  {product.name.substring(
                    product.name.indexOf("(") + 1,
                    product.name.indexOf(")"),
                  )}
                </p>
              )}
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="text-3xl md:text-4xl font-black text-[#722F37]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-xl md:text-2xl font-bold text-gray-400 line-through mb-1">
                ₹{Math.floor(product.price * 1.4).toLocaleString("en-IN")}
              </span>
              <span className="bg-green-100 text-green-800 text-[10px] font-black tracking-widest px-2 py-1 rounded uppercase mb-2 ml-2">
                Sale
              </span>
            </div>

            <div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {/* Color Selection */}
              {product.variants && (() => {
                const colors = Array.from(new Set(product.variants.filter(v => v.color).map(v => v.color as string)));
                if (colors.length === 0) return null;
                return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        Select Color
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {colors.map((color) => {
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              const variantWithImage = product.variants?.find(v => v.color === color && v.image);
                              if (variantWithImage && variantWithImage.image) {
                                setActiveImage(variantWithImage.image);
                                const galleryEl = document.getElementById('product-gallery');
                                if (galleryEl) galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                            className={cn(
                              "group flex-1 py-3 px-3 border-2 rounded-xl flex items-center justify-center transition-all duration-300 min-w-[80px] shadow-sm transform active:scale-95",
                              selectedColor === color
                                ? "border-[#722F37] bg-[#722F37] shadow-md shadow-[#722F37]/30 scale-105 z-10 text-white"
                                : "border-gray-200 bg-white hover:border-[#722F37]/50 hover:bg-gray-50 text-[#1B1B1B]",
                            )}
                          >
                            <span className="text-sm font-bold tracking-tight">
                              {color}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Size Selection */}
              {product.variants &&
                product.variants.length > 0 &&
                product.variants[0].title !== "Default Title" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        Select Size
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {(() => {
                        const filteredVariants = selectedColor ? product.variants.filter(v => v.color === selectedColor) : product.variants;
                        
                        const variantsSource = filteredVariants.reduce<
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
                                "group flex-1 py-4 px-2 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 min-w-[60px] shadow-sm transform active:scale-95",
                                isUnavailable
                                  ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 relative overflow-hidden"
                                  : selectedSize === size
                                    ? "border-[#722F37] bg-[#722F37] shadow-md shadow-[#722F37]/30 scale-105 z-10"
                                    : "border-gray-200 bg-white hover:border-[#722F37]/50 hover:bg-gray-50 hover:shadow-md",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-lg md:text-xl font-black tracking-tight",
                                  selectedSize === size
                                    ? "text-white"
                                    : "text-[#1B1B1B]",
                                )}
                              >
                                {size}
                              </span>
                              {isUnavailable && (
                                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 rotate-[-15deg]"></div>
                              )}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

              {/* Description */}
              {product.descriptionHtml || product.description ? (
                <div
                  className="mb-8 text-sm md:text-base text-gray-600 markdown-body"
                  dangerouslySetInnerHTML={{
                    __html:
                      product.descriptionHtml || product.description || "",
                  }}
                ></div>
              ) : null}

              {/* COD Trust Box */}
              <div className="bg-[#722F37]/5 border border-[#722F37]/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#722F37] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#722F37] uppercase tracking-wider mb-1">
                    Cash on Delivery Available
                  </h4>
                  <p className="text-xs font-medium text-gray-600 leading-relaxed">
                    ₹150 confirmation amount required for COD orders. Remaining
                    payment payable at delivery. Free delivery on full prepaid
                    orders.
                  </p>
                </div>
              </div>

              {/* Prepaid Benefits */}
              <div className="bg-[#1B1B1B] text-white rounded-xl p-5 relative overflow-hidden shadow-lg mt-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[#E6C9A8] mb-3">
                  Prepaid Benefits
                </h4>
                <ul className="space-y-2 relative z-10">
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Extra
                    ₹50 OFF
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Truck className="w-4 h-4 text-green-400" /> Faster Dispatch
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Star className="w-4 h-4 text-green-400" /> Priority
                    Processing
                  </li>
                </ul>
              </div>

              {/* Share Product Panel */}
              <div className="border-t border-b border-gray-100 py-6 my-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-gray-400" />
                  Share This Product
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 h-11 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-gray-200/50 hover:border-gray-300 active:scale-95 cursor-pointer"
                    title="Copy Link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center justify-center w-11 h-11 bg-[#25D366] hover:opacity-90 text-white rounded-xl shadow-md shadow-[#25D366]/10 active:scale-95 transition-all cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </button>

                  {/* Instagram */}
                  <button
                    onClick={shareInstagram}
                    className="flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-yellow-500 via-[#E1306C] to-[#833AB4] hover:opacity-90 text-white rounded-xl shadow-md shadow-[#E1306C]/10 active:scale-95 transition-all cursor-pointer"
                    title="Share on Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={shareTelegram}
                    className="flex items-center justify-center w-11 h-11 bg-[#0088cc] hover:opacity-90 text-white rounded-xl shadow-md shadow-[#0088cc]/10 active:scale-95 transition-all cursor-pointer"
                    title="Share on Telegram"
                  >
                    <Send className="w-5 h-5 -rotate-12 translate-x-[-1px] translate-y-[1px]" />
                  </button>

                  {/* Snapchat */}
                  <button
                    onClick={shareSnapchat}
                    className="flex items-center justify-center w-11 h-11 bg-[#FFFC00] hover:bg-[#FFFC00]/90 text-black rounded-xl shadow-md shadow-yellow-500/5 active:scale-95 transition-all border border-yellow-400 cursor-pointer"
                    title="Share on Snapchat"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.82c-.87.03-1.52.12-2.32.32-2.02.5-3.3 1.95-3.64 4.14-.14.93-.16 1.87.1 2.76.12.43.34.8.46 1.23.08.3-.01.55-.26.74-.63.47-1.16 1.07-1.39 1.83-.2.67.06 1.34.61 1.7.54.36 1.18.42 1.83.2.3-.1.52-.02.68.25.1.18.25.33.32.54.12.35.12.72.06 1.13-.08.5-.42.92-.64 1.39-.17.37-.2.73.04 1.06.27.38.74.52 1.2.37.56-.18.96-.58 1.4-.95.23-.2.43-.2.71-.1.8.31 1.63.38 2.47.38s1.67-.07 2.47-.38c.28-.1.48-.1.71.1.44.37.84.77 1.4.95.46.15.93 0 1.2-.37.24-.33.21-.69.04-1.06-.22-.47-.56-.89-.64-1.39-.06-.41-.06-.78.06-1.13.07-.21.22-.36.32-.54.16-.27.38-.35.68-.25.65.22 1.29.16 1.83-.2.55-.36.81-1.03.61-1.7-.23-.76-.76-1.36-1.39-1.83-.25-.19-.34-.44-.26-.74.12-.43.34-.8.46-1.23.26-.89.24-1.83.1-2.76-.34-2.19-1.62-3.64-3.64-4.14-.8-.2-1.45-.29-2.32-.32z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Desktop CTA Buttons */}
              <div className="hidden md:flex flex-col gap-3 mt-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center text-center border-2 border-[#722F37] text-[#722F37] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-50 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center text-center bg-[#722F37] border-2 border-[#722F37] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#57242A] hover:-translate-y-0.5 transition-all duration-300 text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 md:hidden transition-transform duration-300 ease-in-out flex gap-3",
          // Only show if we haven't scrolled to the absolute bottom (footer)
          isScrolledToBottom ? "translate-y-full" : "translate-y-0",
        )}
      >
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center text-center border-2 border-[#722F37] text-[#722F37] py-3.5 rounded-xl font-black uppercase tracking-widest bg-white shadow-sm transition-colors text-xs"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center text-center bg-[#722F37] border-2 border-[#722F37] text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-md transition-colors text-xs"
        >
          Buy Now
        </button>
      </div>

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

      <ReviewsSection productId={product.id} />
      <InstagramSection />
      <TrustSection />
      <Footer />
    </div>
  );
}
