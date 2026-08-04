/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { CollectionPage } from "./pages/CollectionPage";
import { GenericPage } from "./pages/GenericPage";
import { PolicyPage } from "./pages/PolicyPage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { AccountPage } from "./pages/AccountPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ShopProvider } from "./context/ShopContext";
import { CartModal } from "./components/CartModal";
import { LoginModal } from "./components/LoginModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { RecentOrdersTicker } from "./components/RecentOrdersTicker";
import { AIChatbot } from "./components/AIChatbot";

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="pb-[60px] md:pb-0 min-h-screen flex flex-col bg-brand-bg text-brand-text">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/collections/:id" element={<CollectionPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/pages/:id" element={<GenericPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <CartModal />
          <LoginModal />
          <MobileBottomNav />
          <RecentOrdersTicker />
          <AIChatbot />
        </div>
      </Router>
    </ShopProvider>
  );
}
