import { auth } from "../../firebase/auth"
import { signInWithEmailAndPassword } from "firebase/auth";

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
