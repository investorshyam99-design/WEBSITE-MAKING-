/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProductPage } from "./pages/ProductPage";
import { ShopProvider } from "./context/ShopContext";

function RouteHandler() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");

  if (productId) {
    return <Navigate to={`/product/${productId}`} replace />;
  }

  return <Home />;
}

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RouteHandler />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </Router>
    </ShopProvider>
  );
}
