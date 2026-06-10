"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./faq.module.css";

const categories = [
  {
    id: "general",
    label: "General",
    icon: "/svg/helpCircle.svg",
    items: [
      {
        question: "¿Qué es ECO CANJE?",
        answer:
          "ECO CANJE es una plataforma universitaria de donaciones solidarias que conecta a miembros de la comunidad académica para intercambiar artículos de manera gratuita y sostenible. Nuestro objetivo es reducir el desperdicio y fomentar la economía circular dentro del entorno universitario.",
      },
      {
        question: "¿Quién puede usar ECO CANJE?",
        answer:
          "La plataforma está dirigida a estudiantes, docentes y personal administrativo de la universidad. Para acceder a las funcionalidades completas necesitas registrarse con tu correo institucional.",
      },
      {
        question: "¿Es gratuito usar ECO CANJE?",
        answer:
          "Sí, ECO CANJE es completamente gratuito. No cobramos comisiones ni tarifas de ningún tipo. Es una iniciativa sin fines de lucro impulsada por la comunidad universitaria.",
      },
      {
        question: "¿En qué ciudades está disponible?",
        answer:
          "Actualmente ECO CANJE opera dentro del campus universitario y sus alrededores. Estamos trabajando para expandirnos a otras instituciones educativas próximamente.",
      },
    ],
  },
  {
    id: "donaciones",
    label: "Donaciones",
    icon: "/svg/refresh.svg",
    items: [
      {
        question: "¿Qué tipo de artículos puedo donar?",
        answer:
          "Aceptamos libros y material académico, ropa y calzado en buen estado, muebles pequeños, dispositivos tecnológicos funcionales, artículos de papelería y materiales reciclables. Los artículos deben estar en condiciones adecuadas para su uso.",
      },
      {
        question: "¿Cómo publico una donación?",
        answer:
          "Inicia sesión en tu cuenta, dirígete a 'Publicar Donación', completa el formulario con una descripción detallada, sube fotos del artículo, selecciona la categoría y confirma la publicación. Tu donación estará visible en el feed en minutos.",
      },
      {
        question: "¿Puedo retirar una donación publicada?",
        answer:
          "Sí, puedes retirar tu publicación en cualquier momento desde tu perfil mientras no haya sido reclamada. Si ya existe una solicitud pendiente, te recomendamos comunicarte con el solicitante antes de retirarla.",
      },
      {
        question: "¿Qué artículos están prohibidos?",
        answer:
          "No están permitidos: alimentos perecederos, medicamentos, artículos ilegales o peligrosos, productos que infrinjan derechos de autor, artículos en mal estado o insalubres, y bienes con valor comercial excesivo que desvirtúen el espíritu solidario.",
      },
      {
        question: "¿Cómo se coordina la entrega?",
        answer:
          "Una vez aceptada la solicitud, donante y receptor se comunican directamente a través del chat interno de la plataforma para coordinar el lugar y horario de entrega, preferiblemente dentro del campus universitario.",
      },
    ],
  },
  {
    id: "puntos",
    label: "Puntos y Beneficios",
    icon: "/svg/star2.svg",
    items: [
      {
        question: "¿Cómo funciona el sistema de puntos?",
        answer:
          "Cada vez que realizas una donación acumulas puntos según el tipo y cantidad de artículos. También ganas puntos por participar en la comunidad, escribir reseñas, referir amigos y completar tu perfil. Los puntos se reflejan en tu perfil en tiempo real.",
      },
      {
        question: "¿Qué puedo canjear con mis puntos?",
        answer:
          "Los puntos se pueden canjear por beneficios exclusivos como descuentos en la cafetería universitaria, acceso prioritario a eventos, certificados de participación, materiales académicos gratuitos y otros beneficios que se renuevan periódicamente.",
      },
      {
        question: "¿Los puntos tienen fecha de vencimiento?",
        answer:
          "Los puntos vencen si tu cuenta permanece inactiva por más de 12 meses consecutivos. Te notificaremos con 30 días de anticipación antes de que tus puntos expiren para que puedas utilizarlos.",
      },
      {
        question: "¿Puedo transferir mis puntos a otro usuario?",
        answer:
          "Actualmente los puntos no son transferibles entre usuarios. Son acumulados de manera individual y solo pueden ser canjeados por el titular de la cuenta.",
      },
    ],
  },
  {
    id: "cuenta",
    label: "Mi Cuenta",
    icon: "/svg/userGroup.svg",
    items: [
      {
        question: "¿Cómo me registro en ECO CANJE?",
        answer:
          "Haz clic en 'Registrarse' en el menú superior, completa el formulario con tus datos personales e institucionales, verifica tu correo electrónico y listo. El proceso toma menos de 2 minutos.",
      },
      {
        question: "¿Puedo usar mi cuenta en varios dispositivos?",
        answer:
          "Sí, tu cuenta de ECO CANJE es accesible desde cualquier dispositivo con conexión a internet. Tu información, puntos y publicaciones se sincronizan automáticamente.",
      },
      {
        question: "¿Cómo puedo eliminar mi cuenta?",
        answer:
          "Puedes solicitar la eliminación de tu cuenta desde la sección de Configuración en tu perfil. El proceso es irreversible y eliminará todos tus datos, historial y puntos acumulados. Tienes un período de 30 días para cancelar la solicitud.",
      },
      {
        question: "¿Qué hago si olvido mi contraseña?",
        answer:
          "En la página de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?' e ingresa tu correo registrado. Recibirás un código OTP de 6 dígitos para verificar tu identidad y crear una nueva contraseña.",
      },
    ],
  },
  {
    id: "seguridad",
    label: "Privacidad y Seguridad",
    icon: "/svg/lock.svg",
    items: [
      {
        question: "¿Cómo protegen mis datos personales?",
        answer:
          "Aplicamos medidas de seguridad técnicas y organizativas para proteger tu información. Tus datos no son vendidos ni compartidos con terceros con fines comerciales. Consulta nuestra Política de Privacidad para más detalles.",
      },
      {
        question: "¿Otros usuarios pueden ver mi información de contacto?",
        answer:
          "Tu información de contacto (correo, teléfono) no es pública. Solo se comparte con un usuario específico cuando ambas partes acuerdan realizar una transacción de donación.",
      },
      {
        question: "¿Cómo reporto un usuario sospechoso?",
        answer:
          "Puedes reportar a un usuario desde su perfil haciendo clic en el botón 'Reportar'. Nuestro equipo de moderación revisará el caso en un plazo de 24-48 horas y tomará las medidas correspondientes.",
      },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad y Blog",
    icon: "/svg/message.svg",
    items: [
      {
        question: "¿Qué es el foro de la comunidad?",
        answer:
          "El foro es un espacio para que la comunidad universitaria comparta experiencias, consejos sobre sostenibilidad, organice iniciativas ecológicas y se conecte con personas que comparten los mismos valores.",
      },
      {
        question: "¿Puedo publicar artículos en el blog?",
        answer:
          "Actualmente el blog es gestionado por el equipo editorial de ECO CANJE. Sin embargo, puedes proponer temas o compartir tu historia de donación a través del formulario de contacto para que sea considerada como contenido.",
      },
      {
        question: "¿Cómo puedo participar en eventos de reciclaje?",
        answer:
          "Los eventos de reciclaje y sostenibilidad se anuncian en la sección de Comunidad y en el Blog. También puedes suscribirte al newsletter desde el footer para recibir notificaciones anticipadas.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`${styles.accordionCard} ${isOpen ? styles.cardOpen : ""}`}>
      <button onClick={onToggle} className={styles.accordionHeader}>
        <span className={`${styles.questionText} ${isOpen ? styles.questionActive : ""}`}>
          {item.question}
        </span>
        <img
          src="/svg/arrowDown.svg"
          alt="arrowdown"
          className={`${styles.arrowIcon} ${isOpen ? styles.arrowRotate : ""}`}
        />
      </button>
      {isOpen && (
        <div className={styles.accordionBody}>
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  const displayCategories = search
    ? filtered.filter((c) => c.items.length > 0)
    : filtered.filter((c) => c.id === activeCategory);

  const totalResults = filtered.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* Encabezado */}
        <div className={styles.headerArea}>
          <div className={styles.iconCircle}>
            <img src="/svg/helpCircle.svg" alt="help" className={styles.topIconImg} />
          </div>
          <h1 className={styles.mainTitle}>Preguntas Frecuentes</h1>
          <p className={styles.mainSubtitle}>
            Encuentra respuesta a las dudas más comunes sobre ECO CANJE
          </p>
        </div>

        {/* Buscador */}
        <div className={styles.searchBox}>
          <img src="/svg/search.svg" alt="email" className={styles.searchIcon} style={{ opacity: 0.4 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            placeholder="Buscar pregunta..."
          />
          {search && (
            <span className={styles.resultBadge}>
              {totalResults} resultado{totalResults !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Pestañas de Categorías */}
        {!search && (
          <div className={styles.tabsRow}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`${styles.tabButton} ${
                  activeCategory === cat.id ? styles.tabActive : ""
                }`}
              >
                <img src={cat.icon} alt="" className={styles.tabIcon} />
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Bloque de Preguntas */}
        <div className={styles.faqList}>
          {displayCategories.map((cat) => (
            <div key={cat.id} className={styles.categoryBlock}>
              <div className={styles.categoryTitleRow}>
                <div className={styles.miniIconCircle}>
                  <img src={cat.icon} alt="" className={styles.miniIcon} />
                </div>
                <h2>{cat.label}</h2>
                <span className={styles.countBadge}>
                  {cat.items.length} pregunta{cat.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className={styles.accordionContainer}>
                {cat.items.map((item, i) => {
                  const key = `${cat.id}-${i}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={openIndex === key}
                      onToggle={() => setOpenIndex(openIndex === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Alerta de no resultados */}
        {search && totalResults === 0 && (
          <div className={styles.noResults}>
            <p>No encontramos resultados para "<strong>{search}</strong>"</p>
            <button onClick={() => setSearch("")} className={styles.clearBtn}>
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Banner Inferior de CTA */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaIconWrap}>
            <img src="/svg/gift.svg" alt="" className={styles.ctaIcon} />
          </div>
          <h3 className={styles.ctaTitle}>¿No encontraste tu respuesta?</h3>
          <p className={styles.ctaSubtitle}>
            Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
          </p>
          <div className={styles.ctaButtonsGroup}>
            <Link href="/contact" className={styles.btnPrimary}>
              Contactar soporte
            </Link>
            <Link href="/community" className={styles.btnSecondary}>
              Preguntar en la comunidad
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}