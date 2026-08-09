import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function reset() {
  const todayStr = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'manual_profits_daily', todayStr), {
    revenue: 0,
    cost: 0,
    timestamp: new Date()
  });
  console.log("Done reset!");
}

reset().then(() => process.exit(0)).catch(console.error);
