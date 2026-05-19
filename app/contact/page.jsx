"use client";

import { useState } from "react";
import styles from "./contacto.module.css";
import { sendContactMessage } from "./contactService";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("ST");
  const [message, setMessage] = useState("");

  const handleContact = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !message) {
      alert("Por favor, completa todos los campos obligatorios");
      return;
    }

    console.log("Intentando enviar mensaje de: ", email);

    const result = await sendContactMessage(
      firstName,
      lastName,
      email,
      subject,
      message,
    );

    if (result.success) {
      alert("¡Mensaje enviado con éxito!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setSubject("ST");
      setMessage("");
    } else {
      console.log("Error al enviar: ", result.error);
      alert("Hubo un error al enviar el mensaje.");
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.h1}>Contacto y soporte</h1>

      <p className={styles.subtexto}>
        Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
      </p>

      <div className={styles.topSection}>
        {/* FORMULARIO */}
        <form onSubmit={handleContact} className={styles.formulario}>
          <h2>Envíanos un Mensaje</h2>

          <div className={styles.filaInputs}>
            <div className={styles.inputGrupo}>
              <label>Nombre</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                id="firstName"
                name="FirstName"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className={styles.inputGrupo}>
              <label>Apellido</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                id="lastName"
                name="LastName"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="Email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="subject">Asunto</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              name="subject"
              id="subject"
            >
              <option value="ST">Soporte Técnico</option>

              <option value="PD">Pregunta sobre donaciones</option>

              <option value="PP">Problemas con puntos</option>

              <option value="Sug">Sugerencia</option>

              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="message">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              id="message"
              name="message"
              placeholder="Cuéntanos en qué podemos ayudarte..."
              required
            ></textarea>
          </div>

          <button type="submit" className={styles.btnVerde}>
            Enviar Mensaje
          </button>
        </form>

        {/* COLUMNA DERECHA */}
        <div className={styles.rightSide}>
          {/* INFO CONTACTO */}
          <div className={styles.infoContacto}>
            <label>Información de contacto</label>

            <div className={styles.Email}>
              <h3>Email</h3>
              <p className={styles.txt}>soporte@ecocanje.com</p>
              <p className={styles.text}>info@ecocanje.com</p>
            </div>

            <div className={styles.telefono}>
              <h3>Teléfono</h3>
              <p className={styles.txt}>+51 955 123 456</p>
              <p className={styles.text}>Lun - Vie: 9:00 AM - 6:00 PM</p>
            </div>

            <div className={styles.Ubicacion}>
              <h3>Ubicación</h3>
              <p className={styles.txt}>Torre A</p>
              <p className={styles.text}>Lima - San Juan de Lurigancho</p>
            </div>
          </div>

          {/* CHAT */}
          <div className={styles.chatBox}>
            <h2>Chat en vivo</h2>
            <p>
              ¿Necesitas ayuda inmediata? Nuestro equipo está
              <br />
              disponible para ayudarte en tiempo real.
            </p>
            <button>Iniciar chat</button>
          </div>
        </div>
      </div>

      {/* HORARIO */}
      <div className={styles.horario}>
        <h3>Horario de atención</h3>

        <div>
          <span className={styles.horarioSpan}>Lunes - Viernes</span>
          <span className={styles.horarioSpan}>9:00 AM - 6:00 PM</span>
        </div>

        <div>
          <span className={styles.horarioSpan}>Sábado</span>
          <span className={styles.horarioSpan}>10:00 AM - 2:00 PM</span>
        </div>

        <div>
          <span className={styles.horarioSpan}>Domingo</span>
          <span style={{ color: "red" }}>Cerrado</span>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faq}>
        <h2>Preguntas Frecuentes</h2>

        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <h3>¿Cómo puedo registrarme en ECO CANJE?</h3>
            <p>
              Haz clic en el botón 'Registrarse' en el menú superior y completa
              el formulario en 2 simples pasos.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>¿Cómo funcionan los puntos?</h3>
            <p>
              Cada donación te otorga puntos que puedes canjear por beneficios
              exclusivos.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>¿Qué tipo de artículos puedo donar?</h3>
            <p>
              Aceptamos libros, ropa, muebles, tecnología y materiales
              reciclables.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>¿Cómo puedo solicitar una donación?</h3>
            <p>Navega por el feed de donaciones y haz clic en 'Solicitar'.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
