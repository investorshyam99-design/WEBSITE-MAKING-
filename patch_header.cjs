const fs = require('fs');
let file = fs.readFileSync('src/components/Header.tsx', 'utf8');

const importRegex = /import \{\s*Home,\s*Search,\s*ShoppingBag,\s*User,\s*X,\s*LogIn,\s*ShieldAlert,\s*Menu\s*\} from "lucide-react";/;
file = file.replace(importRegex, 'import { Home, Search, ShoppingBag, User, X, LogIn, ShieldAlert, Menu, Truck } from "lucide-react";');

const trackMobileLink = `
              <Link
                to="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <Truck className="h-5 w-5" /> Track Order
              </Link>`;
              
const homeMobileLink = `
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 text-base font-bold text-[#1B1B1B] hover:bg-[#F5EFE6] hover:text-[#1E2A44] border-b border-gray-100 transition-colors uppercase"
              >
                <Home className="h-5 w-5" /> Home
              </Link>`;
              
file = file.replace(homeMobileLink, homeMobileLink + trackMobileLink);


const homeDesktopLink = `
            <Link
              to="/"
              className="text-[#1B1B1B] hover:text-[#1E2A44] text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Home
            </Link>`;

const trackDesktopLink = `
            <Link
              to="/track"
              className="text-[#1B1B1B] hover:text-[#1E2A44] text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Track Order
            </Link>`;

file = file.replace(homeDesktopLink, homeDesktopLink + '\n' + trackDesktopLink);

fs.writeFileSync('src/components/Header.tsx', file);
