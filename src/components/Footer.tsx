import { useState } from "react";
import { PoliciesModal } from "./PoliciesModal";
import { Instagram, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);

  return (
    <>
      <footer id="footer" className="bg-[#111] text-gray-400 py-16 md:py-24 border-t border-[#333]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            {/* Brand */}
            <div className="lg:col-span-1">
              <h2 className="text-white text-xl font-black tracking-tighter uppercase mb-6 flex items-center gap-2">
                 <img src="https://i.imgur.com/VaSs3Xd.png" alt="Logo" className="w-8 h-8 rounded-full object-cover grayscale brightness-200" />
                 Jersey Unicorn
              </h2>
              <p className="text-sm leading-relaxed mb-6">
                Redefining football culture in India. Premium fan versions engineered for true supporters.
              </p>
              <div className="flex gap-4">
                 <a href="https://www.instagram.com/jerseyunicorn1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Instagram">
                    <Instagram className="w-5 h-5" />
                 </a>
                 <a href="https://chat.whatsapp.com/GttFwR2h8iL2gOKJ3iJ4rK" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="WhatsApp Group">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                    </svg>
                 </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Shop</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/orders" className="hover:text-white transition-colors flex items-center justify-between group">Track Order <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" /></Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">All Products</Link></li>
                <li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors flex items-center justify-between w-full group text-left">FAQ <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" /></button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">Shipping Policy</button></li>
                <li><button onClick={() => setIsPoliciesOpen(true)} className="hover:text-white transition-colors">Exchange Policy</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Contact Us</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex gap-3 items-start">
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <a href="https://wa.me/918788965436" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    +91 87889 65436<br/>
                    <span className="text-xs text-gray-500">Available on WhatsApp</span>
                  </a>
                </li>
                <li className="flex gap-3 items-center">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href="mailto:jerseyunicorn1@gmail.com" className="hover:text-white transition-colors">
                    jerseyunicorn1@gmail.com
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p className="uppercase tracking-widest">© {new Date().getFullYear()} Jersey Unicorn. All Rights Reserved.</p>
            <div className="flex gap-4">
              <span className="opacity-50">Designed for true fans.</span>
            </div>
          </div>
        </div>
      </footer>
      <PoliciesModal isOpen={isPoliciesOpen} onClose={() => setIsPoliciesOpen(false)} />
    </>
  );
}
