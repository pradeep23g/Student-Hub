import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("User logged in:", user.email);
    return user; 
  } catch (error) {
    console.error("Login failed:", error);
    return null; 
  }
};
