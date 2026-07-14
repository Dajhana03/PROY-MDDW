"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./community.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth"; // Asegúrate de que la ruta sea correcta [cite: 6]
import { db } from "../../firebase/db"; // Asegúrate de que la ruta sea correcta [cite: 6]
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const IMPACT_BASE = {
  donaciones: 0,
  puntos: 0,
  nivel: "Nuevo",
};

/* ============================================
   ICONOS SVG AUXILIARES
============================================ */
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ============================================
   MODAL DETALLE DE DISCUSIÓN (FORO)
============================================ */
function DiscussionModal({ discussion, onClose, user, isGuest, setToast }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Escuchar comentarios en tiempo real para esta discusión específica
  useEffect(() => {
    if (!discussion) return;
    const commentsRef = collection(db, "forumPosts", discussion.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [discussion]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (isGuest || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const commentsRef = collection(db, "forumPosts", discussion.id, "comments");
      
      // 1. Añadimos el comentario a la subcolección
      await addDoc(commentsRef, {
        text: newComment.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Usuario",
        createdAt: serverTimestamp(),
      });

      // 2. Incrementamos el contador commentsCount en el documento principal
      const postRef = doc(db, "forumPosts", discussion.id);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      setNewComment("");
      setToast("Comentario añadido");
    } catch (err) {
      console.error("Error al añadir comentario:", err);
      setToast("No se pudo publicar el comentario");
    } finally {
      setSubmitting(false);
    }
  };

  if (!discussion) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className={styles.modalHeader}>
          <h2>Discusión: {discussion.title}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "15px 0" }}>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "15px" }}>
            Iniciada por <strong>{discussion.authorName}</strong>
          </p>

          <hr style={{ border: "0", borderTop: "1px solid #eee", marginBottom: "15px" }} />

          <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>Comentarios ({comments.length})</h3>
          
          <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
            {comments.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#999", fontStyle: "italic" }}>Sin comentarios aún. ¡Sé el primero!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#10b981", marginBottom: "3px" }}>
                    {c.authorName}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#333" }}>{c.text}</p>
                </div>
              ))
            )}
          </div>

          {!isGuest ? (
            <form onSubmit={handleAddComment} style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Escribe una respuesta pública..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  flex: "1",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "0.9rem"
                }}
                required
              />
              <button 
                type="submit" 
                className={styles.btnPrimary} 
                disabled={submitting}
                style={{ padding: "0 15px" }}
              >
                {submitting ? "..." : "Enviar"}
              </button>
            </form>
          ) : (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", fontStyle: "italic" }}>
              🔒 Registrate o inicia sesión para comentar en esta discusión.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   MODAL DETALLE DE HISTORIA
============================================ */
function StoryModal({ story, onClose }) {
  if (!story) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px", padding: "0", overflow: "hidden" }}>
        <div 
          style={{ 
            backgroundImage: `url(${story.image})`, 
            height: "200px", 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            position: "relative" 
          }}
        >
          <div style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            padding: "15px",
            color: "white"
          }}>
            <h2 style={{ margin: "0", fontSize: "1.3rem" }}>{story.title}</h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", opacity: "0.9" }}>Escrita por {story.author}</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              position: "absolute", 
              top: "15px", 
              right: "15px", 
              backgroundColor: "rgba(0,0,0,0.5)", 
              border: "none", 
              color: "white", 
              borderRadius: "50%", 
              width: "32px", 
              height: "32px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#4b5563", whiteSpace: "pre-wrap" }}>
            {story.description}
          </p>
          <button 
            className={styles.btnPrimary} 
            onClick={onClose}
            style={{ marginTop: "20px", width: "100%" }}
          >
            Cerrar Historia
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PÁGINA PRINCIPAL DE COMUNIDAD
============================================ */
export default function CommunityPage() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const isGuest = !user;

  const [forums, setForums] = useState([]);
  const [events, setEvents] = useState([]);
  const [stories, setStories] = useState([]);
  const [contributors, setContributors] = useState([]);

  const [forumsLoaded, setForumsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [storiesLoaded, setStoriesLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [posting, setPosting] = useState(false);
  const [pendingId, setPendingId] = useState(null); 
  const [toast, setToast] = useState("");

  // Estados de interacción adicionales
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  // Auth [cite: 16]
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Foro en tiempo real [cite: 18]
  useEffect(() => {
    const q = query(collection(db, "forumPosts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setForums(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setForumsLoaded(true);
      },
      (err) => {
        console.error("Error leyendo foro:", err);
        setForumsLoaded(true);
      },
    );
    return () => unsubscribe();
  }, []);

  // Eventos en tiempo real [cite: 20]
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setEventsLoaded(true);
      },
      (err) => {
        console.error("Error leyendo eventos:", err);
        setEventsLoaded(true);
      },
    );
    return () => unsubscribe();
  }, []);

  // Historias en tiempo real [cite: 22]
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStoriesLoaded(true);
      },
      (err) => {
        console.error("Error leyendo historias:", err);
        setStoriesLoaded(true);
      },
    );
    return () => unsubscribe();
  }, []);

  // Top 3 contribuidores por puntos [cite: 24]
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(3));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setContributors(
          snap.docs.map((d, i) => ({
            rank: i + 1,
            name: d.data().displayName || "Usuario",
            points: d.data().points || 0,
            badge: ["🏅", "🥈", "🥉"][i] || "🎖️",
          })),
        );
      },
      (err) => console.error("Error leyendo contribuidores:", err),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleLike = async (collectionName, id, currentLikes) => {
    if (isGuest) {
      setToast("🔒 Registrate para dar me gusta");
      return;
    }
    if (pendingId === id) return;
    setPendingId(id);
    try {
      const ref = doc(db, collectionName, id);
      const hasLiked = (currentLikes || []).includes(user.uid);
      await updateDoc(ref, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error("Error al dar like:", err);
      setToast("No se pudo guardar tu like");
    } finally {
      setPendingId(null);
    }
  };

  const toggleAttend = async (eventId, currentAttendees) => {
    if (isGuest) {
      setToast("🔒 Registrate para asistir");
      return;
    }
    if (pendingId === eventId) return;

    setPendingId(eventId);
    try {
      const ref = doc(db, "events", eventId);
      const isAttending = (currentAttendees || []).includes(user.uid);
      await updateDoc(ref, {
        attendees: isAttending ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error("Error al confirmar asistencia:", err);
      setToast("No se pudo guardar tu asistencia");
    } finally {
      setPendingId(null);
    }
  };

  const handleNewDiscussion = async (e) => {
    e.preventDefault();
    if (isGuest || !newTitle.trim() || posting) return;

    setPosting(true);
    try {
      await addDoc(collection(db, "forumPosts"), {
        title: newTitle.trim(),
        authorId: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Usuario",
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
      });
      setNewTitle("");
      setShowModal(false);
      setToast("Discusión publicada");
    } catch (err) {
      console.error("Error al publicar discusión:", err);
      setToast("No se pudo publicar. Intenta de nuevo");
    } finally {
      setPosting(false);
    }
  };

  if (loadingAuth) {
    return <div className={styles.page} />;
  }

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {/* HERO */}
        <section className={styles.hero}>
          <h1>Comunidad ECO CANJE</h1>
          <p>
            Conecta, comparte y aprende con estudiantes comprometidos con el
            cambio
          </p>
          {isGuest && (
            <div className={styles.guestWarning}>
              ✨ Regístrate para participar en la comunidad y acceder a
              funciones exclusivas
            </div>
          )}
        </section>

        {/* STATS */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21V19C16 17.3 14.7 16 13 16H7C5.3 16 4 17.3 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 21V19.5C20 18.2 19.2 17 18 16.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 4.5C17.8 5 19 6.4 19 8C19 9.6 17.8 11 16 11.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2>{contributors.length > 0 ? "Activa" : "—"}</h2>
            <span>Miembros</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15C21 16.1 20.1 17 19 17H8L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>{forums.length}</h2>
            <span>Discusiones</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h2>{events.length}</h2>
            <span>Eventos</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>
              {forums.reduce((s, f) => s + (f.likes?.length || 0), 0) +
                stories.reduce((s, st) => s + (st.likes?.length || 0), 0)}
            </h2>
            <span>Impactos</span>
          </div>
        </section>

        {/* GRID */}
        <section className={styles.grid}>
          {/* LEFT */}
          <div className={styles.leftCol}>
            {/* FORO */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15C21 16.1 20.1 17 19 17H8L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Foro de Discusión
                </h2>

                <button
                  className={styles.btnPrimary}
                  disabled={isGuest}
                  onClick={() => !isGuest && setShowModal(true)}
                >
                  {isGuest ? "Registrarse" : "Nueva Discusión"}
                </button>
              </div>

              <div className={styles.forumList}>
                {forumsLoaded && forums.length === 0 && (
                  <p className={styles.emptyState}>
                    Todavía no hay discusiones. ¡Sé el primero en abrir una!
                  </p>
                )}

                {forums.map((forum) => {
                  const liked = !isGuest && (forum.likes || []).includes(user?.uid);
                  return (
                    <div 
                      className={styles.forumItem} 
                      key={forum.id} 
                      onClick={() => setSelectedDiscussion(forum)} // Abre el detalle interactivo
                      style={{ cursor: "pointer" }}
                    >
                      <h3 className={styles.forumTitle}>{forum.title}</h3>

                      <div className={styles.forumMeta} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.metaLeft}>
                          <span>Por {forum.authorName}</span>
                        </div>

                        <div className={styles.metaRight}>
                          <span className={styles.metaIcon} onClick={() => setSelectedDiscussion(forum)} style={{ cursor: "pointer" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M21 15C21 16.1 20.1 17 19 17H8L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {forum.commentsCount || 0}
                          </span>

                          <button
                            disabled={isGuest || pendingId === forum.id}
                            className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike("forumPosts", forum.id, forum.likes);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {(forum.likes || []).length}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HISTORIAS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                Historias Inspiradoras
              </h2>

              {storiesLoaded && stories.length === 0 && (
                <p className={styles.emptyState}>
                  Aún no hay historias publicadas.
                </p>
              )}

              <div className={styles.storiesGrid}>
                {stories.map((story) => {
                  const liked = !isGuest && (story.likes || []).includes(user?.uid);
                  return (
                    <div className={styles.storyCard} key={story.id}>
                      <div
                        className={styles.storyImg}
                        style={{ backgroundImage: `url(${story.image})`, cursor: "pointer" }}
                        onClick={() => setSelectedStory(story)}
                      >
                        <div className={styles.storyOverlay}>
                          <h3>{story.title}</h3>
                          <p>Por {story.author}</p>
                        </div>
                      </div>

                      <div className={styles.storyBody}>
                        <p>{story.description.slice(0, 100)}...</p>

                        <div className={styles.storyFooter}>
                          <button
                            disabled={isGuest || pendingId === story.id}
                            className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
                            onClick={() => toggleLike("stories", story.id, story.likes)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            </svg>
                            {(story.likes || []).length}
                          </button>

                          <button 
                            className={styles.readMore}
                            onClick={() => setSelectedStory(story)} // Abre el modal de la historia completa
                          >
                            Leer más →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            {/* EVENTOS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                </svg>
                Próximos Eventos
              </h2>

              {eventsLoaded && events.length === 0 && (
                <p className={styles.emptyState}>No hay eventos programados.</p>
              )}

              {events.map((event) => {
                const attending = !isGuest && (event.attendees || []).includes(user?.uid);
                return (
                  <div className={styles.eventItem} key={event.id}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>

                    <div className={styles.eventDetails}>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {event.date}
                      </p>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {event.hour}
                      </p>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21C12 21 19 14.5 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.5 12 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {event.place}
                      </p>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M4 21C4 17.5 7 15 12 15C17 15 20 17.5 20 21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {(event.attendees || []).length} asistirán
                      </p>
                    </div>

                    <button
                      disabled={isGuest || pendingId === event.id}
                      className={attending ? styles.btnAttending : styles.btnPrimary}
                      onClick={() => toggleAttend(event.id, event.attendees)}
                    >
                      {isGuest
                        ? "Registrarse"
                        : attending
                          ? "Asistiendo"
                          : "Asistir"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* CONTRIBUTORS */}
            <div className={styles.contributorsCard}>
              <h2 className={styles.contributorsTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 4H17V8C17 11.3 14.8 14 12 14C9.2 14 7 11.3 7 8V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M7 6H4V8C4 9.6 5.3 11 7 11" stroke="currentColor" strokeWidth="2" />
                  <path d="M17 6H20V8C20 9.6 18.7 11 17 11" stroke="currentColor" strokeWidth="2" />
                </svg>
                Top Contributors
              </h2>

              <div className={styles.contributorsList}>
                {contributors.length === 0 && (
                  <p className={styles.emptyState} style={{ color: "white", opacity: 0.85 }}>
                    Aún no hay datos suficientes.
                  </p>
                )}
                {contributors.map((c) => (
                  <div className={styles.contributorItem} key={c.rank}>
                    <div className={styles.contributorLeft}>
                      <div className={styles.rank}>{c.rank}</div>
                      <div>
                        <p className={styles.contributorName}>{c.name}</p>
                        <p className={styles.contributorPoints}>{c.points} puntos</p>
                      </div>
                    </div>
                    <span>{c.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* MODAL CREAR DISCUSIÓN */}
      {showModal && !isGuest && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Discusión</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleNewDiscussion}>
              <div className={styles.field}>
                <label>Título</label>
                <input
                  type="text"
                  placeholder="¿Sobre qué quieres hablar?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                style={{ width: "100%" }}
                disabled={posting}
              >
                {posting ? "Publicando..." : "Publicar Discusión"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DEL FORO / COMENTARIOS */}
      <DiscussionModal
        discussion={selectedDiscussion}
        onClose={() => setSelectedDiscussion(null)}
        user={user}
        isGuest={isGuest}
        setToast={setToast}
      />

      {/* MODAL DETALLES HISTORIA INSPIRADORA */}
      <StoryModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      {/* TOAST */}
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}