/* src/resourceService.js */
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "./firebase"; // Check your path

/* ================= EXISTING FUNCTIONS ================= */

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

/* ================= ✅ THE SUPERBRAIN FUNCTION ================= */

export const getGlobalContext = async (subjectFilter = null) => {
  try {
    let q;
    
    // 1. Build Query (Filter by subject if selected, otherwise get ALL)
    if (subjectFilter) {
      q = query(
        collection(db, "resources"), 
        where("status", "==", "published"),
        where("subject", "==", subjectFilter)
      );
    } else {
      q = query(
        collection(db, "resources"), 
        where("status", "==", "published")
      );
    }

    const snapshot = await getDocs(q);
    
    // 2. Stitch Text Together
    let superContext = "";
    let fileCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      // Only add files that actually have scanned text
      if (data.fullText && data.fullText.length > 50) {
        superContext += `\n\n=== SOURCE DOCUMENT: ${data.title} (Unit: ${data.unit || 'General'}) ===\n${data.fullText}`;
        fileCount++;
      }
    });

    console.log(`🧠 Superbrain constructed: Merged ${fileCount} files.`);
    return { context: superContext, count: fileCount };

  } catch (error) {
    console.error("Error building Global Context:", error);
    return { context: "", count: 0 };
  }
};