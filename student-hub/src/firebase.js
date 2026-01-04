import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "student-hub-0001.firebaseapp.com",
  projectId: "student-hub-0001",
  storageBucket: "student-hub-0001.firebasestorage.app",
  messagingSenderId: "203130136342",
  appId: "1:203130136342:web:954a2b576c6ab0f8c81237",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);