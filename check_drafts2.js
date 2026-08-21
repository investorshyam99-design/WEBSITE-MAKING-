import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query, where } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const dSnap = await getDocs(query(collection(db, "draft_orders"), limit(2)));
  console.log("OLD DRAFTS (draft_orders collection):");
  dSnap.forEach(d => console.log(d.data()));

  const oSnap = await getDocs(query(collection(db, "orders"), where("status", "in", ["pending advance payment", "pending full payment", "pending_cart"]), limit(2)));
  console.log("\nNEW DRAFTS (orders collection):");
  oSnap.forEach(d => console.log(d.data()));
  process.exit(0);
}
run();
