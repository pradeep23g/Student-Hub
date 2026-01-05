import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

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
  console.log(await getModerationQueue());

};
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
