import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  product?: any;
  canonicalUrl?: string;
  schemas?: any[];
  isHome?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  type,
  product,
  canonicalUrl,
  schemas = [],
  isHome = false,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Determine Title (Max ~60 chars, formula: [Primary Keyword] | Jersey Unicorn)
    const finalTitle =
      title || "Buy Football Jerseys Online India | Jersey Unicorn";

    // 2. Determine Description (150-160 chars with India, trust signal, CTA)
    const finalDescription =
      description ||
      "Buy premium football jerseys & fan sets in India. Authentic player version, master retro & World Cup 2026 jerseys. Fast delivery & COD available. Shop now!";

    // 3. Determine Keywords
    const finalKeywords =
      keywords ||
      "buy football jersey online India, Argentina jersey India, Portugal World Cup 2026 jersey, retro football jersey India, player version vs fan version jersey, football jersey with shorts set India, authentic football jersey India";

    // 4. Default Image
    const finalImage = image || "https://i.imgur.com/VaSs3Xd.png";

    // Set document title
    document.title = finalTitle;

    // Update meta tags
    const updateMetaTag = (
      nameOrProperty: string,
      content: string,
      isProperty = false
    ) => {
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

    // Canonical link tag
    const cleanPath = location.pathname.split("?")[0];
    const computedCanonical =
      canonicalUrl || `https://jerseyunicorn.com${cleanPath === "/" ? "" : cleanPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", computedCanonical);

    // Open Graph
    updateMetaTag("og:title", finalTitle, true);
    updateMetaTag("og:description", finalDescription, true);
    updateMetaTag("og:url", computedCanonical, true);
    updateMetaTag("og:image", finalImage, true);
    updateMetaTag("og:type", type || (product ? "product" : "website"), true);

    // Twitter
    updateMetaTag("twitter:card", "summary_large_image", false);
    updateMetaTag("twitter:title", finalTitle, false);
    updateMetaTag("twitter:description", finalDescription, false);
    updateMetaTag("twitter:image", finalImage, false);

    // Schema Markup
    const existingSchemaScripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    existingSchemaScripts.forEach((script) => script.remove());

    const allSchemas: any[] = [...schemas];

    // Organization Schema for Homepage
    if (isHome) {
      allSchemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Jersey Unicorn",
        url: "https://jerseyunicorn.com",
        logo: "https://i.imgur.com/VaSs3Xd.png",
        sameAs: [
          "https://instagram.com/jerseyunicorn",
          "https://facebook.com/jerseyunicorn",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-9999999999",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      });
    }

    // Product & Breadcrumbs Schema if Product object provided
    if (product) {
      allSchemas.push({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: product.galleryImages || [product.image],
        description: finalDescription,
        sku: product.id,
        brand: {
          "@type": "Brand",
          name: "Jersey Unicorn",
        },
        offers: {
          "@type": "Offer",
          url: computedCanonical,
          priceCurrency: "INR",
          price: product.price || 1199,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "Jersey Unicorn",
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "128",
        },
      });

      allSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://jerseyunicorn.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: "https://jerseyunicorn.com/collections/all",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: computedCanonical,
          },
        ],
      });
    }

    // Inject JSON-LD scripts
    allSchemas.forEach((schemaObj) => {
      if (!schemaObj) return;
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }, [
    title,
    description,
    keywords,
    image,
    type,
    product,
    canonicalUrl,
    schemas,
    isHome,
    location.pathname,
  ]);

  return null;
}

