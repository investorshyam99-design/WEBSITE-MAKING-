import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function WishlistDrawer() {
  const { isWishlistOpen, setIsWishlistOpen, wishlist, toggleWishlist, addToCart } = useShop();
  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsWishlistOpen(false)}
      ></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#EDE3D8]">
          <h2 className="text-xl font-black uppercase text-[#5A2E0F] flex items-center gap-2">
            <Heart className="w-5 h-5 fill-current" /> Wishlist
          </h2>
          <button 
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <Heart className="w-16 h-16 opacity-20" />
              <p className="font-medium">Your wishlist is empty</p>
              <button 
                onClick={() => setIsWishlistOpen(false)}
                className="mt-4 bg-[#5A2E0F] text-white px-6 py-3 font-bold uppercase tracking-widest text-xs"
              >
                Discover Jerseys
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlist.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div 
                    className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => {
                      setIsWishlistOpen(false);
                      navigate(`/product/${item.id}`);
                    }}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm uppercase text-[#1A1A1A]">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => toggleWishlist(item)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="font-black text-[#5A2E0F] mb-3">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                      <button 
                        onClick={() => {
                          addToCart(item);
                        }}
                        className="w-full py-2 border-2 border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
