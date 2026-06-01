import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts, getProductById, getProductsByCategory } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import { SizeGuideModal } from "../components/SizeGuideModal";
import { ReviewsSection, getProductReviewsInfo } from "../components/ReviewsSection";
import { FAQ } from "../components/FAQ";
import { ChevronRight, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Star, CheckCircle2, Lock, Shirt } from "lucide-react";
import { cn } from "../lib/utils";
import { useShop } from "../context/ShopContext";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, isLoading } = useProducts();
  const { addToCart, setIsCartOpen } = useShop();
  const decodedId = useMemo(() => id ? decodeURIComponent(id) : "", [id]);
  
  const product = useMemo(() => getProductById(decodedId, products), [decodedId, products]);
  
  const stats = useMemo(() => {
    if (!product) return { avgRating: "4.9", reviewCount: 120 };
    return getProductReviewsInfo(product.id);
  }, [product]);
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isCustomized, setIsCustomized] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const minSwipeDistance = 50;

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
      setIsScrolledToBottom(isBottom);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const galleryImages = product?.galleryImages || (product ? [product.image] : []);

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
        const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setActiveImage(galleryImages[prevIndex]);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
       setActiveImage(product.image);
    }
  }, [decodedId, product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-[#F5EFE6]0">
            Loading...
          </div>
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
            <Link to="/" className="text-[#1E2A44] underline font-bold uppercase tracking-widest">Return to shop</Link>
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
    if (isCustomized && !customName.trim()) {
      alert("Please enter a name for customization");
      return;
    }
    addToCart(product, selectedSize, isCustomized ? { name: customName, number: customNumber } : undefined);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    if (isCustomized && !customName.trim()) {
      alert("Please enter a name for customization");
      return;
    }
    addToCart(product, selectedSize, isCustomized ? { name: customName, number: customNumber } : undefined);
    setIsCartOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)"
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
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-[#F5EFE6]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-sm text-[#F5EFE6]0">
          <Link to="/" className="text-[#1E2A44] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link to="/" className="text-[#1E2A44] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider">Shop</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-[#1B1B1B] font-black uppercase tracking-wider truncate">{product.name}</span>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="flex-1">
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
                            activeImage === img ? "bg-black w-3" : "bg-black/30"
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
                        activeImage === img ? "border-[#1E2A44]" : "border-transparent hover:border-gray-200"
                      )}
                    >
                       <img src={img || undefined} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stats.avgRating} ({stats.reviewCount} Reviews)</span>
               </div>
               
               <h1 className="text-3xl md:text-5xl font-black text-[#1B1B1B] tracking-tight mb-2 uppercase leading-none">
                 {product.name.replace(/\s*\(.*\)\s*/g, '')}
               </h1>
               {product.name.includes('(') && (
                 <p className="text-lg md:text-xl font-bold text-gray-500 uppercase tracking-wide">
                   {product.name.substring(product.name.indexOf('(') + 1, product.name.indexOf(')'))}
                 </p>
               )}
            </div>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-3xl md:text-4xl font-black text-[#1E2A44]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xl md:text-2xl font-bold text-gray-400 line-through mb-1">
                ₹{Math.floor(product.price * 1.4).toLocaleString('en-IN')}
              </span>
              <span className="bg-green-100 text-green-800 text-[10px] font-black tracking-widest px-2 py-1 rounded uppercase mb-2 ml-2">
                Sale
              </span>
            </div>

            <div className="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                    Select Size
                  </h3>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs text-gray-500 font-bold uppercase underline tracking-wider hover:text-[#1E2A44] transition-colors"
                  >
                    Size Guide
                  </button>
                 </div>
                 <p className="text-xs text-gray-500 mb-3 font-medium">Standard Fit. Order your usual size.</p>
                <div className="flex flex-wrap md:flex-nowrap gap-3">
                  {SIZES.map((size) => {
                    const isUnavailable = product.name.toLowerCase().includes('arsenal 3rd') && product.name.toLowerCase().includes('full sleeve') && (size === 'S' || size === 'M');
                    return (
                      <button
                        key={size}
                        onClick={() => { if (!isUnavailable) handleSizeClick(size); }}
                        disabled={isUnavailable}
                        className={cn(
                          "group flex-1 py-4 px-2 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 min-w-[60px] shadow-sm transform active:scale-95",
                          isUnavailable
                            ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 relative overflow-hidden" 
                            : selectedSize === size
                            ? "border-[#1E2A44] bg-[#1E2A44] shadow-md shadow-[#1E2A44]/30 scale-105 z-10"
                            : "border-gray-200 bg-white hover:border-[#1E2A44]/50 hover:bg-gray-50 hover:shadow-md"
                        )}
                      >
                        <span className={cn(
                          "text-lg md:text-xl font-black tracking-tight",
                          selectedSize === size ? "text-white" : "text-[#1B1B1B]"
                        )}>{size}</span>
                        {isUnavailable && (
                           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 rotate-[-15deg]"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jersey Customization */}
              {['player', 'fan', 'master'].includes(product.category?.toLowerCase() || '') && !product.name.toLowerCase().includes('f1') && !product.name.toLowerCase().includes('formula') && (
              <div className="pt-8 border-t border-gray-100">
                  <div className="mb-4">
                     <h3 className="text-sm font-black text-[#1B1B1B] uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1E2A44]"></span>
                        Personalize Your Kit
                     </h3>
                     <p className="text-xs text-gray-500 font-medium mt-1">Add your favorite player name & number.</p>
                  </div>
                  
                  <div 
                     onClick={() => setIsCustomized(!isCustomized)}
                     className={cn(
                        "relative overflow-hidden group p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2",
                        isCustomized 
                           ? "border-[#1E2A44] bg-[#1E2A44] shadow-lg shadow-[#1E2A44]/20" 
                           : "border-gray-100 bg-gray-50 hover:bg-gray-100/80 hover:border-gray-200"
                     )}
                  >
                     <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                              isCustomized ? "bg-white/10" : "bg-white shadow-sm border border-gray-200"
                           )}>
                              <CheckCircle2 className={cn("w-5 h-5", isCustomized ? "text-white" : "text-transparent")} />
                           </div>
                           <span className={cn(
                              "text-sm font-bold uppercase tracking-wider transition-colors",
                              isCustomized ? "text-white" : "text-[#1B1B1B]"
                           )}>
                              🎽 Add Name & Number
                           </span>
                        </div>
                        <div className={cn(
                           "text-sm md:text-base font-black tracking-widest px-3 py-1.5 rounded-lg uppercase transition-all shadow-sm",
                           isCustomized 
                              ? "bg-white text-[#1E2A44]" 
                              : "bg-white text-[#E6C9A8] border border-[#E6C9A8]/20"
                        )}>
                           +₹199
                        </div>
                     </div>
                  </div>

                  {isCustomized && (
                     <div className="mt-4 p-5 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-300 shadow-inner">
                        <div className="flex flex-col md:flex-row gap-6">
                           {/* Inputs */}
                           <div className="flex-1 space-y-4">
                              <div>
                                 <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Name on Jersey</label>
                                 <input 
                                    type="text" 
                                    maxLength={15}
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                                    placeholder="e.g. RONALDO" 
                                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-[#1B1B1B] uppercase tracking-wider focus:outline-none focus:border-[#1E2A44] focus:ring-1 focus:ring-[#1E2A44] transition-all placeholder:text-gray-300 shadow-sm"
                                 />
                              </div>
                              <div>
                                 <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Number</label>
                                 <input 
                                    type="text" 
                                    maxLength={2}
                                    value={customNumber}
                                    onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder="e.g. 7" 
                                    className="w-full max-w-[120px] bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-[#1B1B1B] uppercase tracking-wider focus:outline-none focus:border-[#1E2A44] focus:ring-1 focus:ring-[#1E2A44] transition-all placeholder:text-gray-300 shadow-sm text-center"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
              </div>
              )}

              {/* COD Trust Box */}
              <div className="bg-[#1E2A44]/5 border border-[#1E2A44]/10 rounded-xl p-4 flex items-start gap-3">
                 <CheckCircle2 className="h-5 w-5 text-[#1E2A44] flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-[#1E2A44] uppercase tracking-wider mb-1">Cash on Delivery Available</h4>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed">₹150 confirmation amount required for COD orders. Remaining payment payable at delivery. Free delivery on full prepaid orders.</p>
                 </div>
              </div>

              {/* Prepaid Benefits */}
              <div className="bg-[#1B1B1B] text-white rounded-xl p-5 relative overflow-hidden shadow-lg mt-4">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />
                 <h4 className="text-xs font-black uppercase tracking-widest text-[#E6C9A8] mb-3">Prepaid Benefits</h4>
                 <ul className="space-y-2 relative z-10">
                   <li className="flex items-center gap-2 text-sm font-medium text-gray-300"><CheckCircle2 className="w-4 h-4 text-green-400" /> Extra ₹50 OFF</li>
                   <li className="flex items-center gap-2 text-sm font-medium text-gray-300"><Truck className="w-4 h-4 text-green-400" /> Faster Dispatch</li>
                   <li className="flex items-center gap-2 text-sm font-medium text-gray-300"><Star className="w-4 h-4 text-green-400" /> Priority Processing</li>
                 </ul>
              </div>

              {/* Desktop CTA Buttons */}
              <div className="hidden md:flex flex-col gap-3 mt-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center text-center border-2 border-[#1E2A44] text-[#1E2A44] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-50 transition-colors text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center text-center bg-[#1E2A44] border-2 border-[#1E2A44] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#151D2F] hover:-translate-y-0.5 transition-all duration-300 text-sm"
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
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 md:hidden transition-transform duration-300 ease-in-out flex gap-3",
        // Only show if we haven't scrolled to the absolute bottom (footer)
        isScrolledToBottom ? "translate-y-full" : "translate-y-0"
      )}>
         <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center text-center border-2 border-[#1E2A44] text-[#1E2A44] py-3.5 rounded-xl font-black uppercase tracking-widest bg-white shadow-sm transition-colors text-xs"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center text-center bg-[#1E2A44] border-2 border-[#1E2A44] text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-md transition-colors text-xs"
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
                  <div key={similarProduct.id} className="w-[140px] md:w-[220px] flex-shrink-0 snap-start">
                    <ProductCard product={similarProduct} />
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      <ReviewsSection productId={product.id} />
      <FAQ />
      <InstagramSection />
      <TrustSection />
      <Footer />
      
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
