import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const orderRef = doc(db, 'orders', 'x2Gw8KRi6JEQQLI4M8Mq');
  const snap = await getDoc(orderRef);
  console.log(snap.data());
  process.exit(0);
}
run();
