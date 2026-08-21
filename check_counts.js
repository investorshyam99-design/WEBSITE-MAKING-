import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, "orders"));
  let newOrders = 0;
  let placed = 0;
  let delivered = 0;
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (["Fully Paid", "Advance Paid", "Fampay", "Received"].includes(data.status)) newOrders++;
    if (data.status === "Order Placed") placed++;
    if (data.status === "Delivered") delivered++;
  });
  console.log("New Orders:", newOrders, "Placed:", placed, "Delivered:", delivered);
  process.exit(0);
}
run();
