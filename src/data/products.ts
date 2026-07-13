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
  variants?: { id: string; title: string; color?: string | null; image?: string; availableForSale: boolean }[];
  slug: string;
};

export const categories = [
  {
    id: "football",
    name: "FOOTBALL",
    seoTitle: "Football Banter Tees | Oversized Football T-Shirts India",
  },
  {
    id: "formula1",
    name: "FORMULA 1",
    seoTitle: "F1 Fan Tees India | Formula 1 Oversized Streetwear",
  },
  {
    id: "anime",
    name: "ANIME",
    seoTitle: "Anime Tees India | Gen Z Oversized Anime Graphic T-Shirts",
  },
  {
    id: "artists",
    name: "ARTISTS",
    seoTitle: "Artist Tees India | Music Artist & Rapper Oversized T-Shirts",
  },
  {
    id: "word-drip",
    name: "WORD DRIP",
    seoTitle: "Worddrip Tees | Gen Z Quote & Wordplay T-Shirts India",
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


export function parseShopifyProducts(nodes: any[]): Product[] {
  return nodes.map((node) => {
    let price = 0;
    const variants = (node.variants?.edges || []).map((vEdge: any) => {
        const v = vEdge.node;
        if (price === 0 && v.price?.amount) {
            price = parseFloat(v.price.amount);
        }
        
        const colorOption = v.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
        const sizeOption = v.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'size');
        const parsedTitle = sizeOption ? sizeOption.value : (v.title.includes(' / ') ? v.title.split(' / ').pop() : v.title);

        return {
            id: v.id,
            title: parsedTitle,
            color: colorOption ? colorOption.value : null,
            image: v.image?.url || null,
            availableForSale: v.availableForSale
        };
    });

    const galleryImages = (node.images?.edges || []).map((imgEdge: any) => imgEdge.node.url);
    const mainImage = galleryImages.length > 0 ? galleryImages[0] : (variants.length > 0 && variants[0].image ? variants[0].image : mockImages[0]);

    const tags = (node.tags || []).map((t: string) => t.toLowerCase());
    let category = 'football';
    
    const bracketMatch = node.title.match(/\((.*?)\)/);
    
    if (bracketMatch) {
      const bracketCategory = bracketMatch[1].toLowerCase();
      if (bracketCategory === 'f1' || bracketCategory === 'formula 1' || bracketCategory === 'formula1' || bracketCategory === 'formula-1') category = 'formula1';
      else if (bracketCategory === 'football') category = 'football';
      else if (bracketCategory === 'anime') category = 'anime';
      else if (bracketCategory === 'artists' || bracketCategory === 'artist') category = 'artists';
      else if (bracketCategory === 'word drip' || bracketCategory === 'word-drip') category = 'word-drip';
      else category = bracketCategory.replace(/\s+/g, '-');
    } else {
      const matchingTag = tags.find(t => 
        ['football', 'formula1', 'formula-1', 'anime', 'artists', 'artist', 'word-drip', 'word drip', 'word_drip'].includes(t)
      );

      if (matchingTag) {
        if (matchingTag === 'formula-1') category = 'formula1';
        else if (matchingTag === 'artist') category = 'artists';
        else if (matchingTag === 'word drip' || matchingTag === 'word_drip') category = 'word-drip';
        else category = matchingTag;
      } else {
        category = node.productType?.toLowerCase() || 'football';
      }
    }

    return {
      id: node.id,
      name: node.title,
      price: price,
      image: mainImage,
      galleryImages: galleryImages,
      category: category,
      description: node.description,
      descriptionHtml: node.descriptionHtml,
      variants: variants,
      slug: generateProductSlug(node.title),
    };
  });
}

// Global store for parsed products
let shopifyProductsStore: Product[] = [];
let fetchPromise: Promise<any> | null = null;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(shopifyProductsStore);
  const [isLoading, setIsLoading] = useState(shopifyProductsStore.length === 0);

  useEffect(() => {
    if (shopifyProductsStore.length > 0) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    
    if (!fetchPromise) {
        fetchPromise = fetchShopifyProducts().then((data) => {
            if (data && data.length > 0) {
              const parsed = parseShopifyProducts(data);
              shopifyProductsStore = parsed;
              return parsed;
            }
            return [];
        }).catch(() => {
            fetchPromise = null;
            return [];
        });
    }

    fetchPromise.then((parsed) => {
        if (!isMounted) return;
        if (parsed.length > 0) {
            setProducts(parsed);
        }
        setIsLoading(false);
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
