import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase"; // ✅ Ensure 'storage' is imported

/* ================= RAW MODERATION QUEUE ================= */
export const getModerationQueue = async () => {
  try {
    const q = query(
      collection(db, "resources"),
      where("status", "==", "raw")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    return [];
  }
};

/* ================= PUBLISH RESOURCE (FIXED) ================= */
export const publishResource = async (docId, finalData) => {
  try {
    const docRef = doc(db, "resources", docId);

    // ✅ THE FIX: We use "...finalData" to let ALL fields pass through.
    // This ensures 'fullText' and 'aiReady' are saved to the database.
    await updateDoc(docRef, {
      ...finalData, 
      status: "published",
      moderatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error publishing resource:", error);
    return false;
  }
};

/* ================= UPDATE (EDIT) RESOURCE ================= */
export const updateResource = async (id, updates) => {
  const ref = doc(db, "resources", id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

/* ================= REMOVE (DELETE) RESOURCE (FIXED) ================ */
// I updated this to fix the "Storage Leak" we found earlier too.
export const deleteResource = async (id) => {
  try {
    const docRef = doc(db, "resources", id);
    
    // 1. Get file URL before deleting doc
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
       const fileUrl = docSnap.data().fileUrl;
       if (fileUrl) {
         try {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef); // Delete from Bucket
         } catch (e) {
            console.warn("File already deleted from storage or not found");
         }
       }
    }

    // 2. Delete from Database
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
};

/* ================= FETCH PUBLISHED (ADMIN) ================= */
export const getPublishedResourcesForAdmin = async () => {
  try {
    const q = query(
      collection(db, "resources"),
      where("status", "==", "published")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Error fetching published resources:", error);
    return [];
  }
};