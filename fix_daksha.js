import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const orderRef = doc(db, 'orders', 'x2Gw8KRi6JEQQLI4M8Mq');
  await updateDoc(orderRef, { status: 'Fully Paid' });
  console.log('Fixed Daksha Shetty order status back to "Fully Paid"');
  process.exit(0);
}
run();
