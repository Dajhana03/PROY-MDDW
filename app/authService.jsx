import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
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

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
  phone,
  birthDate,
  city,
  userType,
}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      userId: uid,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      birth_date: birthDate,
      city: city,
      user_type: userType,
    });

    return { success: true };
  } catch (error) {
    console.error("Error en registerUser:", error);
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
