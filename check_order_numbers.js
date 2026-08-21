import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(query(collection(db, "orders")));
  let countWith = 0;
  let countWithout = 0;
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.status === "Fully Paid" || data.status === "Advance Paid") {
        if (data.orderNumber) {
            countWith++;
        } else {
            countWithout++;
        }
    }
  });
  console.log("In 'new' tab: with orderNumber:", countWith, "without:", countWithout);
  process.exit(0);
}
run();
