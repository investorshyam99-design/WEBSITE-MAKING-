import { Header } from "../components/Header";
import { CategoryNav } from "../components/CategoryNav";
import { Hero } from "../components/Hero";
import { CategoriesSection } from "../components/CategoriesSection";
import { TrustSection } from "../components/TrustSection";
import { InstagramSection } from "../components/InstagramSection";
import { Footer } from "../components/Footer";

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
