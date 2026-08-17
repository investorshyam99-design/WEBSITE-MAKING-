const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductPage.tsx', 'utf8');

const searchImports = `import {
  useProducts,
  getProductById,
  getProductsByCategory,
} from "../data/products";`;

const replaceImports = `import {
  useProducts,
  getProductById,
  getProductsByCategory,
  parseSingleShopifyProduct,
  Product
} from "../data/products";
import { fetchShopifyProductByHandle } from "../services/shopify";`;

code = code.replace(searchImports, replaceImports);

const searchLogic = `  const { products, isLoading } = useProducts();
  const { addToCart, setIsCartOpen, isCartOpen } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const activeKey = slug || id || "";
  const decodedKey = useMemo(
    () => (activeKey ? decodeURIComponent(activeKey) : ""),
    [activeKey],
  );

  const product = useMemo(
    () => getProductById(decodedKey, products),
    [decodedKey, products],
  );`;

const replaceLogic = `  const { products } = useProducts(); // still needed for recently viewed, etc
  const { addToCart, setIsCartOpen, isCartOpen } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const activeKey = slug || id || "";
  const decodedKey = useMemo(
    () => (activeKey ? decodeURIComponent(activeKey) : ""),
    [activeKey],
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product independently based on URL
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchProduct = async () => {
      if (!decodedKey) {
        setIsLoading(false);
        return;
      }
      
      // Attempt to fetch from Shopify directly by handle
      try {
        const data = await fetchShopifyProductByHandle(decodedKey);
        if (!isMounted) return;
        
        if (data) {
          const parsed = parseSingleShopifyProduct(data);
          setProduct(parsed);
        } else {
          // Fallback to global store lookup if not found by handle
          // (Shopify handles might differ slightly from our generated slugs in some legacy cases)
          const fallback = getProductById(decodedKey, products);
          if (fallback) {
            setProduct(fallback);
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.error("Error fetching product by handle:", err);
        if (!isMounted) return;
        const fallback = getProductById(decodedKey, products);
        setProduct(fallback || null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [decodedKey, products]);`;

if (code.includes(searchLogic)) {
  code = code.replace(searchLogic, replaceLogic);
  fs.writeFileSync('src/pages/ProductPage.tsx', code);
  console.log('Successfully patched ProductPage.tsx');
} else {
  console.log('Could not find search string in ProductPage.tsx');
}
