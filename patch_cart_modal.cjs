const fs = require('fs');
let file = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

// We need to fetch deliveryLocation from ShopContext
file = file.replace(/const \{\n\s*cart,\n\s*removeFromCart,\n\s*updateQuantity,\n\s*isInWishlist,\n\s*isCartOpen,\n\s*setIsCartOpen,\n\s*isWishlistOpen,\n\s*setIsWishlistOpen,\n\s*deliveryMethod,\n\s*setDeliveryMethod,\n\s*deliveryPincode,\n\s*setDeliveryPincode,\n\s*expressDeliveryCharge,/g, `const {
        cart,
        removeFromCart,
        updateQuantity,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        deliveryMethod,
        setDeliveryMethod,
        deliveryPincode,
        setDeliveryPincode,
        deliveryLocation,
        expressDeliveryCharge,`);

// Also add calculateDeliveryEstimate import if missing
if (!file.includes("calculateDeliveryEstimate")) {
    file = file.replace(/import \{ Link, useNavigate \} from "react-router-dom";/, `import { Link, useNavigate } from "react-router-dom";\nimport { calculateDeliveryEstimate, formatDateRange } from '../lib/delivery';`);
}

// In the order creation, add delivery fields
const regexOrderCreation = /const orderRef = doc\(collection\(db, "orders"\)\);\n\s*createdOrderIds\.push\(orderRef\.id\);\n\s*const effectiveQuantity = isCombo \? 2 : item\.quantity;\n\s*const itemAdvance = paymentMode === "partial" \? 50 : itemFinalPrice;\n\s*const itemRemainingCod = paymentMode === "partial" \? \(itemFinalPrice - 50\) : 0;/g;
const replacementOrderCreation = `const orderRef = doc(collection(db, "orders"));
          createdOrderIds.push(orderRef.id);
          const effectiveQuantity = isCombo ? 2 : item.quantity;
          const itemAdvance = paymentMode === "partial" ? 50 : itemFinalPrice;
          const itemRemainingCod = paymentMode === "partial" ? (itemFinalPrice - 50) : 0;
          
          const estimate = calculateDeliveryEstimate({
            pincode: combinedAddress, // wait, combinedAddress includes pincode? We need to use deliveryPincode or extract it.
            // Let's use deliveryPincode from state if it matches, or extract from address
            deliveryMethod: deliveryMethod,
            customization: !!item.customization
          });
          `;
// We will just patch the order saving loop safely
