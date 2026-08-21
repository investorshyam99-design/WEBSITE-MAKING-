import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const q = query(collection(db, "draft_orders"), orderBy("createdAt", "desc"), limit(25));
    const snapshot = await getDocs(q);
    console.log("Drafts returned:", snapshot.docs.length);
  } catch (e) {
    console.error("Drafts ERROR:", e.message);
  }
  
  try {
    const q2 = query(collection(db, "abandoned_carts"), orderBy("createdAt", "desc"), limit(25));
    const snapshot2 = await getDocs(q2);
    console.log("Abandoned returned:", snapshot2.docs.length);
  } catch (e) {
    console.error("Abandoned ERROR:", e.message);
  }
  process.exit(0);
}
run();
