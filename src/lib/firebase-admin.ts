import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App;
let adminDb: Firestore;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });

  return app;
}

export function getAdminFirestore(): Firestore {
  if (adminDb) return adminDb;
  const application = getAdminApp();
  adminDb = getFirestore(application);
  return adminDb;
}
