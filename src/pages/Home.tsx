import { Header } from "../components/Header";
import { CategoryNav } from "../components/CategoryNav";
import { Hero } from "../components/Hero";
import { CategoriesSection } from "../components/CategoriesSection";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Jersey Unicorn | Gen Z Streetwear & Oversized Back-Print Tees"
        description="Buy premium oversized back-print quote t-shirts in India. Bold banter tees for football, F1, anime, music artists, and wordplay. Elevate your street style."
        keywords="football fan tees india, f1 tees india, anime tshirts india, artist graphic tees india, quote tshirts india, oversized back print tees india, gen z streetwear india"
      />
      <Header />
      <main className="flex-grow">
        <Hero />
        <CategoryNav />
        <InstagramSection />
        <CategoriesSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
