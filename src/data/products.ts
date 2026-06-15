import { useEffect, useState } from "react";
import { fetchShopifyProducts } from "../services/shopify";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  galleryImages: string[];
  category: string;
  description?: string;
  descriptionHtml?: string;
  variantId?: string;
  variants?: { id: string; title: string; availableForSale: boolean }[];
  slug: string;
};

export const categories = [
  {
    id: "football",
    name: "FOOTBALL",
    description: "Football jerseys and merchandise",
  },
  {
    id: "cricket",
    name: "CRICKET",
    description: "Cricket jerseys and merchandise",
  },
  {
    id: "basketball",
    name: "BASKETBALL",
    description: "Basketball jerseys and merchandise",
  },
  {
    id: "formula1",
    name: "FORMULA 1",
    description: "Formula 1 merchandise",
  },
];

const mockImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop",
];

export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Global store for parsed products
let shopifyProductsStore: Product[] = [];

export function parseShopifyProducts(shopifyProducts: any[]): Product[] {
  const parsed = shopifyProducts.map((sp) => {
    const title = sp.title || "";

    // Auto-categorize based on title, type or tags
    let category = "football"; // default
    const titleLower = title.toLowerCase();
    const productType = (sp.productType || "").toLowerCase();
    const tags = (sp.tags || []).map((t: string) => t.toLowerCase());

    const isCricket = titleLower.includes("cricket") || productType.includes("cricket") || tags.includes("cricket") || tags.includes("ipl");
    const isBasketball = titleLower.includes("basketball") || productType.includes("basketball") || tags.includes("basketball") || tags.includes("nba");
    const isFormula1 = titleLower.includes("formula 1") || titleLower.includes("f1") || productType.includes("formula 1") || productType.includes("f1") || tags.includes("formula 1") || tags.includes("f1");

    if (isFormula1) category = "formula1";
    else if (isBasketball) category = "basketball";
    else if (isCricket) category = "cricket";

    const price = parseFloat(sp.variants?.edges[0]?.node?.price?.amount || "0");
    const variantId = sp.variants?.edges[0]?.node?.id || "";
    // extract digits from gid://shopify/ProductVariant/44976826056774
    const rawVariantId = variantId.replace("gid://shopify/ProductVariant/", "");
    const images = sp.images?.edges.map((e: any) => e.node.url) || [];
    const mainImage =
      images[0] ||
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop";

    // Extract variants
    const productVariants =
      sp.variants?.edges.map((e: any) => {
        const v = e.node;
        let sizeTitle = v.title;
        if (v.selectedOptions) {
          const sizeOption = v.selectedOptions.find(
            (opt: any) => opt.name.toLowerCase() === "size",
          );
          if (sizeOption) {
            sizeTitle = sizeOption.value;
          }
        } else if (v.title.includes("/")) {
          // Fallback for simple split
          const parts = v.title.split("/");
          // Assuming size is usually the last part or shorter part
          sizeTitle = parts[parts.length - 1].trim();
        }

        return {
          id: v.id.replace("gid://shopify/ProductVariant/", ""),
          title: sizeTitle,
          availableForSale: v.availableForSale,
        };
      }) || [];

    return {
      id: sp.id, // Using Shopify base64 ID directly works with React Router params
      name: title,
      price: price,
      image: mainImage,
      galleryImages: images.length > 0 ? images : [mainImage],
      category: category,
      description:
        sp.description || "Premium quality t-shirt. Comfortable and stylish.",
      descriptionHtml: sp.descriptionHtml,
      variantId: rawVariantId,
      variants: productVariants,
      slug: generateProductSlug(title),
    };
  });

  return parsed.sort((a, b) => {
    const aIsSpain =
      a.name.toLowerCase().includes("spain") &&
      a.name.toLowerCase().includes("away");
    const bIsSpain =
      b.name.toLowerCase().includes("spain") &&
      b.name.toLowerCase().includes("away");
    if (aIsSpain && !bIsSpain) return -1;
    if (!aIsSpain && bIsSpain) return 1;
    return 0;
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
    fetchShopifyProducts()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          const parsed = parseShopifyProducts(data);

          shopifyProductsStore = parsed;
          setProducts(parsed);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, isLoading };
}

// For accessing products outside of components if immediately needed,
// but it is recommended to use the hook or wait for shopifyProductsStore to populate.
export const getProductById = (
  idOrSlug: string,
  currentProducts: Product[],
) => {
  const decoded = decodeURIComponent(idOrSlug || "");
  return currentProducts.find(
    (p) =>
      p.id === decoded ||
      p.id.replace("gid://shopify/Product/", "") === decoded ||
      p.slug === decoded,
  );
};
export const getProductsByCategory = (
  categoryId: string,
  currentProducts: Product[],
) => currentProducts.filter((p) => p.category === categoryId);
