# Complete Shopify Liquid Code Migration

If you are using the Shopify Admin panel (Online Store > Themes > Edit Code), here is the exact code you need to copy and paste into the respective files to replicate the exact design, colors, and layout we built in React.

## 1. Setup Tailwind CSS (`layout/theme.liquid`)

Open `layout/theme.liquid`, find the `<head>` tag, and paste this right before `</head>`:

```html
<!-- Tailwind CSS via CDN for exact styling -->
<script src="https://cdn.tailwindcss.com"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  
  body { 
    background-color: #ffffff; 
    font-family: 'Inter', sans-serif;
  }
  
  /* Hide scrollbar for gallery */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
</style>
```

---

## 2. Main Product Page (`sections/main-product.liquid`)

Create or replace the contents of `sections/main-product.liquid` with this complete code. This includes the gallery switching, color/size selection, and customization fields.

```liquid
<div class="min-h-screen bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-20">
      
      <!-- Image Gallery -->
      <div id="product-gallery" class="flex-1">
        <div class="sticky top-24 space-y-4">
          <div class="aspect-[3/4] bg-[#F5EFE6] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group mb-4">
            <img id="main-product-image" src="{{ product.featured_image | img_url: '1000x' }}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
            
            {% if product.compare_at_price > product.price %}
            <div class="absolute top-4 left-4 bg-[#e83e44] text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
              SALE
            </div>
            {% endif %}
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {% for image in product.images %}
              <button onclick="document.getElementById('main-product-image').src='{{ image | img_url: '1000x' }}'" class="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-200 focus:border-[#1E2A44] transition-all">
                <img src="{{ image | img_url: '200x' }}" class="w-full h-full object-cover" />
              </button>
            {% endfor %}
          </div>
        </div>
      </div>

      <!-- Details and Form -->
      <div class="flex-1 lg:max-w-md pt-4 lg:pt-0">
        <h1 class="text-2xl md:text-3xl font-black text-[#1B1B1B] uppercase tracking-tight leading-[1.1]">{{ product.title }}</h1>
        
        <div class="flex items-end gap-3 mt-4 md:mt-6 mb-8 pt-6 border-t border-gray-100">
          <span id="product-price" class="text-3xl md:text-4xl font-black text-[#1E2A44] leading-none">{{ product.price | money }}</span>
          {% if product.compare_at_price > product.price %}
            <span class="text-lg text-gray-400 line-through font-bold mb-1">{{ product.compare_at_price | money }}</span>
          {% endif %}
        </div>

        <div class="prose prose-sm text-gray-500 mb-10 leading-relaxed font-medium">
          {{ product.description }}
        </div>

        {% form 'product', product, id: 'add-to-cart-form' %}
          <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}" id="variant-id">

          <!-- Variants (Size & Color) -->
          {% unless product.has_only_default_variant %}
            <div class="space-y-8 mb-10 border-t border-gray-100 pt-8">
              {% for option in product.options_with_values %}
                <div>
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-sm font-bold text-[#1B1B1B] uppercase tracking-widest">{{ option.name }}</h3>
                  </div>
                  <div class="flex flex-wrap gap-2 md:gap-3">
                    {% for value in option.values %}
                      <label class="cursor-pointer group flex-1 min-w-[60px]">
                        <input type="radio" name="options[{{ option.name }}]" value="{{ value | escape }}" data-position="{{ option.position }}" class="peer sr-only variant-selector" {% if option.selected_value == value %}checked{% endif %}>
                        <div class="py-4 px-2 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-sm peer-checked:border-[#1E2A44] peer-checked:bg-[#1E2A44] peer-checked:text-white peer-checked:scale-105 border-gray-200 bg-white hover:border-[#1E2A44]/50">
                          <span class="text-sm font-bold tracking-tight">{{ value }}</span>
                        </div>
                      </label>
                    {% endfor %}
                  </div>
                </div>
              {% endfor %}
            </div>
          {% endunless %}

          <!-- Customization Fields -->
          <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mb-10 border border-gray-200/50">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" id="add-customization" class="w-5 h-5 rounded border-2 border-gray-300 text-[#1E2A44] focus:ring-[#1E2A44] transition-colors cursor-pointer">
              <span class="text-sm font-bold text-[#1B1B1B] uppercase tracking-wider group-hover:text-[#1E2A44] transition-colors">Add Custom Name & Number <span class="text-green-600 ml-1">(+₹199)</span></span>
            </label>
            
            <div id="customization-fields" class="hidden mt-6 space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Name on Back</label>
                <input type="text" name="properties[Custom Name]" placeholder="ENTER NAME" class="w-full bg-white border-2 border-transparent focus:border-[#1E2A44] rounded-xl px-4 py-3.5 font-black text-sm uppercase tracking-widest outline-none transition-all shadow-sm">
              </div>
              <div>
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block ml-1">Number on Back</label>
                <input type="number" name="properties[Custom Number]" placeholder="00" min="0" max="99" class="w-full bg-white border-2 border-transparent focus:border-[#1E2A44] rounded-xl px-4 py-3.5 font-black text-sm uppercase tracking-widest outline-none transition-all shadow-sm">
              </div>
            </div>
          </div>

          <button type="submit" class="w-full flex items-center justify-center text-center bg-[#1E2A44] border-2 border-[#1E2A44] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#151D2F] hover:-translate-y-0.5 transition-all duration-300 text-sm">
            Add to Cart
          </button>
        {% endform %}
      </div>
    </div>
  </div>
</div>

<script>
  // Variant selection logic
  const productVariants = {{ product.variants | json }};
  const variantSelectors = document.querySelectorAll('.variant-selector');
  const variantIdInput = document.getElementById('variant-id');
  const priceDisplay = document.getElementById('product-price');
  
  if(variantSelectors.length > 0) {
    variantSelectors.forEach(radio => {
      radio.addEventListener('change', () => {
        // Get selected options
        const selectedOptions = Array.from(document.querySelectorAll('.variant-selector:checked')).map(el => el.value);
        
        // Find matching variant
        const matchedVariant = productVariants.find(variant => {
          return selectedOptions.every((option, index) => variant.options[index] === option);
        });
        
        if (matchedVariant) {
          variantIdInput.value = matchedVariant.id;
          priceDisplay.innerHTML = '₹' + (matchedVariant.price / 100).toLocaleString('en-IN');
          
          // If variant has image, update main image
          if(matchedVariant.featured_image) {
            document.getElementById('main-product-image').src = matchedVariant.featured_image.src;
          }
        }
      });
    });
  }

  // Customization toggle
  document.getElementById('add-customization').addEventListener('change', function(e) {
    document.getElementById('customization-fields').style.display = e.target.checked ? 'block' : 'none';
  });
</script>
{% schema %}
{
  "name": "Product Page",
  "settings": []
}
{% endschema %}
```

---

## 3. Product Card for Collections (`snippets/product-card.liquid`)

Create a new snippet called `product-card.liquid` and paste this code to use the same hover effects and styling for product grids.

```liquid
<div class="group cursor-pointer">
  <a href="{{ product.url }}" class="block">
    <div class="aspect-[3/4] bg-[#F5EFE6] relative flex items-center justify-center overflow-hidden rounded-xl shadow-sm">
      <img 
        src="{{ product.featured_image | img_url: '600x' }}" 
        alt="{{ product.title }}" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      {% if product.compare_at_price > product.price %}
      <div class="absolute top-3 left-3 bg-[#e83e44] text-white text-[12px] font-black px-3 py-1 rounded-full shadow-sm z-10 tracking-wide">
        SALE
      </div>
      {% endif %}
    </div>
    <div class="mt-3 px-1">
      <p class="text-[10px] text-gray-400 capitalize font-bold tracking-widest truncate">
        {{ product.type | default: 'Apparel' }}
      </p>
      <h3 class="text-sm font-black mt-1 text-[#1B1B1B] group-hover:text-[#1E2A44] transition-colors truncate uppercase tracking-tight">
        {{ product.title }}
      </h3>
      <div class="flex items-center gap-2 mt-1.5">
        <span class="font-black text-base text-[#1E2A44]">{{ product.price | money }}</span>
        {% if product.compare_at_price > product.price %}
          <span class="font-bold text-xs text-gray-400 line-through">{{ product.compare_at_price | money }}</span>
        {% endif %}
      </div>
    </div>
  </a>
</div>
```

## How to use this:
1. Log in to your **Shopify Admin**
2. Go to **Online Store** > **Themes**
3. Click the **3 dots (...)** next to your active theme and click **Edit Code**
4. Apply the codes above to the files `layout/theme.liquid`, `sections/main-product.liquid`, and `snippets/product-card.liquid`.
