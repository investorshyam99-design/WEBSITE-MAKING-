import { useState } from "react";
import { PoliciesModal } from "./PoliciesModal";
import { MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
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
                Gen Z oversized back-print quote t-shirts and statement streetwear for Indian youth. Wear the banter.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Shop</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/account" className="hover:text-white transition-colors flex items-center justify-between group">Track Order <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" /></Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">All Products</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Support & Guides</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/pages/about-us" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">Football Journal (Blog)</Link></li>
                <li><Link to="/policy" onClick={() => window.scrollTo(0,0)} className="hover:text-white transition-colors">📄 Policy</Link></li>
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
