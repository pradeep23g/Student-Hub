import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

/* ================= SAVE USER IF NOT EXISTS ================= */
export const saveUserIfNotExists = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: "student",
      createdAt: serverTimestamp(),
    });

    console.log("New user saved to Firestore");
  } else {
    console.log("User already exists in Firestore");
  }
};

/* ================= GET USER ROLE ================= */
export const getUserRole = async (user) => {
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // Safety: if user doc somehow missing
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      role: "student",
      createdAt: serverTimestamp(),
    });

    return "student";
  }

  return userSnap.data().role || "student";
};
