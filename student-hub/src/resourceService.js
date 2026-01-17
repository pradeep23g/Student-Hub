import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export const getPublishedResources = async () => {
  try {
    const q = query(
      collection(db, "resources"),
      where("status", "==", "published"),
      orderBy("moderatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
};
export const getUserUploads = async (userId) => {
  try {
    const q = query(
      collection(db, "resources"),
      where("uploadedBy", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Error fetching user uploads:", error);
    
    
    return [];
  }
};