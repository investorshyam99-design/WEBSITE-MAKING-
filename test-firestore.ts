import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore(serviceAccount.firestoreDatabaseId);

async function run() {
  const snapshot = await db.collection('orders').where('status', '==', 'pending_cart').get();
  console.log('Abandoned carts:', snapshot.docs.length);
  snapshot.docs.forEach(d => console.log(d.id, d.data().userId));
}
run();
