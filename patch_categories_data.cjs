const fs = require('fs');
let file = fs.readFileSync('src/data/products.ts', 'utf8');

const regex = /export const categories = \[[\s\S]*?\];/;
const replacement = `export const categories = [
  {
    id: "player-version",
    name: "PLAYER VERSION",
    seoTitle: "Player Version Football Jerseys",
  },
  {
    id: "master-version",
    name: "MASTER VERSION",
    seoTitle: "Master Version Football Jerseys",
  },
  {
    id: "fan-set",
    name: "FAN VERSION",
    seoTitle: "Fan Version Football Jerseys",
  },
  {
    id: "track-pants",
    name: "TRACKPANTS",
    seoTitle: "Track Pants",
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
    name: "SWEATSHIRT",
    seoTitle: "Sweatshirt",
  }
];`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/data/products.ts', file);
