import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const q = query(collection(db, "draft_orders"), limit(5));
    const snapshot = await getDocs(q);
    snapshot.forEach(d => {
      console.log(`ID: ${d.id}, data keys: ${Object.keys(d.data())}`);
    });
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
run();
