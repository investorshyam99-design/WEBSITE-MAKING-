const fs = require('fs');
let content = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf8');

const regex = /export function MobileBottomNav\(\) \{\s*const location = useLocation\(\);\s*if \(location\.pathname === "\/checkout"\) return null;\s*const navigate = useNavigate\(\);\s*const \{\s*cart,\s*user,\s*isSearchOpen,\s*setIsSearchOpen,\s*isLoginOpen,\s*setIsLoginOpen,\s*isCartOpen,\s*setIsCartOpen,\s*\} = useShop\(\);/;

const replacement = `export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    user,
    isSearchOpen,
    setIsSearchOpen,
    isLoginOpen,
    setIsLoginOpen,
    isCartOpen,
    setIsCartOpen,
  } = useShop();

  if (location.pathname === "/checkout") return null;`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/MobileBottomNav.tsx', content);
