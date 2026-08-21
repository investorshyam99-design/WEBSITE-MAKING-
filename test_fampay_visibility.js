import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, where } from "firebase/firestore";
import fs from "fs";
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, "orders"), where("status", "in", ["Fully Paid", "Advance Paid", "Fampay", "Received"]), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const fampay = snapshot.docs.filter(d => d.data().status === "Fampay");
  console.log("Total valid New Orders:", snapshot.docs.length);
  console.log("Fampay found among them:", fampay.length);
  process.exit(0);
}
run();
