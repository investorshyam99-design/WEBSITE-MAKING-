const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `            fetchedOrders = snapshot.docs.map((doc: any) => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }`;

const replacement = `            fetchedOrders = snapshot.docs.map((doc: any) => {
                 const data = doc.data() as any;
                 return { id: doc.id, ...data, productName: data.productName || "Order" } as Order;
            });
        }
        
        setCurrentOrders(fetchedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err);
    } finally {
        setIsLoadingOrders(false);
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
