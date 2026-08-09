import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clearManual() {
  const querySnapshot = await getDocs(collection(db, 'manual_profits_daily'));
  
  for (const document of querySnapshot.docs) {
    console.log("Deleting", document.id);
    await deleteDoc(doc(db, 'manual_profits_daily', document.id));
  }
  console.log("Done!");
}

clearManual().then(() => process.exit(0)).catch(console.error);
