import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';

export function PolicyPage() {
  return (
    <>
      <SEO title="Policies | Jersey Unicorn" description="Shipping, Exchange, and Order policies for Jersey Unicorn." />
      <Header />
      <main className="min-h-screen bg-black text-white pt-24 pb-20 font-sans selection:bg-white selection:text-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12">
            JERSEY UNICORN Policies
          </h1>

          <div className="space-y-8">
            {/* Shipping Policy */}
            <section className="bg-[#111] p-6 md:p-8 rounded-2xl border border-[#222]">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
                SHIPPING POLICY
              </h2>
              <p className="text-gray-400 mb-4 text-sm md:text-base">We ship all orders through Delhivery.</p>
              <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300">
                <li>Orders are dispatched within 24 hours.</li>
                <li>Estimated delivery time is 5–7 business days depending on your location.</li>
                <li>Once your order is dispatched, your tracking number will be shared on your WhatsApp number.</li>
              </ul>
            </section>

            {/* Exchange Policy */}
            <section className="bg-[#111] p-6 md:p-8 rounded-2xl border border-[#222]">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
                EXCHANGE POLICY
              </h2>
              <p className="text-gray-400 mb-4 text-sm md:text-base">We offer exchanges under the following conditions:</p>
              <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300">
                <li>Size exchanges are available within 24 hours of delivery.</li>
                <li>Customized jerseys (Name & Number) are NOT eligible for exchange.</li>
                <li>Customers are responsible for the shipping charges for size exchanges.</li>
                <li>A complete, uncut unboxing video is mandatory for all exchange requests.</li>
                <li>Wrong product, damaged product, or manufacturing defect cases will be reviewed and exchanged after verification.</li>
              </ul>
            </section>

            {/* Product Information */}
            <section className="bg-[#111] p-6 md:p-8 rounded-2xl border border-[#222]">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
                PRODUCT INFORMATION
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Our jerseys are recirculated among football fans and collectors. Product availability may vary based on demand.
              </p>
            </section>

            {/* Order Cancellation */}
            <section className="bg-[#111] p-6 md:p-8 rounded-2xl border border-[#222]">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4">
                ORDER CANCELLATION
              </h2>
              <p className="text-gray-400 mb-4 text-sm md:text-base">
                JERSEY UNICORN reserves the right to cancel any order in cases including, but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-300 mb-4">
                <li>Product unavailable</li>
                <li>Pricing or listing errors</li>
                <li>Suspected fraudulent activity</li>
                <li>Duplicate or suspicious orders</li>
                <li>Operational issues beyond our control</li>
              </ul>
              <p className="text-gray-400 text-sm md:text-base">
                If an order is cancelled after payment, the eligible amount will be refunded to the original payment method.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
