import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const q = query(collection(db, "orders"), where("status", "==", "Fampay"));
    const snapshot = await getDocs(q);
    snapshot.forEach(d => {
      const data = d.data();
      console.log(`ID: ${d.id}, orderNumber: ${data.orderNumber}, createdAt: ${data.createdAt ? data.createdAt.toDate() : 'MISSING'}`);
    });
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
run();
