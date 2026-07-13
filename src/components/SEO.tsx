import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  product?: any;
}

export function SEO({ title, description, keywords, image, type, product }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Determine Title
    const finalTitle = title || "Jersey Unicorn | Gen Z Streetwear & Oversized Back-Print Tees India";
    
    // 2. Determine Description
    const finalDescription = description || "Buy premium oversized back-print quote t-shirts in India. Bold banter tees for football, F1, anime, music artists, and wordplay. Elevate your street style.";
    
    // 3. Determine Keywords
    const finalKeywords = keywords || "football fan tees india, f1 tees india, anime tshirts india, artist graphic tees india, quote tshirts india, oversized back print tees india, gen z streetwear india";

    // 4. Default Image
    const finalImage = image || "https://i.imgur.com/VaSs3Xd.png";

    // Set document title
    document.title = finalTitle;

    // Update meta tags
    const updateMetaTag = (nameOrProperty: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${nameOrProperty}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, nameOrProperty);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);
    
    // Open Graph
    updateMetaTag("og:title", finalTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:url", window.location.href, true);
    updateMetaTag("og:image", finalImage, true);
    updateMetaTag("og:type", type || "website", true);
    
    // Twitter
    updateMetaTag("twitter:card", "summary_large_image", false);
    updateMetaTag("twitter:title", finalTitle, false);
    updateMetaTag("twitter:description", finalDescription, false);
    updateMetaTag("twitter:image", finalImage, false);

    // Schema Markup
    let schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    schemaScripts.forEach(script => script.remove());

    if (product) {
      const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.galleryImages || [product.image],
        "description": finalDescription,
        "sku": product.id,
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": "https://schema.org/InStock"
        }
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Shop",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name,
            "item": window.location.href
          }
        ]
      };

      const script1 = document.createElement('script');
      script1.type = 'application/ld+json';
      script1.text = JSON.stringify(productSchema);
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.type = 'application/ld+json';
      script2.text = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(script2);
    }

  }, [title, description, keywords, image, type, product, location.pathname]);

  return null;
}
