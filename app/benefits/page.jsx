"use client";

import { useEffect, useState } from "react";
import { useReveal } from "../../hooks/useReveal";
import { useCounter } from "../../hooks/useCounter";
import styles from "./benefits.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/db";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

// Definición de Beneficios con Costo, Valor y Prefijo para el código de cupón
const BENEFITS = [
  {
    id: "cafe",
    iconCls: styles.iconGreen,
    icon: "/svg/cup.svg",
    title: "Café Gratis",
    desc: "Obtén un café gratis en la cafetería del campus.",
    pointsCost: 50,
    valueSoles: 5,
    prefix: "CAFE",
  },
  {
    id: "libro",
    iconCls: styles.iconTeal,
    icon: "/svg/book.svg",
    title: "Descuento en Librería",
    desc: "20% de descuento en material académico.",
    pointsCost: 100,
    valueSoles: 15,
    prefix: "BOOK",
  },
  {
    id: "comida",
    iconCls: styles.iconDark,
    icon: "/svg/utensils.svg",
    title: "Vale de Comida",
    desc: "Vale de S/20 para el comedor universitario.",
    pointsCost: 150,
    valueSoles: 20,
    prefix: "FOOD",
  },
  {
    id: "tienda",
    iconCls: styles.iconOrange,
    icon: "/svg/bag.svg",
    title: "Descuento Tiendas",
    desc: "15% en comercios afiliados.",
    pointsCost: 75,
    valueSoles: 10,
    prefix: "SHOP",
  },
  {
    id: "eventos",
    iconCls: styles.iconPink,
    icon: "/svg/ticket.svg",
    title: "Entradas a Eventos",
    desc: "Acceso gratis a eventos culturales y deportivos.",
    pointsCost: 200,
    valueSoles: 30,
    prefix: "EVNT",
  },
  {
    id: "premium",
    iconCls: styles.iconGold,
    icon: "/svg/star3.svg",
    title: "Membresía Premium",
    desc: "Beneficios premium y acceso exclusivo.",
    pointsCost: 500,
    valueSoles: 60,
    prefix: "PREM",
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

/* ============================================
   FUNCIÓN AUXILIAR: GENERADOR DE CÓDIGOS DE DESCUENTO
============================================ */
const generateCouponCode = (prefix) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ECO-${prefix}-${randomPart}`;
};

export default function BenefitsPage() {
  const pageRef = useReveal();
  const statsRef = useCounter();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Estados de cálculo dinámico
  const [userDonations, setUserDonations] = useState([]);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [redemptionCount, setRedemptionCount] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  const [processingId, setProcessingId] = useState(null); 
  const [justRedeemed, setJustRedeemed] = useState({}); 
  const [toast, setToast] = useState("");
  
  // Estado para controlar el modal del código de descuento generado
  const [unlockedCoupon, setUnlockedCoupon] = useState(null);

  const isGuest = authChecked && !user;

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // 1. Escuchar las donaciones del usuario en tiempo real
  useEffect(() => {
    if (!user) {
      setUserDonations([]);
      return;
    }
    const q = query(
      collection(db, "donations"),
      where("ownerId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setUserDonations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error("Error leyendo donaciones:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Escuchar los canjes del usuario en tiempo real
  useEffect(() => {
    if (!user) {
      setUserRedemptions([]);
      setRedemptionCount(0);
      setTotalSavings(0);
      return;
    }
    const q = query(
      collection(db, "redemptions"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setUserRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setRedemptionCount(snap.size);
      const total = snap.docs.reduce(
        (sum, d) => sum + (d.data().valueSoles || 0),
        0
      );
      setTotalSavings(total);
    }, (err) => {
      console.error("Error leyendo canjes:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Calcular los puntos disponibles en tiempo real (Ganados - Consumidos)
  useEffect(() => {
    const puntosGanados = userDonations.reduce((sum, d) => sum + (Number(d.puntos) || 50), 0);
    const puntosConsumidos = userRedemptions.reduce((sum, r) => sum + (Number(r.pointsCost) || 0), 0);
    const saldoDisponible = Math.max(0, puntosGanados - puntosConsumidos);
    setUserPoints(saldoDisponible);
  }, [userDonations, userRedemptions]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Función de Canje
  const handleCanjear = async (benefit) => {
    if (isGuest) {
      router.push("/register");
      return;
    }
    if (benefit.disabled || processingId) return;

    if (userPoints < benefit.pointsCost) {
      setToast(
        `⚠️ Te faltan ${benefit.pointsCost - userPoints} puntos para este beneficio`
      );
      return;
    }

    setProcessingId(benefit.id);
    const couponCode = generateCouponCode(benefit.prefix);

    try {
      await addDoc(collection(db, "redemptions"), {
        userId: user.uid,
        benefitId: benefit.id,
        benefitTitle: benefit.title,
        pointsCost: benefit.pointsCost,
        valueSoles: benefit.valueSoles,
        couponCode: couponCode,
        createdAt: new Date(),
      });

      setJustRedeemed((s) => ({ ...s, [benefit.id]: true }));
      setUnlockedCoupon({
        title: benefit.title,
        code: couponCode,
      });

      setTimeout(() => {
        setJustRedeemed((s) => ({ ...s, [benefit.id]: false }));
      }, 2200);
    } catch (err) {
      console.error("Error al canjear:", err);
      setToast("Error al procesar el canje. Intenta de nuevo");
    } finally {
      setProcessingId(null);
    }
  };

  const BENEFIT_STATS = [
    { icon: "fa-gift", value: userPoints, label: "Puntos Disponibles" },
    { icon: "fa-star", value: redemptionCount, label: "Beneficios Canjeados" },
    {
      icon: "fa-wallet",
      value: `S/ ${totalSavings}`,
      label: "Ahorro Total",
    },
  ];

  return (
    <div ref={pageRef}>
      {/* ── BENEFITS HERO ── */}
      <section className={styles.benefitsHero}>
        <div className="container">
          <div className="section-title">
            <h1>Catálogo de Beneficios</h1>
            <p>Canjea tus puntos por increíbles beneficios y descuentos exclusivos</p>
            {isGuest && (
              <div className={styles.guestWarning}>
                Regístrate para desbloquear beneficios y recompensas exclusivas
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className={styles.benefitStats} ref={statsRef}>
            {BENEFIT_STATS.map(({ icon, value, label }) => (
              <div key={label} className={`benefit-stat-card ${styles.benefitStatCard}`}>
                <i className={`fa-solid ${icon}`} />
                <h2>{value}</h2>
                <p>{label}</p>
              </div>
            ))}
          </div>

          {/* Benefit cards */}
          <div className={styles.benefitsGrid}>
            {BENEFITS.map((benefit) => {
              const { id, iconCls, icon, title, desc, pointsCost, disabled } = benefit;
              const isProcessing = processingId === id;
              const isRedeemed = justRedeemed[id];
              const notEnoughPoints = !isGuest && userPoints < pointsCost;

              return (
                <div key={id} className={`benefit-card ${styles.benefitCard} ${disabled ? styles.disabled : ""}`}>
                  <div className={`${styles.benefitCardIcon} ${iconCls}`}>
                    <img
                      src={icon}
                      alt={title}
                      style={{
                        width: "24px",
                        height: "24px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <div className={styles.benefitFooter}>
                    <span>{pointsCost} pts</span>
                    <button
                      className={`${styles.canjearBtn} ${isRedeemed ? styles.canjeado : ""}`}
                      disabled={!isGuest && (disabled || isProcessing || notEnoughPoints)}
                      onClick={() => handleCanjear(benefit)}
                    >
                      {isGuest
                        ? "Registrarse"
                        : disabled
                          ? "Bloqueado"
                          : isProcessing
                            ? "Canjeando..."
                            : isRedeemed
                              ? "✓ Canjeado"
                              : notEnoughPoints
                                ? "Puntos insuficientes"
                                : "Canjear"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MODAL DE CUPÓN DESBLOQUEADO ── */}
      {unlockedCoupon && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div 
            style={{
              backgroundColor: "#ffffff",
              padding: "30px",
              borderRadius: "20px",
              maxWidth: "450px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🎁</div>
            <h2 style={{ color: "#10b981", marginBottom: "10px", fontSize: "1.5rem" }}>¡Beneficio Desbloqueado!</h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "20px" }}>
              Has canjeado con éxito tu <strong>{unlockedCoupon.title}</strong>. Usa el siguiente código para reclamarlo en el campus:
            </p>
            
            <div 
              style={{
                backgroundColor: "#f3f4f6",
                border: "2px dashed #10b981",
                padding: "15px",
                borderRadius: "10px",
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#111827",
                letterSpacing: "2px",
                marginBottom: "25px",
                cursor: "pointer"
              }}
              onClick={() => {
                navigator.clipboard.writeText(unlockedCoupon.code);
                setToast("📋 ¡Código copiado al portapapeles!");
              }}
              title="Haz clic para copiar"
            >
              {unlockedCoupon.code}
            </div>

            <button 
              onClick={() => setUnlockedCoupon(null)}
              style={{
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                padding: "10px 25px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── PARTNERS ── */}
      <section className={styles.partnersSection}>
        <div className="container">
          <div className="section-title">
            <h2>Nuestros Socios Comerciales</h2>
          </div>
          <div className={styles.partnersGrid}>
            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path d="M12 2L15 8L22 9L17 14L18 22L12 19L6 22L7 14L2 9L9 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path d="M12 3L20 7V17L12 21L4 17V7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div className={styles.partnerCard}>
              <svg viewBox="0 0 24 24" fill="none" width="70" height="70">
                <path d="M4 12L12 4L20 12L12 20L4 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
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

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}