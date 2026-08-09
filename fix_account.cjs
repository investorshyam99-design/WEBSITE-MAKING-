const fs = require('fs');

const fetchOrdersCode = `
  const fetchOrders = useCallback(async () => {
    if (isAuthLoading) return;
    try {
      setLoading(true);
      let q;
      let fetchedOrders = [];
      const ordersRef = collection(db, "orders");
      
      if (user) {
        q = query(ordersRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        fetchedOrders = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() })
        );
      } else {
        const guestOrderIds = JSON.parse(localStorage.getItem("guest_orders") || "[]");
        const guestPhone = localStorage.getItem("guest_phone");
        
        if (guestPhone) {
          q = query(ordersRef, where("phone", "==", guestPhone));
        } else if (guestOrderIds.length > 0) {
          q = query(ordersRef, where(documentId(), "in", guestOrderIds.slice(0, 30)));
        } else {
          setOrders([]);
          setLoading(false);
          return;
        }
        
        const snapshot = await getDocs(q);
        fetchedOrders = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() })
        );
      }
      
      // Always filter out drafts and internal statuses
      fetchedOrders = fetchedOrders.filter((order) => {
        const s = (order.status || "").toLowerCase();
        const payStatus = (order.paymentStatus || "").toLowerCase();
        // Reject draft, pending, or abandoned orders
        if (s.includes("draft") || s.includes("abandoned") || s.includes("pending")) return false;
        if (payStatus.includes("pending") || payStatus.includes("failed")) return false;
        // Accept paid or advance paid or active fulfillment status
        return (
          s.includes("paid") ||
          s.includes("shipped") ||
          s.includes("delivered") ||
          s.includes("processing") ||
          s.includes("confirmed") ||
          s.includes("completed") ||
          payStatus.includes("paid") ||
          payStatus.includes("success") ||
          payStatus.includes("captured")
        );
      });
      
      // Sort ascending to assign sequential order numbers (1, 2, 3, 4...)
      const sortedAsc = [...fetchedOrders].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateA.getTime() - dateB.getTime();
      });
      
      let seq = 1;
      const mappedOrders = sortedAsc.map((order) => {
        let num = order.orderNumber;
        if (typeof num !== "number" || isNaN(num) || num <= 0 || num >= 10000) {
          num = seq;
        }
        seq = Math.max(seq + 1, num + 1);
        return {
          ...order,
          orderNumber: num,
        };
      });
      
      // Sort descending (newest first)
      const sortedOrders = mappedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setOrders(sortedOrders);
    } catch (error) {
      console.warn("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthLoading]);
`;

let content = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const startStr = "const fetchOrders = useCallback(async () => {";
const endStr = "  }, [user, isAuthLoading]);";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + fetchOrdersCode.trim() + content.substring(endIndex + endStr.length);
  fs.writeFileSync('src/pages/AccountPage.tsx', newContent);
} else {
  console.error("Could not find fetchOrders block");
}
