import Image from "next/image";

export default function Home() {
  return (

    <>
      <h1>Contacto y soporte</h1>

      <p className="subtexto">
        Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios
      </p>

      <div className="container">
        <div className="formulario">

          <h2>Envíanos un Mensaje</h2>

          <div>
            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" />
          </div>

          <div>
            <label>Apellido</label>
            <input type="text" placeholder="Tu Apellido" />
          </div>

          <div>
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

          <div>
            <label htmlFor="paises">Asunto</label>

            <select name="paises" id="paises">
              <option value="ST">Soporte técnico</option>
              <option value="PD">
                Pregunta sobre donaciones
              </option>
              <option value="ar">
                Problemas con puntos
              </option>
              <option value="Sug">Sugerencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="Area">Mensaje</label>

            <textarea
              name="txtArea"
              id="Area"
              placeholder="Cuéntanos en que podemos ayudarte..."
            ></textarea>
          </div>

          <div>
            <button className="btnVerde">
              Enviar Mensaje
            </button>
          </div>

        </div>
      </div>

      <div className="infoContacto">

        <label>Información de contacto</label>

        <div>
          <h3>Email</h3>
          <p className="txt">
            soporte@ecocanje.com
          </p>

          <p className="text">
            info@ecocanje.com
          </p>
        </div>

        <div>
          <h3>Teléfono</h3>

          <p className="txt">
            +51 955 123 456
          </p>

          <p className="text">
            Lima-San Juan de Lurigancho
          </p>
        </div>

      </div>

      <div className="chatBox">

        <h2>Chat en vivo</h2>

        <p>
          ¿Necesitas ayuda inmediata?
          Nuestro equipo está
          <br />
          disponible para ayudarte
          en tiempo real.
        </p>

        <button>
          Iniciar chat
        </button>

      </div>

      <div className="horario">

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

      <div className="faq">

        <h2>Preguntas frecuentes</h2>

        <div>
          <h3>
            ¿Cómo puedo registrarme
            en ECO CANJE?
          </h3>

          <p>
            Haz clic en el botón
            'Registrarse' en el menú
            superior y completa el
            formulario en 2 simples pasos.
          </p>
        </div>

        <div>
          <h3>
            ¿Cómo funcionan los puntos?
          </h3>

          <p>
            Cada donación te otorga puntos
            que puedes canjear por beneficios
            exclusivos. Los puntos varían según
            el tipo y valor de la donación.
          </p>
        </div>

        <div>
          <h3>
            ¿Qué tipo de artículos
            puedo donar?
          </h3>

          <p>
            Aceptamos libros, ropa,
            muebles, tecnología,
            alimentos no perecederos y
            materiales reciclables.
          </p>
        </div>

        <div>
          <h3>
            ¿Cómo puedo solicitar
            una donación?
          </h3>

          <p>
            Navega por el feed de donaciones,
            encuentra lo que necesitas y haz
            clic en 'Solicitar'. El donante
            recibirá tu solicitud.
          </p>
        </div>

      </div>
    </>
  );
}
