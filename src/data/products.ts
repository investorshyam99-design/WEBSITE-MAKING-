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
    id: "player",
    name: "PLAYER VERSION",
    description: "Same replica as original, heat-pressed logos, made in Thailand.",
  },
  {
    id: "fan",
    name: "FAN VERSION",
    description: "Embroidered logos, comes with shorts, made in Thailand.",
  },
  {
    id: "master",
    name: "MASTER QUALITY",
    description: "Upgraded version of fan version, premium finishing, made in Thailand.",
  },
  {
    id: "sublimation",
    name: "SUBLIMATION JERSEY",
    description: "Printed logos, lightweight, affordable pricing.",
  },
  {
    id: "indian",
    name: "INDIAN EMBROIDERY",
    description: "Made in India, embroidered finish, budget-friendly.",
  },
];

const mockImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop", // generic jersey
  "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?q=80&w=1974&auto=format&fit=crop", // generic jersey 2
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=2074&auto=format&fit=crop", // football
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2070&auto=format&fit=crop"  // football pitch
];

function generateProducts() {
  const products: Product[] = [];
  categories.forEach((cat) => {
    // Generate 8 products per category
    for (let i = 1; i <= 8; i++) {
        let basePrice = 349;
        if(cat.id === "player") basePrice = 1299;
        if(cat.id === "fan") basePrice = 899;
        if(cat.id === "master") basePrice = 1099;
        if(cat.id === "sublimation") basePrice = 499;
        
      const mainImage = mockImages[i % mockImages.length];
      const otherImages = mockImages.filter(img => img !== mainImage);
      
      products.push({
        id: `${cat.id}-${i}`,
        name: `${cat.name} Jersey - Model ${i}`,
        price: basePrice + (i * 10),
        image: mainImage,
        galleryImages: [mainImage, ...otherImages],
        category: cat.id,
        description: `Premium ${cat.name.toLowerCase()} for the true football fan. Complete your kit with this beautiful piece.`
      });
    }
  });
  return products;
}

export const products = generateProducts();

export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCategory = (categoryId: string) => products.filter(p => p.category === categoryId);
