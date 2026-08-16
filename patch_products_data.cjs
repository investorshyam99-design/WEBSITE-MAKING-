const fs = require('fs');
let file = fs.readFileSync('src/data/products.ts', 'utf8');

const categoriesRegex = /export const categories = \[[\s\S]*?\];/;
const newCategories = `export const categories = [
  {
    id: "master-version",
    name: "MASTER VERSION",
    seoTitle: "Master Version Football Jerseys",
  },
  {
    id: "player-version",
    name: "PLAYER VERSION",
    seoTitle: "Player Version Football Jerseys",
  },
  {
    id: "fan-set",
    name: "FAN VERSION",
    seoTitle: "Fan Version Football Jerseys",
  },
  {
    id: "tees",
    name: "TEES",
    seoTitle: "Oversized Streetwear Tees",
  },
  {
    id: "hoodies",
    name: "HOODIES",
    seoTitle: "Hoodies",
  },
  {
    id: "sweatshirts",
    name: "SWEATSHIRTS",
    seoTitle: "Sweatshirts",
  },
  {
    id: "track-pants",
    name: "TRACK PANTS",
    seoTitle: "Track Pants",
  },
  {
    id: "shorts",
    name: "SHORTS",
    seoTitle: "Shorts",
  }
];`;

file = file.replace(categoriesRegex, newCategories);

// Also patch the category assignment logic
const oldParsingLogic = `    let category = 'tees'; // Default to T-Shirts
    
    if (tags.includes('player version')) {
      category = 'player-version';
    } else if (tags.includes('master version')) {
      category = 'master-version';
    } else if (tags.includes('fan version') || tags.includes('fan set')) {
      category = 'fan-set';
    } else if (tags.includes('tee') || tags.includes('t-shirt') || tags.includes('tees')) {
      category = 'tees';
    } else {
      // Fallback if tag is missing but title hints it
      const titleLower = node.title.toLowerCase();
      if (titleLower.includes('player version')) category = 'player-version';
      else if (titleLower.includes('master version')) category = 'master-version';
      else if (titleLower.includes('fan version') || titleLower.includes('fan set')) category = 'fan-set';
    }`;

const newParsingLogic = `    let category = 'tees'; // Default to T-Shirts
    
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
    } else if (tags.includes('track pant') || tags.includes('track pants') || tags.includes('jogger')) {
      category = 'track-pants';
    } else if (tags.includes('short') || tags.includes('shorts')) {
      category = 'shorts';
    } else if (tags.includes('tee') || tags.includes('t-shirt') || tags.includes('tees')) {
      category = 'tees';
    } else {
      // Fallback if tag is missing but title hints it
      const titleLower = node.title.toLowerCase();
      if (titleLower.includes('player version')) category = 'player-version';
      else if (titleLower.includes('master version')) category = 'master-version';
      else if (titleLower.includes('fan version') || titleLower.includes('fan set')) category = 'fan-set';
      else if (titleLower.includes('hoodie')) category = 'hoodies';
      else if (titleLower.includes('sweatshirt')) category = 'sweatshirts';
      else if (titleLower.includes('track pant') || titleLower.includes('jogger')) category = 'track-pants';
      else if (titleLower.includes('short')) category = 'shorts';
    }`;

file = file.replace(oldParsingLogic, newParsingLogic);

fs.writeFileSync('src/data/products.ts', file);
