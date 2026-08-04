import { Header } from "../components/Header";
import { CategoryNav } from "../components/CategoryNav";
import { Hero } from "../components/Hero";
import { CategoriesSection } from "../components/CategoriesSection";
import { TrustSection } from "../components/TrustSection";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Buy Football Jerseys Online India | Jersey Unicorn"
        description="Buy premium football jerseys & fan sets in India. World Cup 2026, player versions, master retro kits & streetwear. Fast delivery & COD. Shop now!"
        keywords="buy football jersey online India, Argentina World Cup 2026 jersey, Portugal 60th anniversary set, retro football jersey India, player version jersey India, football jersey with shorts set India"
        canonicalUrl="https://jerseyunicorn.com"
        isHome={true}
      />
      <Header />
      <main className="flex-grow">
        <Hero />
        <CategoryNav />
        <CategoriesSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
