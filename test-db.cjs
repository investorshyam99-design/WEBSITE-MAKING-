const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

initializeApp({
  projectId: serviceAccount.projectId
});

const db = getFirestore();

async function check() {
  const c = await db.collection('chats').get();
  console.log("chats:", c.size);
  const a = await db.collection('abandoned_carts').get();
  console.log("abandoned_carts:", a.size);
  const d = await db.collection('draft_orders').get();
  console.log("draft_orders:", d.size);
}
check().catch(console.error);
