import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { useProducts, getProductsByCategory } from '../data/products';
import { ArrowLeft, Filter, SlidersHorizontal } from 'lucide-react';

export function CollectionPage() {
  const { products, loading, error } = useProducts();
  const { id } = useParams();
  const [sortBy, setSortBy] = useState('featured');
  
  // Map slugs to category IDs or search terms
  const collectionData = useMemo(() => {
    switch (id) {
      case 'player-version': return { title: 'Player Version Jerseys', category: 'player-version', desc: 'Authentic player issue jerseys.' };
      case 'master-version': return { title: 'Master Version Jerseys', category: 'master-version', desc: 'Premium quality master version jerseys.' };
      case 'fan-version': return { title: 'Fan Version Jerseys', category: 'fan-set', desc: 'Comfortable fan version jerseys.' };
      case 't-shirts': return { title: 'Oversized T-Shirts', category: 'tees', desc: 'Streetwear oversized tees.' };
      case 'football': return { title: 'Football Collection', category: 'football', desc: 'All football merchandise.' };
      case 'formula-1': return { title: 'Formula 1 Collection', category: 'f1', desc: 'Formula 1 merchandise.' };
      case 'anime': return { title: 'Anime Collection', category: 'anime', desc: 'Anime inspired streetwear.' };
      case 'worddrip': return { title: 'WordDrip Collection', category: 'worddrip', desc: 'Quote t-shirts and streetwear.' };
      case 'new-arrivals': return { title: 'New Arrivals', category: 'all', desc: 'Latest drops.' };
      case 'best-sellers': return { title: 'Best Sellers', category: 'all', desc: 'Most popular items.' };
      default: return { title: 'Shop All', category: 'all', desc: 'Browse our full collection.' };
    }
  }, [id]);

  let collectionProducts = [];
  if (collectionData.category === 'all') {
    collectionProducts = [...products];
  } else if (['player-version', 'master-version', 'fan-set', 'tees'].includes(collectionData.category)) {
    collectionProducts = getProductsByCategory(collectionData.category, products);
  } else {
    // text search
    collectionProducts = products.filter(p => p.name.toLowerCase().includes(collectionData.category));
  }

  // Sort
  if (sortBy === 'price-low') {
    collectionProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    collectionProducts.sort((a, b) => b.price - a.price);
  }

  // Generate SEO schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collectionData.title,
    "description": collectionData.desc,
    "url": `https://jerseyunicorn.com/collections/${id}`,
  };

  return (
    <>
      <SEO 
        title={`${collectionData.title} | Jersey Unicorn`}
        description={collectionData.desc}
      />
      <Header />
      
      <main className="min-h-screen bg-gray-50 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{collectionData.title}</span>
          </nav>

          {/* Hero */}
          <div className="bg-black text-white rounded-2xl p-8 md:p-12 mb-8 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">{collectionData.title}</h1>
            <p className="text-gray-400 font-medium max-w-2xl">{collectionData.desc}</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-8 gap-4 border border-gray-100">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Filter className="w-4 h-4" />
              {collectionProducts.length} Products
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 uppercase">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-sm font-bold rounded-lg px-3 py-2 outline-none uppercase"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : collectionProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black uppercase text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-500 font-medium mb-6">We couldn't find any products in this collection.</p>
              <Link to="/" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
