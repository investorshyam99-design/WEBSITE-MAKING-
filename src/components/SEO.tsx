import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  schema?: any;
  schemas?: any[];
  isHome?: boolean;
  keywords?: string;
  image?: string;
  type?: string;
  product?: any;
  canonicalUrl?: string;
}

export function SEO({ title, description, schema, schemas, image, type, product, canonicalUrl, isHome, keywords }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', title);
    }
    
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', description);
    }

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) twitterImage.setAttribute('content', image);
    }
    
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    // Schema
    let finalSchema = schema;
    if (schemas && schemas.length > 0) {
      finalSchema = {
        "@context": "https://schema.org",
        "@graph": schemas.map(s => {
           // If a schema already has @context, we can keep it or remove it since it's at the root graph level, but usually it's fine.
           return s;
        })
      };
    }
    if (type === 'product' && product) {
      finalSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": description || product.name,
        "brand": {
          "@type": "Brand",
          "name": "Jersey Unicorn"
        },
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl || window.location.href,
          "priceCurrency": "INR",
          "price": product.price,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition"
        }
      };
    }

    if (finalSchema) {
      let scriptSchema = document.getElementById('dynamic-schema');
      if (!scriptSchema) {
        scriptSchema = document.createElement('script');
        scriptSchema.id = 'dynamic-schema';
        scriptSchema.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(finalSchema);
    }

    return () => {
      const scriptSchema = document.getElementById('dynamic-schema');
      if (scriptSchema) {
        scriptSchema.remove();
      }
    };
  }, [title, description, schema, schemas, image, type, product, canonicalUrl, isHome, keywords]);

  return null;
}
