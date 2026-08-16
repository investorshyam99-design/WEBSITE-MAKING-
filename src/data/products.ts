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
    id: "player-version",
    name: "PLAYER VERSION",
    seoTitle: "Player Version Football Jerseys",
  },
  {
    id: "master-version",
    name: "MASTER VERSION",
    seoTitle: "Master Version Football Jerseys",
  },
  {
    id: "fan-set",
    name: "FAN VERSION",
    seoTitle: "Fan Version Football Jerseys",
  },
  {
    id: "track-pants",
    name: "TRACKPANTS",
    seoTitle: "Track Pants",
  },
  {
    id: "tees",
    name: "TEES",
    seoTitle: "Oversized Streetwear Tees",
  },
  {
    id: "hoodies",
    name: "HOODIES",
    seoTitle: "Hoodies",
  },
  {
    id: "sweatshirts",
    name: "SWEATSHIRT",
    seoTitle: "Sweatshirt",
  }
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
  const parsed = nodes.map((node) => {
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
    let category = 'tees'; // Default to T-Shirts
    
    if (tags.includes('player version')) {
      category = 'player-version';
    } else if (tags.includes('master version')) {
      category = 'master-version';
    } else if (tags.includes('fan version') || tags.includes('fan set')) {
      category = 'fan-set';
    } else if (tags.includes('hoodie') || tags.includes('hoodies')) {
      category = 'hoodies';
    } else if (tags.includes('sweatshirt') || tags.includes('sweatshirts')) {
      category = 'sweatshirts';
    } else if (tags.includes('track pant') || tags.includes('track pants') || tags.includes('trackpants') || tags.includes('jogger')) {
      category = 'track-pants';
    } else if (tags.includes('short') || tags.includes('shorts')) {
      category = 'shorts';
    } else if (tags.includes('tee') || tags.includes('t-shirt') || tags.includes('tees')) {
      category = 'tees';
    } else {
      // Fallback if tag is missing but title hints it
      const titleLower = node.title.toLowerCase();
      if (titleLower.includes('player version')) category = 'player-version';
      else if (titleLower.includes('master version')) category = 'master-version';
      else if (titleLower.includes('fan version') || titleLower.includes('fan set')) category = 'fan-set';
      else if (titleLower.includes('hoodie')) category = 'hoodies';
      else if (titleLower.includes('sweatshirt')) category = 'sweatshirts';
      else if (titleLower.includes('track pant') || titleLower.includes('trackpants') || titleLower.includes('jogger')) category = 'track-pants';
      else if (titleLower.includes('short')) category = 'shorts';
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

  const orderList = [
    "real madrid",
    "barcelona",
    "arsenal",
    "manchester united",
    "manchester city",
    "spain",
    "argentina",
    "portugal",
    "brazil",
    "france"
  ];

  function getSortIndex(name: string) {
    const lowerName = name.toLowerCase();
    for (let i = 0; i < orderList.length; i++) {
      if (lowerName.includes(orderList[i])) return i;
    }
    return 999;
  }

  function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const matched: Product[] = [];
  const others: Product[] = [];

  parsed.forEach(p => {
    if (getSortIndex(p.name) !== 999) {
      matched.push(p);
    } else {
      others.push(p);
    }
  });

  matched.sort((a, b) => getSortIndex(a.name) - getSortIndex(b.name));
  shuffle(others);

  return [...matched, ...others];
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
