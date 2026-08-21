import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(query(collection(db, "orders")));
  const statuses = {};
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    statuses[data.status] = (statuses[data.status] || 0) + 1;
  });
  console.log("Statuses in DB:", statuses);
  process.exit(0);
}
run();
