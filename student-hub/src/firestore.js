import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

/* ===================================================================
   USER MANAGEMENT (Authentication)
   =================================================================== */

/**
 * Saves a new user to Firestore if they don't exist yet.
 * @param {object} user - The user object from Firebase Auth
 */
export const saveUserIfNotExists = async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || "Student",
        role: "student", // Default role
        createdAt: serverTimestamp(),
      });
      console.log("✅ New user profile created in Firestore");
    } else {
      console.log("ℹ️ User profile already exists");
    }
  } catch (error) {
    console.error("❌ Error saving user:", error);
  }
};

/**
 * Gets the role of the current user (student/moderator).
 * Self-heals if the document is missing.
 */
export const getUserRole = async (user) => {
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Safety: If user is logged in but has no Firestore doc, create one.
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        role: "student",
        createdAt: serverTimestamp(),
      });
      return "student";
    }

    return userSnap.data().role || "student";
  } catch (error) {
    console.error("❌ Error fetching user role:", error);
    return "student"; // Default to safe role on error
  }
};

/* ===================================================================
   RESOURCE MANAGEMENT (The Fix for your Bucket Leak)
   =================================================================== */

/**
 * Deletes a resource from BOTH Database and Storage.
 * @param {string} resourceId - The ID of the document to delete
 */
export const deleteResource = async (resourceId) => {
  try {
    // 1. Reference the document
    const docRef = doc(db, "resources", resourceId);
    
    // 2. GET the data first (we need the 'fileUrl' to delete the PDF)
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn("⚠️ Document not found, skipping delete.");
      return false;
    }

    const data = docSnap.data();
    const fileUrl = data.fileUrl; 

    // 3. DELETE FROM STORAGE (The Bucket)
    if (fileUrl) {
      try {
        // Create a reference directly from the full URL
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
        console.log("🗑️ PDF file deleted from Storage bucket");
      } catch (storageErr) {
        console.warn("⚠️ Could not delete file from storage (might already be gone):", storageErr);
      }
    }

    // 4. DELETE FROM DATABASE (Firestore)
    await deleteDoc(docRef);
    console.log("🗑️ Database entry deleted");
    
    return true;

  } catch (error) {
    console.error("❌ Error deleting resource:", error);
    throw error;
  }
};