import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (
    typeof window === "undefined" &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ) {
    throw new Error(
      "Firebase API key not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY in .env.local"
    );
  }

  return initializeApp(firebaseConfig);
}

let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getAuthInstance(): Auth {
  if (!_auth) {
    _auth = getAuth(getApp());
  }
  return _auth;
}

export function getDbInstance(): Firestore {
  if (!_db) {
    _db = getFirestore(getApp());
  }
  return _db;
}
