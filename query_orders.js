import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(query(collection(db, "orders"), limit(5)));
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, "=>", JSON.stringify(data).substring(0, 200));
  });
  process.exit(0);
}
run();
