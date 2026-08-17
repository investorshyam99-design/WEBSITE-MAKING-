const fs = require('fs');
let code = fs.readFileSync('src/data/products.ts', 'utf8');

const search = `export function parseShopifyProducts(nodes: any[]): Product[] {
  const parsed = nodes.map((node) => {`;
  
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
    } else if (tags.includes('cargo') || tags.includes('cargos')) {
      category = 'cargos';
    } else if (node.productType) {
        const type = node.productType.toLowerCase();
        if (type.includes('hoodie')) category = 'hoodies';
        else if (type.includes('sweatshirt')) category = 'sweatshirts';
        else if (type.includes('track pant') || type.includes('jogger')) category = 'track-pants';
        else if (type.includes('short')) category = 'shorts';
        else if (type.includes('cargo')) category = 'cargos';
    }

    const brandTag = (node.tags || []).find((t: string) => t.toLowerCase().startsWith('brand_'));
    const brand = brandTag ? brandTag.replace(/^brand_/i, '') : 'Jersey Unicorn';

    let finalSlug = slugify(node.title);
    if (!finalSlug && node.id) {
        finalSlug = node.id.split('/').pop() || '';
    }

    return {
        id: node.id,
        name: node.title,
        price: price || 999, // default fallback
        description: node.descriptionHtml || node.description || "",
        image: mainImage,
        images: galleryImages.length > 0 ? galleryImages : [mainImage],
        category: category,
        slug: finalSlug,
        featured: tags.includes('featured'),
        brand: brand,
        variants: variants
    };
}

export function parseShopifyProducts(nodes: any[]): Product[] {
  const parsed = nodes.map((node) => {
    return parseShopifyProduct(node);
  });
  return parsed;
}

function _old_dummy_() {
  const parsed = nodes.map((node) => {`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    // Find the end of _old_dummy_ and remove it cleanly
    const endSearch = `  return parsed;
}`;
    const endReplace = `  return parsed;
}

*/`;
    // Or just let it be, but it might have syntax errors. Let's just do a clean replace using Regex or string splits.
}
