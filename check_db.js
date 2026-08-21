import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const snapshot = await getDocs(query(collection(db, "orders"), limit(1)));
    console.log("SUCCESS! Docs fetched:", snapshot.docs.length);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
  process.exit(0);
}
run();
