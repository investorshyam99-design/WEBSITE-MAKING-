import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../data/products";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import { ChevronRight, MessageCircle, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

const SIZES = ["36 (S)", "38 (M)", "40 (L)", "42 (XL)", "44 (XXL)"];

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
       setActiveImage(product.image);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Link to="/" className="text-brand-primary underline">Return to shop</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    const message = `Hello Jersey Unicorn! 🦄\n\nI am interested in this jersey:\n*${product.name}*\nPrice: ₹${product.price}\nSize: ${selectedSize}\nQuantity: ${quantity}\nLink: ${window.location.href}\n\nPlease help me with the prepaid order.`;
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

  const galleryImages = product.galleryImages || [product.image];

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
              {/* Main Image with Zoom */}
              <div 
                className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] border border-[#EDE3D8] bg-[#f5f5f5] flex items-center justify-center p-0 overflow-hidden cursor-crosshair relative group"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-200 ease-out"
                  style={zoomStyle}
                />
                
                {/* Zoom Hint */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] rounded shadow-sm opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
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
                       <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
              ₹{product.price}
            </p>

            <div className="space-y-8 mb-10 border-t border-[#EDE3D8] pt-8">
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

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Size</h3>
                  <button className="text-[10px] text-[#5A2E0F] font-bold uppercase underline tracking-wider hover:opacity-80 transition-opacity">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "py-3 border-2 text-[11px] font-black uppercase transition-all duration-200",
                        selectedSize === size 
                          ? "border-[#5A2E0F] bg-[#5A2E0F] text-white" 
                          : "border-[#EDE3D8] text-[#1A1A1A] hover:border-[#5A2E0F] hover:bg-gray-50"
                      )}
                    >
                      {size.split(" ")[0]}
                      <span className="block text-[9px] mt-0.5">{size.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-[#5A2E0F] text-[11px] font-bold tracking-widest uppercase mt-3">* Please select a size</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Quantity</h3>
                <div className="flex items-center border border-[#EDE3D8] w-fit bg-white">
                  <button 
                    className="px-5 py-3 text-[#1A1A1A] hover:bg-gray-50 font-black transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="px-6 py-3 font-black text-[#1A1A1A] w-16 text-center border-x border-[#EDE3D8]">
                    {quantity}
                  </span>
                  <button 
                    className="px-5 py-3 text-[#1A1A1A] hover:bg-gray-50 font-black transition-colors"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-4">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center space-x-3 bg-[#25D366] hover:bg-[#1EBE55] text-white py-5 font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_8px_20px_rgba(37,211,102,0.2)]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Order on WhatsApp</span>
              </button>
              
              <div className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-6 flex flex-col items-center gap-2">
                 <p>Secure checkout via WhatsApp</p>
                 <p className="text-[#5A2E0F] flex items-center bg-[#5A2E0F]/5 px-3 py-1 mt-1 border border-[#5A2E0F]/10">
                    <ShieldAlert className="w-3 h-3 mr-1.5" /> NO CASH ON DELIVERY
                 </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <InstagramSection />
      <TrustSection />
      <Footer />
    </div>
  );
}
