const fs = require('fs');
let code = fs.readFileSync('src/data/products.ts', 'utf8');

const search = `export function parseShopifyProducts(nodes: any[]): Product[] {`;
const replace = `export function parseShopifyProduct(node: any): Product {
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

    const images = (node.images?.edges || []).map((iEdge: any) => iEdge.node.url);

    let finalSlug = slugify(node.title);
    if (!finalSlug && node.id) {
        finalSlug = node.id.split('/').pop() || '';
    }

    let category = "Apparel";
    if (node.productType) {
        category = node.productType;
    } else if (node.tags && node.tags.length > 0) {
        category = node.tags[0];
    }

    return {
        id: node.id,
        name: node.title,
        price: price,
        description: node.descriptionHtml || node.description || "",
        image: images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000",
        images: images,
        category: category,
        slug: finalSlug,
        featured: node.tags ? node.tags.includes("Featured") : false,
        variants: variants
    };
}

export function parseShopifyProducts(nodes: any[]): Product[] {
  return nodes.map(node => parseShopifyProduct(node));
}

// Dummy export to replace old code block
function _old() {`;

code = code.replace(`export function parseShopifyProducts(nodes: any[]): Product[] {
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

    const images = (node.images?.edges || []).map((iEdge: any) => iEdge.node.url);

    let finalSlug = slugify(node.title);
    if (!finalSlug && node.id) {
        finalSlug = node.id.split('/').pop() || '';
    }

    let category = "Apparel";
    if (node.productType) {
        category = node.productType;
    } else if (node.tags && node.tags.length > 0) {
        category = node.tags[0];
    }

    return {
        id: node.id,
        name: node.title,
        price: price,
        description: node.descriptionHtml || node.description || "",
        image: images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1000",
        images: images,
        category: category,
        slug: finalSlug,
        featured: node.tags ? node.tags.includes("Featured") : false,
        variants: variants
    };
  });
  return parsed;
}`, replace + `}
`);

fs.writeFileSync('src/data/products.ts', code);
console.log('patched src/data/products.ts');
