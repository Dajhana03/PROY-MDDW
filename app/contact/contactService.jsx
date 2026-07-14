import { db } from "../../firebase/client"; // Ajusta la ruta a tu archivo de Firebase activo (db o client)
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Guarda el mensaje de contacto directamente en la base de datos de Firestore
 */
export async function sendContactMessage(firstName, lastName, email, subject, message) {
  try {
    const messagesRef = collection(db, "contactMessages");
    
    await addDoc(messagesRef, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      createdAt: serverTimestamp(), // Registra la fecha del servidor automáticamente
      status: "pendiente" // Estado útil para un panel de administración posterior
    });

    return { success: true };
  } catch (error) {
    console.error("Error al guardar mensaje en Firestore: ", error);
    return { success: false, error: error.message };
  }
}