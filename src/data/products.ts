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
  variantId?: string;
  slug: string;
};

export const categories = [
  {
    id: "tshirts",
    name: "T-SHIRTS",
    description: "Premium quality t-shirts, comfortable and stylish.",
  }
];

const mockImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop"
];

export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Global store for parsed products
let shopifyProductsStore: Product[] = [];

export function parseShopifyProducts(shopifyProducts: any[]): Product[] {
  return shopifyProducts.map(sp => {
    const title = sp.title || '';
    
    // Auto-categorize based on title
    let category = "tshirts"; // default

    const price = parseFloat(sp.variants?.edges[0]?.node?.price?.amount || "0");
    const variantId = sp.variants?.edges[0]?.node?.id || "";
    // extract digits from gid://shopify/ProductVariant/44976826056774
    const rawVariantId = variantId.replace("gid://shopify/ProductVariant/", "");
    const images = sp.images?.edges.map((e: any) => e.node.url) || [];
    const mainImage = images[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";
    
    return {
      id: sp.id, // Using Shopify base64 ID directly works with React Router params
      name: title,
      price: price,
      image: mainImage,
      galleryImages: images.length > 0 ? images : [mainImage],
      category: category,
      description: sp.description || "Premium quality t-shirt. Comfortable and stylish.",
      variantId: rawVariantId,
      slug: generateProductSlug(title)
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
        
        shopifyProductsStore = parsed;
        setProducts(parsed);
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
export const getProductById = (idOrSlug: string, currentProducts: Product[]) => {
  const decoded = decodeURIComponent(idOrSlug || "");
  return currentProducts.find(
    p =>
      p.id === decoded ||
      p.id.replace("gid://shopify/Product/", "") === decoded ||
      p.slug === decoded
  );
};
export const getProductsByCategory = (categoryId: string, currentProducts: Product[]) => currentProducts.filter(p => p.category === categoryId);
