import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit, getDocsFromCache } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const q = query(collection(db, "orders"), limit(200));
    // Notice: Cloud reads might fail due to quota. We can try anyway.
    const snapshot = await getDocs(q);
    const statuses = {};
    snapshot.forEach((d) => {
      const status = d.data().status;
      statuses[status] = (statuses[status] || 0) + 1;
    });
    console.log("Order Statuses:", statuses);
    
    // Also check drafts
    const dSnap = await getDocs(query(collection(db, "draft_orders"), limit(50)));
    console.log("Draft Orders found:", dSnap.docs.length);

    // Also check abandoned
    const aSnap = await getDocs(query(collection(db, "abandoned_carts"), limit(50)));
    console.log("Abandoned Carts found:", aSnap.docs.length);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
run();
