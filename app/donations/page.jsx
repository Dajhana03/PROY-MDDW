"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import styles from "./donations.module.css";
import { db } from "../../firebase/client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

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
   FUNCIÓN AUXILIAR PARA FORMATEAR LA FECHA
============================================ */
const formatDate = (createdAt) => {
  if (!createdAt) return "Publicando...";

  let date;
  if (typeof createdAt.toDate === "function") {
    date = createdAt.toDate();
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else {
    date = new Date(createdAt);
  }

  if (isNaN(date.getTime())) return "Hace un momento";

  return date.toLocaleString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* ============================================
   ICONOS SVG INLINE
============================================ */
function MapPinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginRight: "4px", verticalAlign: "middle", color: "#10b981" }}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ marginLeft: "4px", verticalAlign: "middle" }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20L17 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
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
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ============================================
   DONATION CARD
============================================ */
function DonationCard({
  donation,
  onSolicitar,
  onLike,
  onShare,
  isGuest,
  onImageClick,
}) {
  const {
    id,
    type,
    title,
    description,
    location,
    coordinates,
    likes,
    liked,
    solicitado,
    comments = [],
    images = [],
    ownerName,
    createdAt,
  } = donation;

  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    donation.onCommentAdd?.(id, commentText);
    setCommentText("");
  };

  const displayName = ownerName || "Usuario ECO";

  const mapsUrl =
    coordinates?.lat && coordinates?.lng
      ? `http://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`
      : `http://maps.google.com/?q=${encodeURIComponent(location || "")}`;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardUser}>
          <div className={styles.avatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userTime}>{formatDate(createdAt)}</span>
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

        {location && (
          <div
            className={styles.locationContainer}
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: "1" }}>
              <MapPinIcon />
              <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                <strong>Entrega:</strong> {location}
              </span>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnVerMapa}
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "600",
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
            >
              Ver mapa <ExternalLinkIcon />
            </a>
          </div>
        )}

        {images && images.length > 0 && (
          <div className={styles.cardImagesContainer}>
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Imagen ${idx + 1} de ${title}`}
                className={styles.cardImage}
                style={{ cursor: "zoom-in" }}
                onClick={() => onImageClick && onImageClick(url)}
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.cardActions}>
          <button
            className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
            onClick={() => onLike(id)}
            aria-pressed={!!liked}
            aria-label="Me gusta"
          >
            <HeartIcon filled={!!liked} /> {likes || 0}
          </button>

          <button
            className={`${styles.actionBtn} ${showComments ? styles.activeComments : ""}`}
            onClick={() => setShowComments(!showComments)}
            aria-expanded={showComments}
            aria-label="Ver comentarios"
          >
            <CommentIcon /> {comments.length}
          </button>

          <button
            className={styles.actionBtn}
            onClick={() => onShare(donation)}
            aria-label="Compartir"
          >
            <ShareIcon /> Compartir
          </button>
        </div>

        <button
          className={`${styles.btnSolicitar} ${solicitado || isGuest ? styles.solicitado : ""}`}
          onClick={() => {
            if (isGuest) {
              router.push("/login");
              return;
            }
            onSolicitar(donation);
          }}
          disabled={solicitado}
        >
          {isGuest
            ? "Inicia sesión"
            : solicitado
              ? "✓ Solicitado"
              : "Solicitar"}
        </button>
      </div>

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
   MODAL DE SOLICITUD
============================================ */
function SolicitarModal({ donation, onClose, onConfirm }) {
  const textareaRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (donation) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [donation]);

  useEffect(() => {
    if (donation) setMessage("");
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
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalDesc}>{donation.description}</p>

          <label className={styles.modalLabel}>Mensaje para el donante</label>

          <textarea
            ref={textareaRef}
            className={styles.modalTextarea}
            placeholder="Ej: Hola, me gustaría solicitar esta donación..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            className={styles.confirmBtn}
            onClick={() => {
              onConfirm(donation.id, message.trim());
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
   NUEVO: MODAL VISOR DE IMÁGENES (LIGHTBOX)
============================================ */
function ImageLightbox({ imageUrl, onClose }) {
  useEffect(() => {
    if (imageUrl) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        zIndex: 1100,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "90%",
          maxHeight: "90%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-40px",
            right: "0px",
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <CloseIcon />
        </button>
        <img
          src={imageUrl}
          alt="Vista ampliada"
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}

/* ============================================
   TOAST NOTIFICATION
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
   PÁGINA PRINCIPAL
============================================ */
export default function DonacionesPage() {
  const [user, setUser] = useState(null);
  const isGuest = !user;
  const [donations, setDonations] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        const likedBy = d.likedBy || [];
        const isLiked = auth.currentUser
          ? likedBy.includes(auth.currentUser.uid)
          : false;

        return {
          id: doc.id,
          ...d,
          liked: isLiked,
          likes: d.likes || 0,
          comments: d.comments || [],
        };
      });
      setDonations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
      if (isGuest) {
        showToast("Inicia sesión para dar like");
        return;
      }

      const donation = donations.find((d) => d.id === id);
      if (!donation) return;

      const userId = auth.currentUser.uid;
      const isCurrentlyLiked = donation.liked;

      setDonations((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                liked: !isCurrentlyLiked,
                likes: isCurrentlyLiked
                  ? Math.max(0, d.likes - 1)
                  : d.likes + 1,
              }
            : d,
        ),
      );

      try {
        const donationRef = doc(db, "donations", id);
        await updateDoc(donationRef, {
          likes: increment(isCurrentlyLiked ? -1 : 1),
          likedBy: isCurrentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
        });
      } catch (e) {
        setDonations((prev) => prev.map((d) => (d.id === id ? donation : d)));
        showToast("Error al procesar el like");
      }
    },
    [donations, isGuest, showToast],
  );

  const handleAddComment = useCallback(
    async (id, text) => {
      try {
        const donationRef = doc(db, "donations", id);
        const currentUserName = auth.currentUser?.displayName || "Usuario ECO";

        await updateDoc(donationRef, {
          comments: arrayUnion({
            user: currentUserName,
            text: text.trim(),
            createdAt: new Date().toISOString(),
          }),
        });

        showToast("Comentario publicado");
      } catch (error) {
        showToast("No se pudo enviar el comentario");
      }
    },
    [showToast],
  );

  const handleShare = useCallback(
    (donation) => {
      if (navigator.share) {
        navigator
          .share({
            title: donation.title,
            text: donation.description,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => showToast("Enlace copiado"));
      }
    },
    [showToast],
  );

  const handleConfirmSolicitar = useCallback(
    async (id, mensaje) => {
      try {
        await addDoc(collection(db, "requests"), {
          donationId: id,
          userId: user?.uid || "guest",
          userEmail: user?.email || "",
          mensaje: mensaje || "",
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

  return (
    <main className={styles.mainBg}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar donaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterCard}>
            <div className={styles.filterTitle}>
              <FilterIcon />
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
                  className={`${styles.filterBtn} ${currentFilter === id ? styles.active : ""}`}
                  onClick={() => setCurrentFilter(id)}
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

        <section className={styles.feed}>
          <div className={styles.feedHeader}>
            <h1>Feed de Donaciones</h1>
            <p>Descubre y solicita donaciones de la comunidad universitaria</p>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <p>Cargando donaciones...</p>
            </div>
          ) : filtered.length === 0 ? (
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
                  onImageClick={setActiveImage}
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

      <ImageLightbox
        imageUrl={activeImage}
        onClose={() => setActiveImage(null)}
      />

      <Toast message={toastMsg} onHide={() => setToastMsg("")} />
    </main>
  );
}
