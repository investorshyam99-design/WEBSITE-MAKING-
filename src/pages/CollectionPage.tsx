import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { useProducts, getProductsByCategory } from '../data/products';
import { Filter, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { COLLECTION_SEO_DATA, CollectionSEOConfig } from '../lib/seoData';

export function CollectionPage() {
  const { products, isLoading } = useProducts();
  const { id = "all" } = useParams();
  const [sortBy, setSortBy] = useState('featured');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Get collection SEO configuration
  const collectionSEO: CollectionSEOConfig = useMemo(() => {
    if (COLLECTION_SEO_DATA[id]) {
      return COLLECTION_SEO_DATA[id];
    }
    // Dynamic fallback for any unlisted collection slug
    const formattedName = id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id,
      h1: `${formattedName} Football Jerseys Online in India`,
      title: `${formattedName} Football Jerseys India – Jersey Unicorn`,
      description: `Buy premium ${formattedName} football jerseys and fan sets in India. Player version, master retro & World Cup kits. Fast delivery & COD. Shop now!`,
      intro: `Upgrade your kit rotation with Jersey Unicorn's official ${formattedName} collection in India! Engineered with high-grade moisture-wicking fabric, authentic badges, and comfortable athletic fits, these jerseys are designed for die-hard fans and streetwear fashion flexes. Rep your team with pride on matchdays, turf games, or casual city outings. Enjoy fast shipping and cash on delivery across India when you order today!`,
      searchTerm: id.replace(/-/g, ' '),
      faqs: [
        {
          question: `How long does delivery take for ${formattedName} jerseys in India?`,
          answer: "Orders are dispatched within 24 hours and delivered within 5–7 business days across India with live WhatsApp tracking."
        },
        {
          question: `Are these ${formattedName} jerseys available in Cash on Delivery (COD)?`,
          answer: "Yes, COD is available across all Indian pincodes with a small ₹50 advance confirmation payment per item."
        },
        {
          question: `What sizes are available for ${formattedName} kits?`,
          answer: "We offer Small (S), Medium (M), Large (L), Extra Large (XL), and Double Extra Large (XXL)."
        }
      ]
    };
  }, [id]);

  // Filter products for this collection
  const collectionProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [...products];

    if (collectionSEO.categoryFilter) {
      filtered = getProductsByCategory(collectionSEO.categoryFilter, products);
    } else if (collectionSEO.searchTerm) {
      const term = collectionSEO.searchTerm.toLowerCase();
      filtered = products.filter(p => p.name.toLowerCase().includes(term));
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, collectionSEO, sortBy]);

  // Generate Schemas
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collectionSEO.h1,
    description: collectionSEO.description,
    url: `https://jerseyunicorn.com/collection/${id}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://jerseyunicorn.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Collections",
        item: "https://jerseyunicorn.com/collection/all",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: collectionSEO.h1,
        item: `https://jerseyunicorn.com/collection/${id}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: collectionSEO.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <SEO 
        title={collectionSEO.title}
        description={collectionSEO.description}
        canonicalUrl={`https://jerseyunicorn.com/collection/${id}`}
        schemas={[collectionSchema, breadcrumbSchema, faqSchema]}
      />
      <Header />
      
      <main className="min-h-screen bg-black text-white pt-8 pb-20 font-sans selection:bg-white selection:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <Link to="/collection/all" className="hover:text-white transition-colors">Collections</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-white">{id}</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-[#111] rounded-2xl p-8 md:p-12 mb-8 border border-[#222] text-center max-w-4xl mx-auto shadow-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-tight">
              {collectionSEO.h1}
            </h1>
            <p className="text-gray-300 font-medium leading-relaxed text-sm sm:text-base max-w-3xl mx-auto">
              {collectionSEO.intro}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#111] p-4 rounded-xl mb-8 gap-4 border border-[#222]">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-gray-400" />
              <span>{collectionProducts.length} Items Found</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#222] border border-[#333] text-white text-xs font-bold rounded-lg px-3 py-2 outline-none uppercase cursor-pointer hover:bg-[#2a2a2a] transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : collectionProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#111] rounded-2xl border border-[#222] mb-16">
              <h3 className="text-xl font-black uppercase text-white mb-2">No Products Found</h3>
              <p className="text-gray-400 font-medium mb-6 text-sm">We couldn't find any products in this specific category.</p>
              <Link to="/collection/all" className="inline-block bg-white text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors">
                Explore All Products
              </Link>
            </div>
          )}

          {/* FAQ Block with FAQPage Schema */}
          {collectionSEO.faqs && collectionSEO.faqs.length > 0 && (
            <section className="bg-[#111] rounded-2xl p-6 md:p-10 border border-[#222] max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6 border-b border-[#222] pb-4">
                <HelpCircle className="w-6 h-6 text-gray-400" />
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-4">
                {collectionSEO.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-[#222] rounded-xl overflow-hidden bg-[#161616]">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#1a1a1a] transition-colors"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 sm:p-5 pt-0 text-gray-300 text-xs sm:text-sm leading-relaxed border-t border-[#222]/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>
      
      <Footer />
    </>
  );
}
