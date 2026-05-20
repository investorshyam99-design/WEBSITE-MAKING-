import { useEffect, useState } from 'react';
import { fetchShopifyProducts } from '../services/shopify';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  galleryImages: string[];
  category: string;
  description?: string;
};

export const categories = [
  {
    id: "fan",
    name: "FAN VERSION",
    description: "Embroidered logos, comes with shorts, made in Thailand.",
  },
  {
    id: "player",
    name: "PLAYER VERSION",
    description: "Jersey that players wear, heat-pressed logos, made in Thailand.",
  },
  {
    id: "master",
    name: "MASTER VERSION",
    description: "Upgraded version of fan version, premium finishing, made in Thailand.",
  },
  {
    id: "indian",
    name: "INDIAN EMBROIDERY",
    description: "Made in India, embroidered finish, budget-friendly.",
  },
  {
    id: "sublimation",
    name: "SUBLIMATION JERSEY",
    description: "Printed logos, lightweight, affordable pricing.",
  },
];

const mockImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop"
];

// Global store for parsed products
let shopifyProductsStore: Product[] = [];

export function parseShopifyProducts(shopifyProducts: any[]): Product[] {
  return shopifyProducts.map(sp => {
    const title = sp.title || '';
    
    // Auto-categorize based on title
    let category = "fan"; // default
    if (title.toLowerCase().includes("player")) category = "player";
    if (title.toLowerCase().includes("master")) category = "master";
    if (title.toLowerCase().includes("sublimation") || title.toLowerCase().includes("sublimition")) category = "sublimation";
    if (title.toLowerCase().includes("indian") || title.toLowerCase().includes("embroidery")) category = "indian";
    if (title.toLowerCase().includes("tshirt") || title.toLowerCase().includes("tee")) category = "tshirts";

    const price = parseFloat(sp.variants?.edges[0]?.node?.price?.amount || "0");
    const images = sp.images?.edges.map((e: any) => e.node.url) || [];
    const mainImage = images[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";
    
    return {
      id: sp.id, // Using Shopify base64 ID directly works with React Router params
      name: title,
      price: price,
      image: mainImage,
      galleryImages: images.length > 0 ? images : [mainImage],
      category: category,
      description: sp.description || "Premium quality football jersey. Express your passion for the game."
    };
  });
}

// React Hook to fetch and provide products
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(shopifyProductsStore);
  const [isLoading, setIsLoading] = useState(shopifyProductsStore.length === 0);

  useEffect(() => {
    if (shopifyProductsStore.length > 0) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    fetchShopifyProducts().then((data) => {
      if (!isMounted) return;
      if (data && data.length > 0) {
        const parsed = parseShopifyProducts(data);
        
        // Prioritize specific jerseys to the top
        const sortedParsed = parsed.sort((a, b) => {
          const getPriority = (product: Product) => {
            let priority = 0;
            const lowerName = product.name.toLowerCase();

            // Deprioritize full sleeve jerseys so they appear at the bottom
            if (lowerName.includes("full sleeve") || lowerName.includes("full-sleeve") || lowerName.includes("long sleeve") || lowerName.includes("long-sleeve")) {
              priority -= 1000;
            }

            if (product.category === "player") {
              if (lowerName.includes("spain") && product.price === 999) priority += 100;
              else if (lowerName.includes("spain")) priority += 95;
              else if (lowerName.includes("argentina") && product.price === 899) priority += 90;
              else if (lowerName.includes("argentina")) priority += 85;
              else if (lowerName.includes("japan")) priority += 80;
              else if (lowerName.includes("portugal")) priority += 70;
              else if (lowerName.includes("brazil")) priority += 60;
              else if (lowerName.includes("real madrid")) priority += 50;
              else if (lowerName.includes("manchester united") || lowerName.includes("man utd")) priority += 40;
            }

            return priority;
          };
          return getPriority(b) - getPriority(a);
        });

        shopifyProductsStore = sortedParsed;
        setProducts(sortedParsed);
      }
      setIsLoading(false);
    }).catch((err) => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return { products, isLoading };
}

// For accessing products outside of components if immediately needed, 
// but it is recommended to use the hook or wait for shopifyProductsStore to populate.
export const getProductById = (id: string, currentProducts: Product[]) => currentProducts.find(p => p.id === id);
export const getProductsByCategory = (categoryId: string, currentProducts: Product[]) => currentProducts.filter(p => p.category === categoryId);
