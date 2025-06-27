import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export interface SoulHug {
  tone: string;
  relationship: string;
  occasion: string;
  message: string;
  audioUrl: string;
  imageUrl: string;
  createdAt: Date;
  userId: string;
  creditsUsed: number;
}

// SAVE a Soul Hug
export const saveSoulHug = async ({
  tone,
  relationship,
  occasion,
  message,
  audioUrl,
  imageUrl,
  createdAt,
  userId,
  creditsUsed,
}: SoulHug) => {
  try {
    const docRef = await addDoc(collection(db, "soulHugs"), {
      tone,
      relationship,
      occasion,
      message,
      audioUrl,
      imageUrl,
      createdAt: createdAt || new Date(),
      userId,
      creditsUsed,
    });
    console.log("Soul Hug saved with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// GET Soul Hugs by user
export const getSoulHugsByUser = async (userId: string) => {
  try {
    const hugsQuery = query(
      collection(db, "soulHugs"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(hugsQuery);
    const results: (SoulHug & { id: string })[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as SoulHug & { id: string });
    });
    return results;
  } catch (e) {
    console.error("Error fetching Soul Hugs: ", e);
    return [];
  }
};