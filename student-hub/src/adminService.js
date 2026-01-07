import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

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

/* ================= PUBLISH RESOURCE ================= */
export const publishResource = async (docId, finalData) => {
  try {
    const docRef = doc(db, "resources", docId);

    await updateDoc(docRef, {
      title: finalData.title,
      subject: finalData.subject,
      unit: finalData.unit,
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
