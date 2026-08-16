const fs = require('fs');
let file = fs.readFileSync('src/components/CategoriesSection.tsx', 'utf8');

const regex = /const SECTIONS_CONFIG = \[[\s\S]*?\];/;
const replacement = `const SECTIONS_CONFIG = [
  {
    id: "player-version",
    sectionId: "section-player-version",
    title: "PLAYER VERSION",
    subtitle: "Premium match-grade jerseys.",
    viewAllUrl: "/collection/player-version"
  },
  {
    id: "master-version",
    sectionId: "section-master-version",
    title: "MASTER VERSION",
    subtitle: "Top-tier replica jerseys.",
    viewAllUrl: "/collection/master-version"
  },
  {
    id: "fan-set",
    sectionId: "section-fan-version",
    title: "FAN VERSION",
    subtitle: "Classic fan version jerseys.",
    viewAllUrl: "/collection/fan-set"
  },
  {
    id: "track-pants",
    sectionId: "section-track-pants",
    title: "TRACKPANTS",
    subtitle: "Athletic wear track pants.",
    viewAllUrl: "/collection/track-pants"
  },
  {
    id: "tees",
    sectionId: "section-tees",
    title: "TEES",
    subtitle: "Oversized streetwear tees.",
    viewAllUrl: "/collection/tees"
  },
  {
    id: "hoodies",
    sectionId: "section-hoodies",
    title: "HOODIES",
    subtitle: "Premium winter wear.",
    viewAllUrl: "/collection/hoodies"
  },
  {
    id: "sweatshirts",
    sectionId: "section-sweatshirts",
    title: "SWEATSHIRT",
    subtitle: "Comfortable and stylish.",
    viewAllUrl: "/collection/sweatshirts"
  }
];`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/components/CategoriesSection.tsx', file);
