import { getAuth } from "firebase/auth";
import { app } from "./client";

export const auth = getAuth(app);