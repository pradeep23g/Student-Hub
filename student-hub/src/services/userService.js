import { 
  collection, doc, getDoc, setDoc, updateDoc, 
  deleteDoc, getDocs, query, orderBy, limit, increment, serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

/* ================= POINTS & STREAK SYSTEM ================= */

/**
 * Adds points to a user's profile.
 * @param {string} userId 
 * @param {number} amount 
 */
export const addPoints = async (userId, amount) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  
  try {
    // Increment points using atomic operation
    await updateDoc(userRef, {
      points: increment(amount)
    });
  } catch (error) {
    console.warn("Could not update points (user might not exist yet):", error);
  }
};

/**
 * Checks and updates the daily streak.
 * Should be called once when the dashboard loads.
 */
export const checkAndBumpStreak = async (userId) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const lastActive = data.lastActive?.toDate(); // Convert Firestore timestamp
  const now = new Date();
  
  // If never active, set to today
  if (!lastActive) {
    await updateDoc(userRef, { 
      streak: 1, 
      lastActive: serverTimestamp(),
      points: increment(10) // Welcome bonus
    });
    return { streak: 1, gained: 10 };
  }

  // Check difference in days
  const diffTime = Math.abs(now - lastActive);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 1) {
    // Already logged in today, do nothing
    return { streak: data.streak || 1, gained: 0 };
  } else if (diffDays < 2) {
    // Consecutive day! Increment streak
    await updateDoc(userRef, {
      streak: increment(1),
      lastActive: serverTimestamp(),
      points: increment(20) // Streak bonus
    });
    return { streak: (data.streak || 1) + 1, gained: 20 };
  } else {
    // Streak broken :( Reset to 1
    await updateDoc(userRef, {
      streak: 1,
      lastActive: serverTimestamp()
    });
    return { streak: 1, gained: 0 };
  }
};

/* ================= BOOKMARKS (Keep existing logic) ================= */
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

/* ================= LEADERBOARD (Updated for Points) ================= */
export const getLeaderboardData = async () => {
  try {
    // Get top 10 users sorted by points
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("points", "desc"), limit(10));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      uid: doc.id,
      name: doc.data().displayName || doc.data().email?.split('@')[0] || "Scholar",
      points: doc.data().points || 0,
      streak: doc.data().streak || 0
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

// Helper to get single user stats
export const getUserStats = async (userId) => {
    if(!userId) return null;
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
};