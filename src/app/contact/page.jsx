import styles from "../contact/contacto.module.css";

export default function Home() {
  return (
    <>
      <h1 className={styles.titulo}>
        Contacto y soporte
      </h1>

      <p className={styles.subtexto}>
        Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
      </p>

      <div className={styles.topSection}>
        {/* FORMULARIO */}

        <div className={styles.formulario}>
          <h2>Envíanos un Mensaje</h2>

          <div className={styles.filaInputs}>
            <div className={styles.inputGrupo}>
              <label>Nombre</label>

              <input type="text" placeholder="Tu nombre" />
            </div>

            <div className={styles.inputGrupo}>
              <label>Apellido</label>

              <input type="text" placeholder="Tu apellido" />
            </div>
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="email">
              Correo Electrónico
            </label>

            <input
              type="email"
              id="email"
              name="Email"
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="paises">Asunto</label>

            <select name="paises" id="paises">
              <option value="ST">
                Soporte Técnico
              </option>

              <option value="PD">
                Pregunta sobre donaciones
              </option>

              <option value="ar">
                Problemas con puntos
              </option>

              <option value="Sug">
                Sugerencia
              </option>

              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className={styles.inputCompleto}>
            <label htmlFor="Area">Mensaje</label>

            <textarea
              name="txtArea"
              id="Area"
              placeholder="Cuéntanos en qué podemos ayudarte..."
            ></textarea>
          </div>

          <button className={styles.btnVerde}>
            Enviar Mensaje
          </button>
        </div>

        {/* COLUMNA DERECHA */}

        <div className={styles.rightSide}>
          {/* INFO CONTACTO */}

          <div className={styles.infoContacto}>
            <label>
              Información de contacto
            </label>

            <div className={styles.Email}>
              <h3>Email</h3>

              <p className={styles.txt}>
                soporte@ecocanje.com
              </p>

              <p className={styles.text}>
                info@ecocanje.com
              </p>
            </div>

            <div className={styles.telefono}>
              <h3>Teléfono</h3>

              <p className={styles.txt}>
                +51 955 123 456
              </p>

              <p className={styles.text}>
                Lun - Vie: 9:00 AM - 6:00 PM
              </p>
            </div>

            <div className={styles.Ubicacion}>
              <h3>Ubicación</h3>

              <p className={styles.txt}>
                Torre A
              </p>

              <p className={styles.text}>
                Lima - San Juan de Lurigancho
              </p>
            </div>
          </div>

          {/* CHAT */}

          <div className={styles.chatBox}>
            <h2>Chat en vivo</h2>

            <p>
              ¿Necesitas ayuda inmediata? Nuestro equipo
              está
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
          <span>Lunes - Viernes</span>

          <span>9:00 AM - 6:00 PM</span>
        </div>

        <div>
          <span>Sábado</span>

          <span>10:00 AM - 2:00 PM</span>
        </div>

        <div>
          <span>Domingo</span>

          <span style={{ color: "red" }}>
            Cerrado
          </span>
        </div>
      </div>

      <div className={styles.faq}>
        <h2>Preguntas Frecuentes</h2>

        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <h3>
              ¿Cómo puedo registrarme en ECO CANJE?
            </h3>

            <p>
              Haz clic en el botón 'Registrarse' en el
              menú superior y completa el formulario en 2
              simples pasos.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>¿Cómo funcionan los puntos?</h3>

            <p>
              Cada donación te otorga puntos que puedes
              canjear por beneficios exclusivos.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>
              ¿Qué tipo de artículos puedo donar?
            </h3>

            <p>
              Aceptamos libros, ropa, muebles,
              tecnología y materiales reciclables.
            </p>
          </div>

          <div className={styles.faqCard}>
            <h3>
              ¿Cómo puedo solicitar una donación?
            </h3>

            <p>
              Navega por el feed de donaciones y haz clic
              en 'Solicitar'.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}