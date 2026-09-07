const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /fetchedOrders = snapshot\.docs\.map\(\(doc: any\) => \{[\s\S]*?\}\s*\} as Order;\s*\}\);\s*\}/m,
  `fetchedOrders = snapshot.docs.map((doc: any) => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }
        
        setCurrentOrders(fetchedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err);
    } finally {
        setIsLoadingOrders(false);
    }
  }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
