const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = `import { AdminOrdersDashboard } from "../components/AdminDashboard";\nimport { getDocs } from "firebase/firestore";\n` + code;

code = code.replace(
  `const [avgTimeSpent, setAvgTimeSpent] = useState(0);`,
  `const [avgTimeSpent, setAvgTimeSpent] = useState(0);\n  const [orders, setOrders] = useState<any[]>([]);`
);

const fetchOrdersFunc = `
  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef);
      const snapshot = await getDocs(q);
      const fetchedOrders = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as any,
      ).sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
      });
      setOrders(fetchedOrders);
    } catch (e) {
      console.error(e);
    }
  };
`;

code = code.replace(
  `const isAdmin = user?.email === "investorshyam99@gmail.com";`,
  `const isAdmin = user?.email === "investorshyam99@gmail.com";\n${fetchOrdersFunc}`
);

code = code.replace(
  `setAvgTimeSpent(0);
          }
          setLoading(false);`,
  `setAvgTimeSpent(0);
          }
          fetchOrders();
          setLoading(false);`
);

code = code.replace(
  `            {/* Visitors List */}`,
  `            <div className="mt-8">
              <AdminOrdersDashboard orders={orders} refreshOrders={fetchOrders} />
            </div>

            {/* Visitors List */}`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
