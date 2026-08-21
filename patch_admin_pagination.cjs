const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const fetchOrdersRegex = /const refreshOrders = async \(\) => \{[\s\S]*?React\.useEffect\(\(\) => \{\n    refreshOrders\(\);\n  \}, \[activeTab\]\);/g;

const newFetchOrders = `
  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const [lastDocs, setLastDocs] = useState<any[]>([]); // stack of previous last docs
  const [currentLastDoc, setCurrentLastDoc] = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Reset pagination when tab changes
  React.useEffect(() => {
    setPage(1);
    setLastDocs([]);
    setCurrentLastDoc(null);
    setHasNextPage(true);
    refreshOrders(true);
  }, [activeTab]);

  const refreshOrders = async (reset = false, goBack = false) => {
    setIsLoadingOrders(true);
    if (reset) fetchTabCounts();
    try {
        let q;
        const colMap: any = {
            "new": "orders", "drafts": "draft_orders", "abandoned": "abandoned_carts",
            "placed": "orders", "delivered": "orders", "cancelled": "orders"
        };
        const colRef = collection(db, colMap[activeTab] || "orders");
        
        let conditions: any[] = [];
        if (activeTab === "new") conditions.push(where("status", "in", ["Fully Paid", "Advance Paid"]));
        else if (activeTab === "placed") conditions.push(where("status", "==", "Order Placed"));
        else if (activeTab === "delivered") conditions.push(where("status", "==", "Delivered"));
        else if (activeTab === "cancelled") conditions.push(where("status", "==", "cancelled"));
        
        let orderByClause = orderBy("createdAt", "desc");
        // abandoned carts might not have createdAt, but they actually do in our creation logic. 
        // We will order them if possible, but let's stick to the previous logic where abandoned didn't have orderBy if not needed, 
        // actually they all have createdAt or we can just orderBy document ID if no createdAt. Wait, abandoned_carts have updatedAt or createdAt.
        // For safety, let's use the same query logic as before but with startAfter.
        
        // Actually, previous logic for abandoned: q = query(collection(db, "abandoned_carts"), limit(30));
        if (activeTab !== "abandoned") {
            conditions.push(orderByClause);
        }

        let queryArgs = [colRef, ...conditions];
        
        if (!reset) {
            if (goBack) {
                // If going back, we pop the last doc. But the new "last doc" we start after is the one before the previous page.
                const prevLast = lastDocs[lastDocs.length - 2];
                if (prevLast) {
                    queryArgs.push(startAfter(prevLast));
                }
            } else if (currentLastDoc) {
                queryArgs.push(startAfter(currentLastDoc));
            }
        }

        queryArgs.push(limit(PAGE_SIZE));
        q = query.apply(null, queryArgs as any);

        const snapshot = await getDocs(q);
        
        if (snapshot.docs.length > 0) {
            const fetched = snapshot.docs.map(doc => {
                 const data = doc.data();
                 let status = data.status;
                 if (activeTab === "drafts") status = "pending draft";
                 if (activeTab === "abandoned") status = "abandoned";
                 
                 let productName = data.productName || "Order";
                 if (activeTab === "abandoned" && !data.productName && data.items) {
                     productName = data.items.map((i: any) => i.name).join(", ");
                 }

                 return { id: doc.id, ...data, status, productName } as Order;
            });
            
            setCurrentOrders(fetched);
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            
            if (!reset && !goBack) {
                setLastDocs(prev => [...prev, currentLastDoc]);
            } else if (goBack) {
                setLastDocs(prev => prev.slice(0, -1));
            } else if (reset) {
                setLastDocs([]);
            }
            
            setCurrentLastDoc(lastVisible);
            setHasNextPage(snapshot.docs.length === PAGE_SIZE);
        } else {
            if (reset) {
               setCurrentOrders([]);
               setHasNextPage(false);
            } else if (!goBack) {
               setHasNextPage(false);
            }
        }
    } catch (e) {
        console.warn("Failed to fetch tab orders", e);
    } finally {
        setIsLoadingOrders(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
        setPage(p => p + 1);
        refreshOrders(false, false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
        setPage(p => p - 1);
        refreshOrders(false, true);
    }
  };
`;

let newContent = content.replace(fetchOrdersRegex, newFetchOrders.trim());

newContent = newContent.replace(
  'import { doc, updateDoc, deleteDoc, collection, query, orderBy, limit, getDocs, getCountFromServer, where } from "firebase/firestore";',
  'import { doc, updateDoc, deleteDoc, collection, query, orderBy, limit, getDocs, getCountFromServer, where, startAfter } from "firebase/firestore";'
);

// Add the pagination controls right before the final closing div of the order list
const paginationUI = `
      {/* Pagination Controls */}
      {!["profits", "chats"].includes(activeTab) && (currentOrders.length > 0) && (
        <div className="flex justify-between items-center max-w-3xl mx-auto px-4 py-4">
            <button 
                onClick={handlePrevPage} 
                disabled={page === 1 || isLoadingOrders}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                ← Previous
            </button>
            <span className="text-sm font-bold text-gray-500">
                Page {page}
            </span>
            <button 
                onClick={handleNextPage} 
                disabled={!hasNextPage || isLoadingOrders}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50"
            >
                Next →
            </button>
        </div>
      )}
`;

newContent = newContent.replace('    </div>\n  );\n}\n', paginationUI + '    </div>\n  );\n}\n');

fs.writeFileSync('src/components/AdminDashboard.tsx', newContent);
