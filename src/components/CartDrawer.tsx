import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart } = useShop();

  if (!isCartOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#EDE3D8]">
          <h2 className="text-xl font-black uppercase text-[#5A2E0F] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="font-medium">Your cart is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 bg-[#5A2E0F] text-white px-6 py-3 font-bold uppercase tracking-widest text-xs"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                  <div className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm uppercase text-[#1A1A1A]">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}</p>
                        {item.selectedSize && (
                          <p className="text-xs font-semibold mt-1">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-black text-[#5A2E0F]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-[#EDE3D8] p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-600 uppercase text-sm">Subtotal</span>
              <span className="font-black text-xl text-[#5A2E0F]">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-4 text-center">Shipping & taxes calculated at checkout</p>
            <button 
              className="w-full bg-[#25D366] text-white py-4 font-black uppercase tracking-widest hover:bg-[#20bd5a] transition-colors flex justify-center items-center gap-2"
              onClick={() => {
                let message = `Hello Jersey Unicorn! 🦄\n\nI would like to order the following items:\n\n`;
                cart.forEach((item, index) => {
                  message += `${index + 1}. *${item.name}*\n   Size: ${item.selectedSize}\n   Qty: ${item.quantity}\n   Price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n\n`;
                });
                message += `*Total Subtotal: ₹${total.toLocaleString('en-IN')}*\n\nPlease help me complete this order.`;
                
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/918788965436?text=${encodedMessage}`, '_blank');
              }}
            >
              Checkout via WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
