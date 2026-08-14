const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace title
html = html.replace(/<title>.*?<\/title>/, '<title>Buy Football Jerseys Online India from ₹899 | COD | World Cup 2026 – Jersey Unicorn</title>');

// Replace description
html = html.replace(/<meta name="description" content=".*?" \/>/, '<meta name="description" content="India\'s football jersey store. Player version, fan version & retro kits — Argentina, Real Madrid, Portugal, Brazil & more. COD available. World Cup 2026 collection live." />');

// Replace keywords
html = html.replace(/<meta name="keywords" content=".*?" \/>/, '<meta name="keywords" content="football jersey india, buy football jersey online, world cup 2026 jersey, player version jersey, retro football jersey india" />');

// Add canonical
if (!html.includes('<link rel="canonical"')) {
    html = html.replace(/<title>/, '<link rel="canonical" href="https://www.jerseyunicorn.com/" />\n    <title>');
}

// Open Graph
html = html.replace(/<meta property="og:title" content=".*?" \/>/, '<meta property="og:title" content="Buy Football Jerseys Online India from ₹899 | COD | World Cup 2026 – Jersey Unicorn" />');
html = html.replace(/<meta property="og:description" content=".*?" \/>/, '<meta property="og:description" content="India\'s football jersey store. Player version, fan version & retro kits — Argentina, Real Madrid, Portugal, Brazil & more. COD available. World Cup 2026 collection live." />');
html = html.replace(/<meta property="og:url" content=".*?" \/>/, '<meta property="og:url" content="https://www.jerseyunicorn.com/" />');

// Twitter
html = html.replace(/<meta property="twitter:title" content=".*?" \/>/, '<meta name="twitter:title" content="Buy Football Jerseys Online India from ₹899 | COD | World Cup 2026 – Jersey Unicorn" />');
html = html.replace(/<meta property="twitter:description" content=".*?" \/>/, '<meta name="twitter:description" content="India\'s football jersey store. Player version, fan version & retro kits — Argentina, Real Madrid, Portugal, Brazil & more. COD available. World Cup 2026 collection live." />');
html = html.replace(/<meta property="twitter:url" content=".*?" \/>/, '<meta name="twitter:url" content="https://www.jerseyunicorn.com/" />');
html = html.replace(/<meta property="twitter:card"/, '<meta name="twitter:card"');

// Update JSON-LD for Organization and Website
const jsonldRegex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;
const newJsonLd = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "name": "Jersey Unicorn",
          "url": "https://www.jerseyunicorn.com/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://jerseyunicorn.com/logo.png"
          },
          "sameAs": [
            "https://www.instagram.com/jerseyunicorn1"
          ]
        },
        {
          "@type": "WebSite",
          "name": "Jersey Unicorn",
          "url": "https://www.jerseyunicorn.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.jerseyunicorn.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }
      ]
    }
    </script>`;

html = html.replace(jsonldRegex, newJsonLd);

fs.writeFileSync('index.html', html);
