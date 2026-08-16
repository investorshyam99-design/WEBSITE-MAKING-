const fs = require('fs');
let file = fs.readFileSync('src/components/CategoryNav.tsx', 'utf8');

const navItemsRegex = /const NAVIGATION_ITEMS = \[[\s\S]*?\];/;
const newNavItems = `const NAVIGATION_ITEMS = [
  { id: "player-version", sectionId: "section-player-version", name: "PLAYER VERSION" },
  { id: "master-version", sectionId: "section-master-version", name: "MASTER VERSION" },
  { id: "fan-set", sectionId: "section-fan-version", name: "FAN VERSION" },
  { id: "tees", sectionId: "section-tees", name: "TEES" },
  { id: "hoodies", sectionId: "section-hoodies", name: "HOODIES" },
  { id: "sweatshirts", sectionId: "section-sweatshirts", name: "SWEATSHIRTS" },
  { id: "track-pants", sectionId: "section-track-pants", name: "TRACK PANTS" },
  { id: "shorts", sectionId: "section-shorts", name: "SHORTS" }
];`;

file = file.replace(navItemsRegex, newNavItems);

// Make flex container scrollable
file = file.replace(
  /<div className="flex items-center gap-1.5 md:gap-3 w-full justify-between">/,
  '<div className="flex items-center gap-2 md:gap-3 w-full overflow-x-auto scrollbar-hide pb-1">'
);

// Update button styles to avoid excessive squishing
file = file.replace(
  /className={\`flex-1 aspect-\[2\/1\] flex items-center justify-center text-center p-1 md:p-2 text-\[10px\] sm:text-xs md:text-sm font-black uppercase tracking-tighter sm:tracking-wide rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer active:scale-95 leading-\[1.1\] \$\{/,
  'className={`flex-none min-w-[90px] md:min-w-[120px] aspect-[2/1] flex items-center justify-center text-center p-1.5 md:p-2 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-tighter sm:tracking-wide rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer active:scale-95 leading-[1.1] ${'
);

fs.writeFileSync('src/components/CategoryNav.tsx', file);
