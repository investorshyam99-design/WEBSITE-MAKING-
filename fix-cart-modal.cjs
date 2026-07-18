const fs = require('fs');
let code = fs.readFileSync('src/components/CartModal.tsx', 'utf8');

const regex = /let recommendationHeading =[\s\S]*?const itemsCount = /;
const replacement = `let recommendationHeading = "⭐ More Products You'll Love";
  if (dominantCategory === "player-version") {
    recommendationHeading = "⭐ More Player Version Jerseys";
  } else if (dominantCategory === "master-version") {
    recommendationHeading = "⭐ More Master Version Jerseys";
  } else if (dominantCategory === "fan-set") {
    recommendationHeading = "⭐ More Fan Version Jerseys";
  } else if (dominantCategory === "tees") {
    recommendationHeading = "👕 More T-Shirts You'll Love";
  }

  const itemsCount = `;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CartModal.tsx', code);
