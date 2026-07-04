/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { OrdersPage } from "./pages/OrdersPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ShopProvider } from "./context/ShopContext";
import { CartModal } from "./components/CartModal";
import { LoginModal } from "./components/LoginModal";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { WhatsAppButton } from "./components/WhatsAppButton";

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="pb-[60px] md:pb-0 min-h-screen flex flex-col bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
          <CartModal />
          <LoginModal />
          <WhatsAppButton />
          <MobileBottomNav />
        </div>
      </Router>
    </ShopProvider>
  );
}
