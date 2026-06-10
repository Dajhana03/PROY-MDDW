import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/db";
import { auth } from "../firebase/auth";

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password, firstName, lastName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      userId: uid,
      email,
      first_name: firstName,
      last_name: lastName,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const registerWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const [firstName = "", ...lastNameArr] = (user.displayName || "").split(
      " ",
    );
    const lastName = lastNameArr.join(" ");

    await setDoc(
      doc(db, "users", user.uid),
      {
        userId: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
      },
      { merge: true },
    );

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};

export const registerWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const [firstName = "", ...lastNameArr] = (user.displayName || "").split(
      " ",
    );
    const lastName = lastNameArr.join(" ");

    await setDoc(
      doc(db, "users", user.uid),
      {
        userId: user.uid,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
      },
      { merge: true },
    );

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};
