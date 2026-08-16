const fs = require('fs');
let file = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const regexOrderCreation = /expectedDeliveryEnd: estimate\.estimatedEndDate\.toISOString\(\),\n\s*customizationProcessingDays: estimate\.processingDays,/g;
const replacementOrderCreation = `expectedDeliveryEnd: estimate.estimatedEndDate.toISOString(),
            dispatchDate: estimate.dispatchDate.toISOString(),
            customizationProcessingDays: estimate.processingDays,
            deliveryCity: deliveryLocation?.city || city,
            deliveryDistrict: deliveryLocation?.district || "",
            deliveryState: deliveryLocation?.state || state,
            deliveryServiceable: estimate.isServiceable,`;

file = file.replace(regexOrderCreation, replacementOrderCreation);

fs.writeFileSync('src/components/CartModal.tsx', file);
