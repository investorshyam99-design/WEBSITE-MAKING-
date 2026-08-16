const fs = require('fs');
let file = fs.readFileSync('src/components/CategoryNav.tsx', 'utf8');

const regex = /const NAVIGATION_ITEMS = \[[\s\S]*?\];/;
const replacement = `const NAVIGATION_ITEMS = [
  { id: "player-version", sectionId: "section-player-version", name: "PLAYER VERSION" },
  { id: "master-version", sectionId: "section-master-version", name: "MASTER VERSION" },
  { id: "fan-set", sectionId: "section-fan-version", name: "FAN VERSION" },
  { id: "track-pants", sectionId: "section-track-pants", name: "TRACKPANTS" },
  { id: "tees", sectionId: "section-tees", name: "TEES" },
  { id: "hoodies", sectionId: "section-hoodies", name: "HOODIES" },
  { id: "sweatshirts", sectionId: "section-sweatshirts", name: "SWEATSHIRT" }
];`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/components/CategoryNav.tsx', file);
