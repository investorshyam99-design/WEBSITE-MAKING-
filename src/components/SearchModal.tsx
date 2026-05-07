import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts, Product } from "../data/products";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { products } = useProducts();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-md flex flex-col">
      <div className="p-4 md:p-8 flex items-center gap-4 max-w-7xl mx-auto w-full border-b border-[#EDE3D8]">
        <Search className="h-6 w-6 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none text-xl md:text-3xl font-black uppercase tracking-tight text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-0"
        />
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-[#1A1A1A]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        {query && results.length === 0 ? (
          <p className="text-gray-500 text-center mt-12 font-medium">
            No products found matching "{query}"
          </p>
        ) : query ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${encodeURIComponent(product.id)}`}
                onClick={onClose}
                className="group flex flex-col gap-2"
              >
                <div className="aspect-[3/4] bg-gray-50 overflow-hidden border border-[#EDE3D8]">
                  <img
                    src={product.image || undefined}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase truncate text-[#1A1A1A] group-hover:text-[#5A2E0F] transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-black text-sm text-[#5A2E0F]">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-12 md:mt-24 text-gray-300">
            <Search className="h-16 w-16 mb-4" />
            <p className="text-lg font-bold uppercase tracking-wider">Start typing to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
