"use client";

import { db } from "../../firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Envía un mensaje de contacto/soporte a Firestore.
 * Si el usuario está logueado, se guarda su userId para poder
 * mostrarle la respuesta del admin en su Perfil > Soporte.
 */
export async function sendContactMessage(
  firstName,
  lastName,
  email,
  subject,
  message,
  userId = null
) {
  try {
    await addDoc(collection(db, "contactMessages"), {
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      subject,
      message,
      userId: userId || null,
      status: "pendiente",
      reply: "",
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    return { success: false, error };
  }
}