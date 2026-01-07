import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "./firebase";
import { getAuth } from "firebase/auth";

const storage = getStorage(app);
const auth = getAuth();

export const uploadRawFile = async (file) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `raw_uploads/${fileName}`);

    console.log("1. Starting upload...");
    const snapshot = await uploadBytes(storageRef, file);
    console.log("2. Upload done!");

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("3. Download URL:", downloadURL);

    await addDoc(collection(db, "resources"), {
      title: file.name,
      originalName: file.name,
      fileUrl: downloadURL,
      uploadedBy: user.uid,          // ✅ UID (IMPORTANT)
      status: "raw",
      createdAt: serverTimestamp()   // ✅ matches rules
    });

    console.log("4. Metadata saved");
    return true;
  } catch (error) {
    console.error("Upload failed:", error);
    return false;
  }
};
