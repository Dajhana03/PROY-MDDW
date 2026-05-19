import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/db";

export const sendContactMessage = async (
  firstName,
  lastName,
  email,
  subject,
  message,
) => {
  try {
    await addDoc(collection(db, "messages"), {
      firstName,
      lastName,
      email,
      subject,
      message,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.log("Error al guardar el mensaje en Firebase: ", error);
    return {
      success: false,
      error,
    };
  }
};
