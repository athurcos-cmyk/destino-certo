import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getAuthInstance } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const auth = getAuthInstance();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInAnonymously(): Promise<User> {
  const auth = getAuthInstance();
  const result = await firebaseSignInAnonymously(auth);
  return result.user;
}

export async function signInWithEmail(email: string, senha: string): Promise<User> {
  const auth = getAuthInstance();
  const result = await signInWithEmailAndPassword(auth, email, senha);
  return result.user;
}

export async function signUpWithEmail(email: string, senha: string): Promise<User> {
  const auth = getAuthInstance();
  const result = await createUserWithEmailAndPassword(auth, email, senha);
  return result.user;
}

export async function signOut(): Promise<void> {
  const auth = getAuthInstance();
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
}
