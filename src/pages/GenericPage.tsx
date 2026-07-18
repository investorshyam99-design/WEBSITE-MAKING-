import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function GenericPage() {
  const { id } = useParams();

  const content = useMemo(() => {
    switch (id) {
      case 'about-us': return { title: 'About Us', text: 'Jersey Unicorn is the ultimate destination for premium Gen Z streetwear, football jerseys, and bold quote tees. We believe in high quality, heavy cotton, and bringing global fashion trends to India.' };
      case 'contact-us': return { title: 'Contact Us', text: 'Have questions? We are here to help.\nEmail: support@jerseyunicorn.com\nPhone: +91 99999 99999' };
      case 'faqs': return { title: 'FAQs', text: '1. How long does shipping take?\nUsually 5-7 business days across India.\n\n2. Can I exchange my order?\nYes, within 7 days of delivery.' };
      case 'size-guide': return { title: 'Size Guide', text: 'Our tees are oversized. If you prefer a regular fit, please size down. Jerseys are true to size. Please refer to individual product pages for detailed charts.' };
      case 'exchange-return-policy': return { title: 'Exchange & Return Policy', text: 'We offer a 7-day hassle-free return and exchange policy. Items must be unused and in original condition with tags attached.' };
      case 'shipping-policy': return { title: 'Shipping Policy', text: 'Free shipping on all prepaid orders. COD orders have a nominal handling fee. Orders are dispatched within 24-48 hours.' };
      case 'privacy-policy': return { title: 'Privacy Policy', text: 'We value your privacy. Your data is secure with us and we do not sell your personal information to third parties.' };
      case 'terms-conditions': return { title: 'Terms & Conditions', text: 'By using this website, you agree to our terms of service and conditions. Jersey Unicorn reserves the right to cancel orders.' };
      default: return { title: 'Page Not Found', text: 'The page you are looking for does not exist.' };
    }
  }, [id]);

  return (
    <>
      <SEO title={`${content.title} | Jersey Unicorn`} description={content.text.substring(0, 150)} />
      <Header />
      <main className="min-h-screen bg-gray-50 pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mt-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 text-black">{content.title}</h1>
          <div className="prose prose-lg text-gray-700 whitespace-pre-wrap">
            {content.text}
          </div>
          {id === 'not-found' && (
            <Link to="/" className="inline-block mt-8 bg-black text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
              Return Home
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
