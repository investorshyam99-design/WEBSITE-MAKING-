import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, 'orders'));
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} orders`);
  let found = false;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.fullName && data.fullName.toLowerCase().includes('daksha')) {
      console.log('--- FOUND DAKSHA IN ORDERS ---');
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Data:', data);
      found = true;
    }
  });
  if (!found) console.log('Not found in orders');
  
  const q2 = query(collection(db, 'draft_orders'));
  const snap2 = await getDocs(q2);
  snap2.forEach(doc => {
    const data = doc.data();
    if (data.fullName && data.fullName.toLowerCase().includes('daksha')) {
      console.log('--- FOUND DAKSHA IN DRAFT_ORDERS ---');
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Data:', data);
      found = true;
    }
  });
  
  const q3 = query(collection(db, 'abandoned_carts'));
  const snap3 = await getDocs(q3);
  snap3.forEach(doc => {
    const data = doc.data();
    if (data.fullName && data.fullName.toLowerCase().includes('daksha')) {
      console.log('--- FOUND DAKSHA IN ABANDONED_CARTS ---');
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Data:', data);
      found = true;
    }
  });
  process.exit(0);
}
run();
