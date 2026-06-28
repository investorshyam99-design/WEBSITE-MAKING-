import React from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-[#1B1B1B] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold uppercase tracking-widest text-sm">Size Guide</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-[#1B1B1B] uppercase tracking-wider mb-2">Fit Recommendation</h4>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Our Fan Version jerseys feature a standard athletic fit. If you prefer a relaxed, looser fit or plan to layer, we recommend sizing up.
            </p>
          </div>
          
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#722F37]">
                <th className="py-3 font-bold uppercase text-[#722F37] tracking-wider">Size</th>
                <th className="py-3 font-bold uppercase text-[#722F37] tracking-wider">Chest (Inches)</th>
                <th className="py-3 font-bold uppercase text-[#722F37] tracking-wider">Length (Inches)</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 font-medium">
              <tr className="border-b border-gray-100"><td className="py-3 font-black">S</td><td className="py-3">36 - 38</td><td className="py-3">27</td></tr>
              <tr className="border-b border-gray-100 bg-gray-50"><td className="py-3 font-black">M</td><td className="py-3">38 - 40</td><td className="py-3">28</td></tr>
              <tr className="border-b border-gray-100"><td className="py-3 font-black">L</td><td className="py-3">40 - 42</td><td className="py-3">29</td></tr>
              <tr className="border-b border-gray-100 bg-gray-50"><td className="py-3 font-black">XL</td><td className="py-3">42 - 44</td><td className="py-3">30</td></tr>
              <tr className="border-b border-gray-100"><td className="py-3 font-black">XXL</td><td className="py-3">44 - 46</td><td className="py-3">31</td></tr>
            </tbody>
          </table>
          <div className="mt-6 text-xs text-gray-500 font-medium text-center">
            Measurements are approximate and can vary by 0.5 - 1 inch.
          </div>
        </div>
      </div>
    </div>
  );
}
