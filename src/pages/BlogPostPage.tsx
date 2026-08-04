import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BLOG_POSTS } from '../data/blogs';
import { Calendar, User, Tag, ArrowLeft, ShoppingBag } from 'lucide-react';

export function BlogPostPage() {
  const { slug } = useParams();

  const post = useMemo(() => {
    return BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];
  }, [slug]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: [post.image],
    datePublished: post.publishDate,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Jersey Unicorn",
      logo: {
        "@type": "ImageObject",
        url: "https://i.imgur.com/VaSs3Xd.png"
      }
    },
    description: post.metaDescription,
    mainEntityOfPage: `https://jerseyunicorn.com/blog/${post.slug}`
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
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://jerseyunicorn.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <SEO 
        title={post.seoTitle}
        description={post.metaDescription}
        image={post.image}
        canonicalUrl={`https://jerseyunicorn.com/blog/${post.slug}`}
        schemas={[articleSchema, breadcrumbSchema]}
      />
      <Header />
      <main className="min-h-screen bg-black text-white pt-8 pb-20 font-sans selection:bg-white selection:text-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back & Breadcrumb */}
          <div className="flex items-center justify-between mb-8">
            <nav className="flex text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2 text-gray-600">/</span>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-white truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
            </nav>

            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Articles</span>
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <span className="inline-block bg-white text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-wider border-y border-[#222] py-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                {post.publishDate}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-500" />
                {post.author}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-10 border border-[#222]">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Article Body */}
          <div 
            className="prose prose-invert max-w-none text-gray-300 text-sm sm:text-base leading-relaxed space-y-6 mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Internal Linking / Related Collections Box */}
          {post.relatedCollections && post.relatedCollections.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 mt-12">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                Shop Mentioned Collections
              </h3>
              <div className="flex flex-wrap gap-3">
                {post.relatedCollections.map((col, idx) => (
                  <Link 
                    key={idx}
                    to={col.path}
                    className="bg-[#222] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-[#333] transition-colors"
                  >
                    {col.name} →
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
