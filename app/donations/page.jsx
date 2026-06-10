"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import styles from "./donations.module.css";
import { db } from "../../firebase/donations";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

const IMPACT_BASE = {
  donaciones: 0,
  puntos: 0,
  nivel: "Nuevo",
};

const TAG_LABELS = {
  articulos: "Artículo",
  reciclables: "Reciclable",
  alimentos: "Alimento",
};

/* ============================================
   DONATION CARD
============================================ */
function DonationCard({ donation, onSolicitar, onLike, onShare, isGuest }) {
  const {
    id,
    type,
    title,
    description,
    likes,
    liked,
    solicitado,
    comments = [],
  } = donation;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    donation.onCommentAdd?.(id, commentText);
    setCommentText("");
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardUser}>
          <div className={styles.avatar}>{title?.charAt(0).toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Usuario ECO</span>
            <span className={styles.userTime}>Publicación reciente</span>
          </div>
        </div>
        <span className={styles.ptsBadge}>+50 pts</span>
      </div>

      <div className={styles.cardBody}>
        <span className={`${styles.cardTag} ${styles[`tag_${type}`]}`}>
          {TAG_LABELS[type]}
        </span>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDesc}>{description}</p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardActions}>
          {/* BOTÓN DE LIKES */}
          <button
            className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
            onClick={() => onLike(id)}
          >
            <Image src="/svg/heart.svg" alt="Like" width={16} height={16} />{" "}
            {likes || 0}
          </button>

          {/* BOTÓN DE COMENTARIOS (CORREGIDO) */}
          <button
            className={`${styles.actionBtn} ${showComments ? styles.activeComments : ""}`}
            onClick={() => setShowComments(!showComments)}
          >
            <Image
              src="/svg/messageGreen.svg"
              alt="Comment"
              width={16}
              height={16}
            />{" "}
            {comments.length}
          </button>

          {/* BOTÓN DE COMPARTIR */}
          <button
            className={styles.actionBtn}
            onClick={() => onShare(donation)}
          >
            <Image src="/svg/share.svg" alt="Share" width={16} height={16} />{" "}
            Compartir
          </button>
        </div>

        <button
          className={`${styles.btnSolicitar} ${
            solicitado || isGuest ? styles.solicitado : ""
          }`}
          onClick={() => {
            if (isGuest) {
              alert("Debes iniciar sesión para solicitar donaciones");
              return;
            }
            onSolicitar(donation);
          }}
          disabled={solicitado || isGuest}
        >
          {isGuest
            ? "Inicia sesión"
            : solicitado
              ? "✓ Solicitado"
              : "Solicitar"}
        </button>
      </div>

      {/* BLOQUE DE COMENTARIOS COMPLETO */}
      {showComments && (
        <div className={styles.commentsBox}>
          <hr className={styles.divider} />

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>
                Aún no hay comentarios. ¡Sé el primero!
              </p>
            ) : (
              comments.map((c, index) => (
                <div key={index} className={styles.commentItem}>
                  <strong>{c.user}:</strong> <span>{c.text}</span>
                </div>
              ))
            )}
          </div>

          {!isGuest ? (
            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
              <input
                type="text"
                placeholder="Escribe un comentario público..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={styles.commentInput}
              />
              <button type="submit" className={styles.commentSubmitBtn}>
                Enviar
              </button>
            </form>
          ) : (
            <p className={styles.loginWarning}>
              Inicia sesión para dejar un comentario.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

/* ============================================
   MODAL
============================================ */
function SolicitarModal({ donation, onClose, onConfirm }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (donation) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [donation]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!donation) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Solicitar: {donation.title}</h2>

          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDesc}>{donation.description}</p>

          <label className={styles.modalLabel}>Mensaje para el donante</label>

          <textarea
            ref={textareaRef}
            className={styles.modalTextarea}
            placeholder="Ej: Hola, me gustaría solicitar esta donación..."
          />

          <button
            className={styles.confirmBtn}
            onClick={() => {
              onConfirm(donation.id);
              onClose();
            }}
          >
            Confirmar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   TOAST
============================================ */
function Toast({ message, onHide }) {
  useEffect(() => {
    if (!message) return;

    const t = setTimeout(onHide, 3000);

    return () => clearTimeout(t);
  }, [message, onHide]);

  return (
    <div className={`${styles.toast} ${message ? styles.toastShow : ""}`}>
      {message}
    </div>
  );
}

/* ============================================
   PAGE PRINCIPAL
============================================ */
export default function DonacionesPage() {
  const [user, setUser] = useState(null);
  const isGuest = !user;
  const [donations, setDonations] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  /* ============================================
     FIREBASE REALTIME
  ============================================ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        liked: false,
        solicitado: false,
      }));

      setDonations(data);
    });

    return () => unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return donations.filter((d) => {
      const matchFilter = currentFilter === "todas" || d.type === currentFilter;

      const matchSearch =
        !q ||
        d.title?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [donations, currentFilter, searchQuery]);

  const handleLike = useCallback(
    async (id) => {
      const donation = donations.find((d) => d.id === id);
      const donationRef = doc(db, "donations", id);

      setDonations((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                liked: !d.liked,
                likes: d.liked ? (d.likes || 0) - 1 : (d.likes || 0) + 1,
              }
            : d,
        ),
      );

      await updateDoc(donationRef, {
        likes: increment(donation.liked ? -1 : 1),
      });
    },
    [donations],
  );

  const handleAddComment = useCallback(
  async (id, text) => {
    try {
      const donationRef = doc(db, "donations", id);
      const currentUserNames = auth.currentUser?.displayName || "Usuario ECO";

      console.log(" Usuario actual:", auth.currentUser);
      console.log("Donation ID:", id);
      console.log("Texto:", text);

      await updateDoc(donationRef, {
        comments: arrayUnion({
          user: currentUserNames,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        }),
      });

      console.log("Comentario guardado");
      showToast("Comentario publicado");
    } catch (error) {
      console.error("Error completo:", error.code, error.message);
      showToast("No se pudo enviar el comentario");
    }
  },
  [showToast],
);

  const handleShare = useCallback(
    (donation) => {
      if (navigator.share) {
        navigator.share({
          title: donation.title,
          text: donation.description,
          url: window.location.href,
        });
      } else {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => showToast("🔗 Enlace copiado"));
      }
    },
    [showToast],
  );

  const handleConfirmSolicitar = useCallback(
    async (id) => {
      try {
        await addDoc(collection(db, "requests"), {
          donationId: id,
          userId: user?.uid || "guest",
          userEmail: user?.email || "",
          createdAt: serverTimestamp(),
        });

        setDonations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, solicitado: true } : d)),
        );
        showToast("Solicitud enviada");
      } catch (e) {
        showToast("Error al enviar solicitud");
      }
    },
    [user, showToast],
  );

  const migrarComments = async () => {
  const snapshot = await getDocs(collection(db, "donations"));
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (!Array.isArray(data.comments)) {
      await updateDoc(doc(db, "donations", docSnap.id), {
        comments: []
      });
    }
  }
  alert("Migración completada ✅");
};

  return (
    <main className={styles.mainBg}>
      <div className={styles.layout}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 20L17 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="text"
              placeholder="Buscar donaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 12H17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 18H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Filtrar por Tipo
            </div>

            <div className={styles.filterOptions}>
              {[
                { id: "todas", label: "Todas" },
                { id: "articulos", label: "Artículos" },
                { id: "reciclables", label: "Reciclables" },
                { id: "alimentos", label: "Alimentos" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  className={`${styles.filterBtn} ${
                    currentFilter === id ? styles.active : ""
                  }`}
                  onClick={() => setCurrentFilter(id)} // Ahora guarda "articulos" en vez de "Articulos"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.impactCard}>
            <div className={styles.impactHeader}>Tu Impacto</div>

            <div className={styles.impactRows}>
              <div className={styles.impactRow}>
                <span className={styles.impactLabel}>Donaciones:</span>

                <span className={styles.impactValue}>
                  {IMPACT_BASE.donaciones}
                </span>
              </div>

              <div className={styles.impactRow}>
                <span className={styles.impactLabel}>Puntos:</span>

                <span className={styles.impactValue}>{IMPACT_BASE.puntos}</span>
              </div>

              <div className={styles.impactRow}>
                <span className={styles.impactLabel}>Nivel:</span>

                <span className={styles.impactNivel}>{IMPACT_BASE.nivel}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* FEED */}
        <section className={styles.feed}>
          <div className={styles.feedHeader}>
            <h1>Feed de Donaciones</h1>

            <p>Descubre y solicita donaciones de la comunidad universitaria</p>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No hay donaciones publicadas.</p>
            </div>
          ) : (
            <div className={styles.cardsContainer}>
              {filtered.map((donation) => (
                <DonationCard
                  key={donation.id}
                  donation={{
                    ...donation,
                    comments: donation.comments || [],
                    onCommentAdd: handleAddComment,
                  }}
                  onSolicitar={setActiveModal}
                  onLike={handleLike}
                  onShare={handleShare}
                  isGuest={isGuest}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <SolicitarModal
        donation={activeModal}
        onClose={() => setActiveModal(null)}
        onConfirm={handleConfirmSolicitar}
      />

      <Toast message={toastMsg} onHide={() => setToastMsg("")} />
    </main>
  );
}
