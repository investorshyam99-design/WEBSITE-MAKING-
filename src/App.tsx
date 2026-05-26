/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIAssistant } from "./components/AIAssistant";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ShopProvider } from "./context/ShopContext";
import { CartModal } from "./components/CartModal";

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <AIAssistant />
        <CartModal />
      </Router>
    </ShopProvider>
  );
}
