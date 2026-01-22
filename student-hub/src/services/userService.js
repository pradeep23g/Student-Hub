import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  deleteDoc, getDocs, query, orderBy, limit, increment, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/* ================= POINTS & STREAK SYSTEM ================= */

export const addPoints = async (userId, amount) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, { points: increment(amount) });
  } catch (error) {
    console.warn("Error adding points:", error);
  }
};

export const checkAndBumpStreak = async (userId) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();
  // Handle Firestore Timestamp or standard Date
  const lastActive = data.lastActive?.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
  const now = new Date();
  
  if (!data.lastActive) {
    // First time login
    await updateDoc(userRef, { 
      streak: 1, 
      lastActive: serverTimestamp(),
      points: increment(10) 
    });
    return { streak: 1, gained: 10 };
  }

  // Normalize dates to midnight to compare "days" not "milliseconds"
  const lastDate = new Date(lastActive);
  lastDate.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);

  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { streak: data.streak || 1, gained: 0 }; // Already logged in today
  } else if (diffDays === 1) {
    // Consecutive day
    await updateDoc(userRef, {
      streak: increment(1),
      lastActive: serverTimestamp(),
      points: increment(20)
    });
    return { streak: (data.streak || 1) + 1, gained: 20 };
  } else {
    // Streak broken
    await updateDoc(userRef, {
      streak: 1,
      lastActive: serverTimestamp()
    });
    return { streak: 1, gained: 0 };
  }
};

/* ================= BOOKMARKS ================= */
export const toggleBookmark = async (userId, resourceId) => {
  const bookmarkRef = doc(db, "users", userId, "bookmarks", resourceId);
  const docSnap = await getDoc(bookmarkRef);
  if (docSnap.exists()) {
    await deleteDoc(bookmarkRef);
    return false;
  } else {
    await setDoc(bookmarkRef, { resourceId, savedAt: new Date() });
    return true;
  }
};

export const getUserBookmarks = async (userId) => {
  const q = collection(db, "users", userId, "bookmarks");
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.id);
};

/* ================= LEADERBOARD ================= */
export const getLeaderboardData = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("points", "desc"), limit(10));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      uid: doc.id,
      name: doc.data().displayName || doc.data().email?.split('@')[0] || "Scholar",
      email: doc.data().email,
      points: doc.data().points || 0,
      streak: doc.data().streak || 0
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const getUserStats = async (userId) => {
    if(!userId) return null;
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
};