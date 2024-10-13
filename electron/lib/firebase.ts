import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    projectId: "skyshare-37"
};

export const db = getFirestore(initializeApp(firebaseConfig));
export * from "firebase/firestore";