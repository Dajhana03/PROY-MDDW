import { getFirestore } from "firebase/firestore";
import { app } from "./client";

export const db = getFirestore(app);

