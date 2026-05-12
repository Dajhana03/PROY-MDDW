"use client";

import Link from "next/link";
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
              <a href="#" className="primary-btn">
                Comenzar Ahora
              </a>
              <a href="#" className="secondary-btn">
                Ver Donaciones
              </a>
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
                  <img
                    src="/svg/recycling.svg"
                    alt="recycling"
                    className={styles.starHome}
                  />
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
                    <i className={`fa-solid ${icon}`} />
                  </div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/benefits" className="primary-btn small-btn">
              Ver Beneficios
            </Link>
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
                  <div className={styles.avatar} />
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
                  <i className={`fa-solid ${icon}`} />
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
            <a href="#" className="primary-btn small-btn">
              Ver Todas las Donaciones
            </a>
            <a href="#" className="secondary-btn small-btn">
              Publicar Donación
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
