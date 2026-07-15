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
  deleteDoc,
  getDoc,
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

// Correos electrónicos autorizados como administradores
const ADMIN_EMAILS = ["robertaquispe@gmail.com", "davidperez@gmail.com", "marco96392@gmail.com", "azul@gmail.com"];

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
  currentUser,
  onDelete,
  onFinish,
  onImageClick,
  isAdmin,
  userRole,
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
    finalizado,
    userId,
    uid,
    ownerId,
    comments = [],
    images = [],
    ownerName,
    createdAt,
  } = donation;

  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // COMPARACIÓN DE ID DEL DUEÑO DE LA PUBLICACIÓN
  const postOwnerId = String(userId || uid || ownerId || "").trim();
  const currentUserId = String(currentUser?.uid || "").trim();
  const isOwner = currentUserId !== "" && postOwnerId !== "" && currentUserId === postOwnerId;

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || finalizado === true) return;
    donation.onCommentAdd?.(id, commentText);
    setCommentText("");
  };

  const displayName = ownerName || "Usuario ECO";

  const mapsUrl =
    coordinates?.lat && coordinates?.lng
      ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent(location || "")}`;

  // Renderizador de botones según el Rol de Negocio
  const renderActionButton = () => {
    // 1. Administrador: Solo eliminar publicación (En todas)[cite: 7]
    if (isAdmin || userRole === "admin") {
      return (
        <button
          className={styles.btnEliminar}
          onClick={() => onDelete(id)}
          style={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          Eliminar publicación
        </button>
      );
    }

    // 2. Si es mi propia publicación (Donante o Ambos) -> Mostrar "Finalizar" y "Borrar"[cite: 7]
    if (isOwner) {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          {!finalizado && (
            <button
              className={styles.btnSolicitar}
              style={{ backgroundColor: "#f59e0b", borderColor: "#f59e0b" }}
              onClick={() => onFinish(id)}
            >
              Finalizar
            </button>
          )}
          <button
            className={styles.btnSolicitar}
            style={{ backgroundColor: "#ef4444", borderColor: "#ef4444" }}
            onClick={() => onDelete(id)}
          >
            Borrar
          </button>
        </div>
      );
    }

    // 3. Si la publicación es AJENA pero el rol de mi perfil es estrictamente "donante" -> OCULTAR COMPLETAMENTE[cite: 7]
    if (userRole === "donante") {
      return null;
    }

    // 4. Receptores o rol mixto "Ambos" en post ajeno -> Mostrar botón "Solicitar"[cite: 7]
    return (
      <button
        className={`${styles.btnSolicitar} ${
          solicitado || isGuest || finalizado ? styles.solicitado : ""
        }`}
        onClick={() => {
          if (finalizado) return;
          if (isGuest) {
            router.push("/login");
            return;
          }
          onSolicitar(donation);
        }}
        disabled={solicitado || finalizado}
      >
        {finalizado
          ? "Finalizado"
          : isGuest
            ? "Inicia sesión"
            : solicitado
              ? "✓ Solicitado"
              : "Solicitar"}
      </button>
    );
  };

  return (
    <article
      className={`${styles.card} ${finalizado ? styles.cardFinalizado : ""}`}
    >
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

        {finalizado ? (
          <span
            className={styles.ptsBadge}
            style={{ backgroundColor: "#9ca3af", color: "#fff" }}
          >
            Finalizado
          </span>
        ) : (
          <span className={styles.ptsBadge}>+50 pts</span>
        )}
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

        {/* Renderizado de botón exclusivo */}
        {renderActionButton()}
      </div>

      {showComments && (
        <div className={styles.commentsBox}>
          <hr className={styles.divider} />

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>
                {finalizado
                  ? "Esta donación ha finalizado. No se admiten más comentarios."
                  : "Aún no hay comentarios. ¡Sé el primero!"}
              </p>
            ) : (
              comments.map((c, index) => (
                <div key={index} className={styles.commentItem}>
                  <strong>{c.user}:</strong> <span>{c.text}</span>
                </div>
              ))
            )}
          </div>

          {!finalizado &&
            (isGuest ? (
              <p className={styles.loginWarning}>
                Inicia sesión para dejar un comentario.
              </p>
            ) : (
              <form
                onSubmit={handleSubmitComment}
                className={styles.commentForm}
              >
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
            ))}
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
   MODAL VISOR DE IMÁGENES (LIGHTBOX)
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
  const [userRole, setUserRole] = useState(null);
  const isGuest = !user;

  const isAdmin = useMemo(() => user && ADMIN_EMAILS.includes(user.email), [user]);
  const [donations, setDonations] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  // Efecto 1: Detecta cambios de autenticación y consulta el rol "user_type" en Firestore[cite: 7]
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userDocRef = doc(db, "users", currentUser.uid);
          let userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
            userDocRef = doc(db, "usuarios", currentUser.uid);
            userDocSnap = await getDoc(userDocRef);
          }

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Apuntamos exactamente al campo real de tu base de datos: user_type[cite: 7]
            const rawRole = userData.user_type || "";
            const role = String(rawRole).toLowerCase().trim();
            
            setUserRole(role);
            showToast(`Perfil cargado con éxito.`);
          } else {
            setUserRole(null);
            showToast("⚠️ Tu usuario no tiene un perfil configurado en Firestore.");
          }
        } catch (error) {
          setUserRole(null);
          showToast("❌ Error al obtener tu tipo de rol de Firestore.");
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, [showToast]);

  // Efecto 2: Escucha en tiempo real la lista de donaciones
  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        const likedBy = d.likedBy || [];
        const isLiked = auth.currentUser
          ? likedBy.includes(auth.currentUser.uid)
          : false;

        const solicitantes = d.solicitantes || [];
        const isSolicitado = auth.currentUser
          ? solicitantes.includes(auth.currentUser.uid)
          : false;

        return {
          id: doc.id,
          ...d,
          liked: isLiked,
          likes: d.likes || 0,
          comments: d.comments || [],
          solicitado: isSolicitado,
        };
      });
      setDonations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
            : d
        )
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
    [donations, isGuest, showToast]
  );

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta publicación permanentemente?")) {
      return;
    }
    try {
      const donationRef = doc(db, "donations", id);
      await deleteDoc(donationRef);
      showToast("Publicación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      showToast("Error al intentar eliminar");
    }
  }, [showToast]);

  const handleAddComment = useCallback(
    async (id, text) => {
      const targetDonation = donations.find((d) => d.id === id);
      if (targetDonation?.finalizado) {
        showToast("La donación ha finalizado, no se puede comentar.");
        return;
      }

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
    [showToast, donations]
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
    [showToast]
  );

  const handleConfirmSolicitar = useCallback(
    async (id, mensaje) => {
      if (!user) return;

      const targetDonation = donations.find((d) => d.id === id);
      if (targetDonation?.finalizado) {
        showToast("La donación ya fue finalizada por el dueño.");
        return;
      }

      try {
        await addDoc(collection(db, "requests"), {
          donationId: id,
          userId: user.uid,
          userEmail: user.email || "",
          mensaje: mensaje || "",
          createdAt: serverTimestamp(),
        });

        const donationRef = doc(db, "donations", id);
        await updateDoc(donationRef, {
          solicitantes: arrayUnion(user.uid),
        });

        showToast("Solicitud enviada");
      } catch (e) {
        showToast("Error al enviar solicitud");
      }
    },
    [user, showToast, donations]
  );

  const handleFinish = useCallback(
    async (id) => {
      if (
        window.confirm(
          "¿Estás seguro de marcar esta donación como finalizada? Ya no se podrán enviar solicitudes ni comentarios.",
        )
      ) {
        try {
          await updateDoc(doc(db, "donations", id), {
            finalizado: true,
          });
          showToast("Donación marcada como finalizada");
        } catch (error) {
          showToast("Error al finalizar la donación");
        }
      }
    },
    [showToast]
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
                  currentUser={user}
                  onDelete={handleDelete}
                  onFinish={handleFinish}
                  onImageClick={setActiveImage}
                  isAdmin={isAdmin}
                  userRole={userRole}
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