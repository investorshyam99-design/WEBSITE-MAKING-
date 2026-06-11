import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { CategoriesSection } from "../components/CategoriesSection";
import { TrustSection } from "../components/TrustSection";
import { FAQ } from "../components/FAQ";
import { InstagramSection } from "../components/InstagramSection";
import { Footer } from "../components/Footer";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <InstagramSection />
        <CategoriesSection />
        <FAQ />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}
