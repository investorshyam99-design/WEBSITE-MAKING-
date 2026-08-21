import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
async function run() {
  const snapshot = await getDocs(query(collection(db, "abandoned_carts"), limit(5)));
  snapshot.forEach(d => {
    console.log(`Abandoned ID: ${d.id}, keys: ${Object.keys(d.data())}`);
  });
  process.exit(0);
}
run();
