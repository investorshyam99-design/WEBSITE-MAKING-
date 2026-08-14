const fs = require('fs');

let file = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /<SEO[\s\S]*?\/>/;
const replace = `<SEO 
        title="Buy Football Jerseys Online India from ₹899 | COD | World Cup 2026 – Jersey Unicorn"
        description="India's football jersey store. Player version, fan version & retro kits — Argentina, Real Madrid, Portugal, Brazil & more. COD available. World Cup 2026 collection live."
        canonicalUrl="https://www.jerseyunicorn.com/"
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Which is better, player version or fan version?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Player versions are identical to what professionals wear on the pitch, featuring heat-pressed badges, an athletic slim fit, and moisture-wicking technology. Fan versions are designed for everyday supporters, offering a more relaxed, comfortable fit with durable embroidered badges."
              }
            },
            {
              "@type": "Question",
              "name": "Do you offer COD?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, we offer Cash on Delivery (COD) across India. An advance payment of ₹50 per item may be required for COD orders to confirm the order."
              }
            },
            {
              "@type": "Question",
              "name": "How long is delivery?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Orders are typically dispatched within 24 hours and delivered in 5 to 7 business days across India."
              }
            },
            {
              "@type": "Question",
              "name": "Are these original jerseys?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We sell premium 1:1 master replica and player version jerseys, providing the highest quality fabrics and precise detailing at an affordable price."
              }
            }
          ]
        }}
      />`;

file = file.replace(regex, replace);

// Add h1 and SEO text and FAQ to the bottom of the <main>
const newContent = `
        <section className="bg-white px-4 py-12 md:py-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase text-[#1B1B1B] mb-6">Buy Football Jerseys Online in India</h1>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                <p>Welcome to Jersey Unicorn, your ultimate destination to <strong>buy football jerseys online in India</strong>. Whether you are gearing up for the highly anticipated World Cup 2026 or representing your favorite club, we bring you the finest football kits with pan-India delivery.</p>
                <p>Our collection features both the authentic <strong>player version</strong> (slim fit, heat-pressed badges, breathable mesh) and the comfortable <strong>fan version</strong> (relaxed fit, embroidered crests). Looking for nostalgia? Check out our premium <strong>retro kits</strong> that celebrate football's golden eras.</p>
                <p>We stock all the major powerhouses including <strong>Argentina, Portugal, Brazil, Real Madrid, Barcelona, Manchester United, and Liverpool</strong>. Enjoy the convenience of <strong>COD (Cash on Delivery)</strong> and <strong>free shipping</strong> on prepaid orders. Shop with confidence and elevate your matchday style with Jersey Unicorn today!</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-[#1B1B1B] mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[#1B1B1B] text-lg">Which is better, player version or fan version?</h3>
                  <p className="text-gray-600 mt-2">Player versions are identical to what professionals wear on the pitch, featuring heat-pressed badges, an athletic slim fit, and moisture-wicking technology. Fan versions are designed for everyday supporters, offering a more relaxed, comfortable fit with durable embroidered badges.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#1B1B1B] text-lg">Do you offer COD?</h3>
                  <p className="text-gray-600 mt-2">Yes, we offer Cash on Delivery (COD) across India. An advance payment of ₹50 per item may be required for COD orders to confirm the order.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#1B1B1B] text-lg">How long is delivery?</h3>
                  <p className="text-gray-600 mt-2">Orders are typically dispatched within 24 hours and delivered in 5 to 7 business days across India.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#1B1B1B] text-lg">Are these original jerseys?</h3>
                  <p className="text-gray-600 mt-2">We sell premium 1:1 master replica and player version jerseys, providing the highest quality fabrics and precise detailing at an affordable price.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
`;

file = file.replace(/<\/main>/, newContent + '\n      </main>');

fs.writeFileSync('src/pages/Home.tsx', file);
