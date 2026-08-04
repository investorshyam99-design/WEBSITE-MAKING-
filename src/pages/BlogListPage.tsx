import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BLOG_POSTS } from '../data/blogs';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';

export function BlogListPage() {
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Jersey Unicorn Football & Kit Culture Blog",
    description: "Guides, kit reviews, size comparisons, and World Cup 2026 news for Indian football fans.",
    url: "https://jerseyunicorn.com/blog",
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
        name: "Blog",
        item: "https://jerseyunicorn.com/blog",
      },
    ],
  };

  return (
    <>
      <SEO 
        title="Football Jersey Guides & Kit News India | Jersey Unicorn Blog"
        description="Read the latest football jersey buying guides, World Cup 2026 kit reviews, Player vs Fan version comparisons & sizing tips in India. Read now!"
        canonicalUrl="https://jerseyunicorn.com/blog"
        schemas={[blogListSchema, breadcrumbSchema]}
      />
      <Header />
      <main className="min-h-screen bg-black text-white pt-8 pb-20 font-sans selection:bg-white selection:text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-white">Blog</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-[#111] rounded-2xl p-8 md:p-12 mb-12 border border-[#222] text-center max-w-4xl mx-auto shadow-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white">
              Jersey Unicorn Football Journal
            </h1>
            <p className="text-gray-300 font-medium leading-relaxed text-sm sm:text-base max-w-2xl mx-auto">
              Your ultimate source for football kit reviews, Player vs Fan version buying guides, World Cup 2026 kit breakdowns, and Indian kit culture.
            </p>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden flex flex-col hover:border-gray-700 transition-all duration-300 group">
                <div className="aspect-video relative overflow-hidden bg-gray-900">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.publishDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
