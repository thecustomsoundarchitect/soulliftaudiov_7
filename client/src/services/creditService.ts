import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

/**
 * Ensure a user document exists with initial credits.
 * Call this after user signs in.
 */
export async function initUserCredits() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    // Create with 3 free credits to start
    await setDoc(userRef, { 
      credits: 3,
      email: user.email,
      displayName: user.displayName,
      createdAt: new Date()
    });
  }
}

/**
 * Fetch current user's credits.
 */
export async function getUserCredits(): Promise<number> {
  const user = auth.currentUser;
  if (!user) return 0;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      // Initialize if doesn't exist
      await initUserCredits();
      return 3; // Default starting credits
    }
    const data = snap.data();
    return data.credits || 0;
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return 0;
  }
}

/**
 * Increment user's credits by a given amount.
 */
export async function addUserCredits(amount: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const current = snap.data().credits || 0;
      await updateDoc(userRef, { credits: current + amount });
    } else {
      // If no doc, initialize with amount
      await setDoc(userRef, { 
        credits: amount,
        email: user.email,
        displayName: user.displayName,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error adding user credits:", error);
  }
}

/**
 * Deduct credits from user's account.
 * Returns true if successful, false if insufficient credits.
 */
export async function deductUserCredits(amount: number): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await initUserCredits();
      return amount <= 3; // Check against initial credits
    }
    
    const current = snap.data().credits || 0;
    if (current >= amount) {
      await updateDoc(userRef, { credits: current - amount });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deducting user credits:", error);
    return false;
  }
}

/**
 * Check if user has enough credits for an operation.
 */
export async function hasEnoughCredits(amount: number): Promise<boolean> {
  const credits = await getUserCredits();
  return credits >= amount;
}

/**
 * Get user's full profile including credits.
 */
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await initUserCredits();
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 3,
        createdAt: new Date()
      };
    }
    return { uid: user.uid, ...snap.data() };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}