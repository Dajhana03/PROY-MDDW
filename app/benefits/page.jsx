"use client";

import { useEffect, useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import { useCounter } from "../../hooks/useCounter";
import styles from "./benefits.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
const BENEFIT_STATS = [
  { icon: "fa-gift", value: "850", label: "Puntos Disponibles" },
  { icon: "fa-star", value: "12", label: "Beneficios Canjeados" },
  { icon: "fa-wallet", value: "s/2,500", label: "Ahorro Total" },
];

const BENEFITS = [
  {
    id: "cafe",
    iconCls: styles.iconGreen,
    icon: "/svg/cup.svg",
    title: "Café Gratis",
    desc: "Obtén un café gratis en la cafetería del campus.",
    pts: "50 pts",
  },
  {
    id: "libro",
    iconCls: styles.iconTeal,
    icon: "/svg/book.svg",
    title: "Descuento en Librería",
    desc: "20% de descuento en material académico.",
    pts: "100 pts",
  },
  {
    id: "comida",
    iconCls: styles.iconDark,
    icon: "/svg/utensils.svg",
    title: "Vale de Comida",
    desc: "Vale de S/20 para el comedor universitario.",
    pts: "150 pts",
  },
  {
    id: "tienda",
    iconCls: styles.iconOrange,
    icon: "/svg/bag.svg",
    title: "Descuento Tiendas",
    desc: "15% en comercios afiliados.",
    pts: "75 pts",
  },
  {
    id: "eventos",
    iconCls: styles.iconPink,
    icon: "/svg/ticket.svg",
    title: "Entradas a Eventos",
    desc: "Acceso gratis a eventos culturales y deportivos.",
    pts: "200 pts",
  },
  {
    id: "premium",
    iconCls: styles.iconGold,
    icon: "/svg/star3.svg",
    title: "Membresía Premium",
    desc: "Befa-bookneficios premium y acceso exclusivo.",
    pts: "500 pts",
    disabled: true,
  },
];

const HOW_STEPS = [
  {
    n: "1",
    title: "Dona y Acumula",
    desc: "Cada donación te otorga puntos sostenibles.",
  },
  {
    n: "2",
    title: "Elige tu Beneficio",
    desc: "Explora el catálogo y selecciona tus recompensas.",
  },
  {
    n: "3",
    title: "Canjea y Disfruta",
    desc: "Usa tus puntos y aprovecha tus beneficios.",
  },
];

export default function BenefitsPage() {
  const pageRef = useReveal();
  const statsRef = useCounter();
  const [btnStates, setBtnStates] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);
  const isGuest = !user;

  const handleCanjear = (id) => {
    if (isGuest) return;

    setBtnStates((s) => ({ ...s, [id]: "canjeado" }));

    setTimeout(() => {
      setBtnStates((s) => ({ ...s, [id]: "" }));
    }, 2200);
  };

  return (
    <div ref={pageRef}>
      {/* ── BENEFITS HERO ── */}
      <section className={styles.benefitsHero}>
        <div className="container">
          <div className="section-title">
            <h1>Catálogo de Beneficios</h1>
            <p>
              Canjea tus puntos por increíbles beneficios y descuentos
              exclusivos
            </p>
            {isGuest && (
              <div className={styles.guestWarning}>
                Regístrate para desbloquear beneficios y recompensas exclusivas
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className={styles.benefitStats} ref={statsRef}>
            {BENEFIT_STATS.map(({ icon, value, label }) => (
              <div
                key={label}
                className={`benefit-stat-card ${styles.benefitStatCard}`}
              >
                <i className={`fa-solid ${icon}`} />
                <h2>{value}</h2>
                <p>{label}</p>
              </div>
            ))}
          </div>

          {/* Benefit cards */}
          <div className={styles.benefitsGrid}>
            {BENEFITS.map(
              ({ id, iconCls, icon, title, desc, pts, disabled }) => (
                <div
                  key={id}
                  className={`benefit-card ${styles.benefitCard} ${disabled ? styles.disabled : ""}`}
                >
                  <div className={`${styles.benefitCardIcon} ${iconCls}`}>
                    {icon.startsWith("/") || icon.endsWith(".svg") ? (
                      <img
                        src={icon}
                        alt={title}
                        style={{
                          width: "24px",
                          height: "24px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <i className={`fa-solid ${icon}`} />
                    )}
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <div className={styles.benefitFooter}>
                    <span>{pts}</span>
                    <button
                      className={`${styles.canjearBtn} ${btnStates[id] === "canjeado" ? styles.canjeado : ""}`}
                      disabled={
                        isGuest || disabled || btnStates[id] === "canjeado"
                      }
                      onClick={() => {
                        if (isGuest) {
                          window.location.href = "/register";
                          return;
                        }

                        if (!disabled) {
                          handleCanjear(id);
                        }
                      }}
                    >
                      {isGuest
                        ? "Registrarse"
                        : disabled
                          ? "Bloqueado"
                          : btnStates[id] === "canjeado"
                            ? "✓ Canjeado"
                            : "Canjear"}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section className={styles.partnersSection}>
        <div className="container">
          <div className="section-title">
            <h2>Nuestros Socios Comerciales</h2>
          </div>
          <div className={styles.partnersGrid}>
            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path
                  d="M12 2L15 8L22 9L17 14L18 22L12 19L6 22L7 14L2 9L9 8L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path
                  d="M12 3L20 7V17L12 21L4 17V7L12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path
                  d="M4 12L12 4L20 12L12 20L4 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.howItWorks}>
        <div className="container">
          <div className="section-title">
            <h2>¿Cómo Funciona?</h2>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_STEPS.map(({ n, title, desc }) => (
              <div key={n} className={`step-card ${styles.stepCard}`}>
                <div className={styles.stepNumber}>{n}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
