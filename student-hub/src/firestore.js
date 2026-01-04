import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Save user only if they don't already exist
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