import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts, getProductById, getProductsByCategory } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import { ChevronRight, ChevronLeft, MessageCircle, ShieldAlert, ShoppingBag, Heart } from "lucide-react";
import { cn } from "../lib/utils";
import { useShop } from "../context/ShopContext";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, isLoading } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  
  // Need to decode the ID from React Router param if it's base64/shopify encoded
  // Or just use the original id. URL encoding might have messed it up if not encoded properly when linking
  const decodedId = useMemo(() => id ? decodeURIComponent(id) : "", [id]);
  
  const product = useMemo(() => getProductById(decodedId, products), [decodedId, products]);
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

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
          <div className="text-center text-gray-500">
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
            <Link to="/" className="text-[#5A2E0F] underline font-bold uppercase tracking-widest">Return to shop</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSizeClickAndOrder = (size: string) => {
    setSelectedSize(size);
    const message = `Hello Jersey Unicorn! 🦄\n\nI am interested in this jersey:\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\nSize: ${size}\nQuantity: 1\nLink: ${window.location.href}\n\nPlease help me with the order.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918788965436?text=${encodedMessage}`, '_blank');
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
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-sm text-gray-500">
          <Link to="/" className="text-[#5A2E0F] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link to="/#categories" className="text-[#5A2E0F] hover:opacity-80 transition-opacity font-bold uppercase tracking-wider">Shop</Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-[#1A1A1A] font-black uppercase tracking-wider truncate">{product.name}</span>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Image Gallery */}
          <div className="flex-1">
            <div className="sticky top-24 space-y-4">
              {/* Main Image with Zoom and Swipe */}
              <div 
                className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] border border-[#EDE3D8] bg-[#f5f5f5] flex items-center justify-center p-0 overflow-hidden cursor-crosshair relative group"
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
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] rounded shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none hidden md:block">
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
                        "flex-shrink-0 w-20 h-24 border-2 transition-all overflow-hidden",
                        activeImage === img ? "border-[#5A2E0F]" : "border-transparent hover:border-[#EDE3D8]"
                      )}
                    >
                       <img src={img || undefined} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col">
            
            {/* Prepaid Badge */}
            <div className="mb-6 inline-flex items-center space-x-2 bg-[#5A2E0F] text-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase w-fit">
               <ShieldAlert className="w-4 h-4" />
               <span>PREPAID ORDERS ONLY</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-4 uppercase">
              {product.name}
            </h1>
            
            <p className="text-2xl md:text-3xl font-black text-[#5A2E0F] mb-8">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            <div className="space-y-8 mb-10 border-t border-[#EDE3D8] pt-8">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                    Select Size to Order
                  </h3>
                  <button className="text-[10px] text-[#5A2E0F] font-bold uppercase underline tracking-wider hover:opacity-80 transition-opacity">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3">
                  {SIZES.map((size) => {
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "group flex-1 py-4 px-2 border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-sm min-w-[60px]",
                          selectedSize === size
                            ? "border-[#5A2E0F] bg-[#5A2E0F] text-[#EDE3D8]"
                            : "border-gray-200 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]"
                        )}
                      >
                        <span className="text-2xl md:text-3xl font-black">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-8">
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                        if (!selectedSize) {
                            alert("Please select a size first!");
                            return;
                        }
                        addToCart(product, selectedSize);
                    }}
                    className="flex-1 bg-[#5A2E0F] text-white py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#3d1f0a] transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add to Bag
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="px-5 border-2 border-[#EDE3D8] hover:bg-gray-50 flex items-center justify-center transition-colors rounded-sm"
                  >
                    <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]'}`} />
                  </button>
                </div>
                
                <button 
                    onClick={() => {
                        if (!selectedSize) {
                            alert("Please select a size first!");
                            return;
                        }
                        const message = `Hello Jersey Unicorn! 🦄\n\nI am interested in this jersey:\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\nSize: ${selectedSize}\nQuantity: 1\nLink: ${window.location.href}\n\nPlease help me with the order.`;
                        const encodedMessage = encodeURIComponent(message);
                        window.open(`https://wa.me/918788965436?text=${encodedMessage}`, '_blank');
                    }}
                    className="w-full bg-[#25D366] text-white py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> Order on WhatsApp
                </button>
              </div>

              {/* Category & Description */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Description</h3>
                <p className="text-[#1A1A1A] leading-relaxed text-sm md:text-base font-medium">
                  {product.description}
                </p>
                <div className="mt-4 p-4 bg-gray-50 border border-[#EDE3D8]">
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                        <span className="text-[#1A1A1A]">Category:</span> {product.category.replace(/-/g, ' ').toUpperCase()}
                    </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <div className="text-center text-[11px] font-bold uppercase tracking-widest text-[#5A2E0F] flex flex-col items-center gap-2">
                 <p className="mt-2 text-gray-400">Secure checkout via WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Similar Products */}
      {product && (
        <section className="bg-gray-50 py-16 border-t border-[#EDE3D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[#1A1A1A] mb-8 text-center tracking-tight">
              Similar Products
            </h2>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 snap-x pl-4 sm:pl-0 snap-mandatory scrollbar-hide -mx-4 sm:mx-0">
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

      <InstagramSection />
      <TrustSection />
      <Footer />
    </div>
  );
}
