"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReveal } from "../hooks/useReveal";
import { useCounter } from "../hooks/useCounter";
import styles from "./HomePage.module.css";

const DONATION_TYPES = [
  {
    icon: "fa-recycle",
    title: "Reciclables",
    desc: "Papel, plástico, vidrio, libros y componentes reciclables en buen estado.",
    cls: "",
  },
  {
    icon: "fa-box",
    title: "Artículos",
    desc: "Ropa, accesorios, tecnología, útiles y herramientas útiles en buen estado.",
    cls: "",
  },
  {
    icon: "fa-heart",
    title: "Alimentos",
    desc: "Alimentos no perecibles para familias universitarias que lo necesitan.",
    cls: styles.greenLight,
  },
];

const FEATURES = [
  {
    icon: "fa-gift",
    title: "Recompensas Instantáneas",
    desc: "Obtén puntos y premios por cada acción sostenible.",
  },
  {
    icon: "fa-ranking-star",
    title: "Retos y Logros",
    desc: "Sube niveles y desbloquea logros especiales.",
  },
  {
    icon: "fa-leaf",
    title: "Impacto Medible",
    desc: "Visualiza tu contribución al medio ambiente.",
  },
];

const TESTIMONIALS = [
  {
    name: "María Gonzáles",
    role: "Estudiante",
    quote:
      '"He podido donar materiales que ya no usaba y ayudar a otros estudiantes."',
    cls: "",
  },
  {
    name: "Carlos Méndez",
    role: "Voluntario",
    quote: '"La comunidad es increíble y las recompensas realmente motivan."',
    cls: "",
  },
  {
    name: "Ana Rodríguez",
    role: "Participante",
    quote: '"Una plataforma moderna y útil para generar impacto positivo."',
    cls: styles.greenLight,
  },
];

const STATS = [
  { value: "2,500+", label: "Donaciones" },
  { value: "1,200+", label: "Usuarios Activos" },
  { value: "450kg", label: "Reciclado" },
  { value: "85%", label: "Satisfacción" },
];

const AVAILABLE_DONATIONS = [
  {
    icon: "fa-cube",
    title: "Libros de Cálculo y Física",
    desc: "Libros universitarios en excelente estado.",
    cls: "",
  },
  {
    icon: "fa-recycle",
    title: "Electrónicos para Reciclar",
    desc: "Cables, teclados y accesorios electrónicos.",
    cls: "",
  },
  {
    icon: "fa-heart",
    title: "Ropa de Invierno",
    desc: "Chompas y abrigos en excelente estado.",
    cls: styles.greenCard,
  },
];

function HomePage() {
  const pageRef = useReveal();
  const statsRef = useCounter();

  const router = useRouter();
  const isGuest = true;
  const handleRestrictedAccess = () => {
    alert("Inicia sesión o crea una cuenta para acceder a esta función.");
  };
  return (
    <div ref={pageRef}>
      {/* ── HERO ── */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <img src="/svg/star.svg" alt="Star" className={styles.starHome} />
              <span>Red Solidaria Sostenible</span>
            </div>
            <h1 className={styles.titleHome}>Donaciones que Transforman</h1>
            <p>
              Conectamos estudiantes, familias y comunidades universitarias para
              crear un impacto positivo a través de donaciones sostenibles,
              reciclaje y solidaridad.
            </p>
            <div className={styles.heroButtons}>
              <button
                onClick={() => router.push("/register")}
                className="primary-btn"
              >
                Comenzar Ahora
              </button>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo(0, 0);
                  router.push("/donations");
                }}
                className="secondary-btn"
              >
                Ver Donaciones
              </button>
            </div>
          </div>

          <div className={styles.heroImageCard}>
            <div className={styles.heroImage}>
              <img src="/images/donations.webp" alt="Donaciones comunitarias" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TIPOS DE DONACIONES ── */}
      <section className={`section-spacing ${styles.donationTypes}`}>
        <div className="container">
          <div className="section-title">
            <h2>Tipos de Donaciones</h2>
            <p>
              Múltiples formas de contribuir a la comunidad universitaria y al
              medio ambiente
            </p>
          </div>
          <div className={styles.cardsGrid}>
            {DONATION_TYPES.map(({ icon, title, desc, cls }) => (
              <div
                key={title}
                className={`info-card ${styles.infoCard} ${cls}`}
              >
                <div className={styles.cardIcon}>
                  {title === "Reciclables" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 7L10 2L13 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 7H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M17 9L22 10L19 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 15L17 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 17L2 14L5 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 9L7 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {title === "Artículos" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 4H15C16.1 4 17 4.9 17 6V20H7C5.9 20 5 19.1 5 18V4Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 6H19C20.1 6 21 6.9 21 8V20H17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 8H14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {title === "Alimentos" && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect
                        x="7"
                        y="5"
                        width="10"
                        height="14"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M10 3V5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 3V5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 11H14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMIFICACIÓN ── */}
      <section className={styles.gamificationSection}>
        <div className={`container ${styles.gamificationContainer}`}>
          <div className={styles.gamificationImage}>
            <img src="/images/bucket.webp" alt="Reciclaje sostenible" />
          </div>

          <div className={styles.gamificationContent}>
            <h2>Sistema de Puntos Gamificado</h2>
            <p>
              Cada acción suma puntos que puedes canjear por beneficios
              exclusivos, descuentos y recompensas sostenibles.
            </p>

            <div className={styles.featureList}>
              {FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="feature-item">
                  <div className={styles.featureIcon}>
                    {title === "Recompensas Instantáneas" && (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 10H20V20H4V10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 10V20"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M4 14H20"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 10C12 8 10.5 6.5 9 6.5C7.5 6.5 7 8 8 9C9 10 12 10 12 10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 10C12 8 13.5 6.5 15 6.5C16.5 6.5 17 8 16 9C15 10 12 10 12 10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}

                    {title === "Retos y Logros" && (
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 12L6 20L12 17L18 20L16 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {title === "Impacto Medible" && (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 19L19 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 5H19V12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push("/benefits")}
              className="primary-btn small-btn"
            >
              Ver Beneficios
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className={`section-spacing ${styles.testimonials}`}>
        <div className="container">
          <div className="section-title">
            <h2>Historias que Inspiran</h2>
            <p>
              Conoce cómo ECO CANJE está transformando vidas en la comunidad
              universitaria
            </p>
          </div>
          <div className={styles.testimonialGrid}>
            {TESTIMONIALS.map(({ name, role, quote, cls }) => (
              <div
                key={name}
                className={`testimonial-card ${styles.testimonialCard} ${cls}`}
              >
                <div className={styles.testimonialHeader}>
                  <div className={styles.avatar}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21C20 17.5 16.5 15 12 15C7.5 15 4 17.5 4 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4>{name}</h4>
                    <span>{role}</span>
                  </div>
                </div>
                <p>{quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={`container ${styles.statsGrid}`}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="stat-item">
              <h2>{value}</h2>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DONACIONES DISPONIBLES ── */}
      <section className="section-spacing">
        <div className="container">
          <div className="section-title">
            <h2>Donaciones Disponibles</h2>
            <p>Encuentra lo que necesitas o publica lo que quieres donar</p>
          </div>

          <div className={`${styles.cardsGrid} ${styles.donationsGrid}`}>
            {AVAILABLE_DONATIONS.map(({ icon, title, desc, cls }) => (
              <div
                key={title}
                className={`donation-card ${styles.donationCard} ${cls}`}
              >
                <div className={styles.donationTop}>
  {title.includes("Libros") && (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4H18V20H6V4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 8H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 12H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )}

  {title.includes("Electrónicos") && (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 6H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="17"
        r="1"
        fill="currentColor"
      />
    </svg>
  )}

  {title.includes("Ropa") && (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4L12 6L15 4L19 8L16 10V20H8V10L5 8L9 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )}
</div>
                <div className={styles.donationBody}>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <a href="#">Ver detalles →</a>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.centerButtons}>
            <button
              onClick={() => router.push("/donations")}
              className="primary-btn small-btn"
            >
              Ver Todas las Donaciones
            </button>
            <button
              onClick={() => {
                if (isGuest) {
                  handleRestrictedAccess();
                  return;
                }

                router.push("/publish");
              }}
              className="secondary-btn small-btn"
            >
              Publicar Donación
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
