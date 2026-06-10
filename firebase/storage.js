import { getStorage } from "firebase/storage";
import { app } from "./client";

export const storage = getStorage(app);