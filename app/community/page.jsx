"use client";

import { useEffect, useState } from "react";
import styles from "./community.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/db";
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
} from "firebase/firestore";

/*
 * ESQUEMA ASUMIDO EN FIRESTORE (ajusta si el tuyo es distinto):
 *
 * forumPosts/{autoId}
 *   - title: string
 *   - authorId: string
 *   - authorName: string
 *   - createdAt: Timestamp
 *   - likes: string[]        -> uids que dieron like (evita likes duplicados)
 *   - commentsCount: number
 *
 * events/{autoId}
 *   - title, date, hour, place: string
 *   - attendees: string[]    -> uids que confirmaron asistencia
 *
 * stories/{autoId}
 *   - title, author, description, image: string
 *   - likes: string[]
 *
 * users/{uid}
 *   - points: number         -> ya usado en /benefits
 *   - displayName: string    -> opcional, si no existe se usa "Usuario"
 *
 * Estas colecciones empiezan VACÍAS. "events" y "stories" no tienen UI de
 * creación en esta página (son contenido curado/admin), así que debes
 * cargar algunos documentos manualmente desde la consola de Firebase para
 * verlos aquí. Te dejo ejemplos abajo en las notas.
 */

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

  const [pendingId, setPendingId] = useState(null); // evita doble-click en likes/asistir
  const [toast, setToast] = useState("");

  // Auth — FIX: ya no redirige a /login. El invitado puede mirar la
  // comunidad en modo lectura, igual que en /publish y /benefits.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Foro en tiempo real
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

  // Eventos en tiempo real
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

  // Historias en tiempo real
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

  // Top 3 contribuidores por puntos
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
    if (isGuest) return;
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
    if (isGuest) return;
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
                    <div className={styles.forumItem} key={forum.id}>
                      <h3 className={styles.forumTitle}>{forum.title}</h3>

                      <div className={styles.forumMeta}>
                        <div className={styles.metaLeft}>
                          <span>Por {forum.authorName}</span>
                        </div>

                        <div className={styles.metaRight}>
                          <span className={styles.metaIcon}>
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
                            onClick={() =>
                              toggleLike("forumPosts", forum.id, forum.likes)
                            }
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
                        style={{ backgroundImage: `url(${story.image})` }}
                      >
                        <div className={styles.storyOverlay}>
                          <h3>{story.title}</h3>
                          <p>Por {story.author}</p>
                        </div>
                      </div>

                      <div className={styles.storyBody}>
                        <p>{story.description}</p>

                        <div className={styles.storyFooter}>
                          <button
                            disabled={isGuest || pendingId === story.id}
                            className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
                            onClick={() =>
                              toggleLike("stories", story.id, story.likes)
                            }
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

                          <button disabled={isGuest} className={styles.readMore}>
                            {isGuest ? "Registrarse →" : "Leer más →"}
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

      {/* MODAL */}
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

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}