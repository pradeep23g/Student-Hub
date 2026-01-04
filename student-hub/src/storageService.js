import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app, db} from "./firebase";

const storage = getStorage(app);

export const uploadRawFile = async (file, userEmail) => {
    try {
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage , `raw_uploads/${fileName}`);

        console.log("1. Starting upload...");

        const snapshot = await uploadBytes(storageRef, file);
        console.log("2.Upload done!!");

        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("3. Download URL:", downloadURL);

        await addDoc(collection(db, "resources"), {
            originalName: file.name,
            fileURL: downloadURL,
            uploadedBy: userEmail,
            status: "raw",
            uploadedAt: serverTimestamp(),
        });

        console.log("4. Metadata saved");
        return true;
    }

    catch(error) {
        console.error("Upload failed:", error);
        return false;
    }
};