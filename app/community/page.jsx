"use client";

import { useEffect, useState } from "react";
import styles from "./community.module.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
const initialForums = [
  {
    id: 1,
    title: "¿Cómo mejorar el reciclaje en el campus?",
    author: "Carlos M.",
    time: "Hace 2 horas",
    comments: 24,
    likes: 45,
    liked: false,
  },
  {
    id: 2,
    title: "Organizando evento de donación masiva",
    author: "Ana R.",
    time: "Hace 5 horas",
    comments: 18,
    likes: 67,
    liked: false,
  },
  {
    id: 3,
    title: "Tips para maximizar puntos",
    author: "María G.",
    time: "Hace 1 día",
    comments: 32,
    likes: 89,
    liked: false,
  },
];

const initialEvents = [
  {
    id: 1,
    title: "Feria de Reciclaje 2026",
    date: "15 Mayo 2026",
    hour: "10:00 AM",
    place: "Plaza Central",
    people: 145,
    attending: false,
  },
  {
    id: 2,
    title: "Taller: Compostaje Casero",
    date: "20 Mayo 2026",
    hour: "3:00 PM",
    place: "Aula Verde",
    people: 67,
    attending: false,
  },
  {
    id: 3,
    title: "Campaña de Donación Masiva",
    date: "25 Mayo 2026",
    hour: "9:00 AM",
    place: "Campus Norte",
    people: 203,
    attending: false,
  },
];

const initialStories = [
  {
    id: 1,
    title: "De estudiante a Eco Líder",
    author: "Carlos Ruiz",
    description:
      "Mi viaje desde mi primera donación hasta convertirme en embajador ECO CANJE.",
    likes: 156,
    liked: false,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
  },
  {
    id: 2,
    title: "Cómo alimentamos a 50 familias",
    author: "Campus Norte",
    description: "La historia de nuestra campaña solidaria que cambió vidas.",
    likes: 234,
    liked: false,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433",
  },
  {
    id: 3,
    title: "Reciclamos 500kg en un mes",
    author: "Grupo Verde",
    description: "Así logramos nuestro objetivo ecológico más ambicioso.",
    likes: 189,
    liked: false,
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
  },
];

const contributors = [
  { rank: 1, name: "Usuario 1", points: 450, badge: "🏅" },
  { rank: 2, name: "Usuario 2", points: 400, badge: "🥈" },
  { rank: 3, name: "Usuario 3", points: 350, badge: "🥉" },
];

export default function CommunityPage() {
  const [forums, setForums] = useState(initialForums);
  const [events, setEvents] = useState(initialEvents);
  const [stories, setStories] = useState(initialStories);

  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const isGuest = !user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/login");
    }
  }, [loadingAuth, user, router]);
  const toggleForumLike = (id) => {
    setForums((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              liked: !f.liked,
              likes: f.liked ? f.likes - 1 : f.likes + 1,
            }
          : f,
      ),
    );
  };

  const toggleStoryLike = (id) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              liked: !s.liked,
              likes: s.liked ? s.likes - 1 : s.likes + 1,
            }
          : s,
      ),
    );
  };

  const toggleAttend = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              attending: !e.attending,
              people: e.attending ? e.people - 1 : e.people + 1,
            }
          : e,
      ),
    );
  };

  const handleNewDiscussion = (e) => {
    e.preventDefault();

    if (!newTitle.trim()) return;

    setForums((prev) => [
      {
        id: Date.now(),
        title: newTitle,
        author: "Tú",
        time: "Ahora",
        comments: 0,
        likes: 0,
        liked: false,
      },
      ...prev,
    ]);

    setNewTitle("");
    setShowModal(false);
  };
  if (loadingAuth) {
    return null;
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
                <circle
                  cx="10"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
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
            <h2>1,200+</h2>
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
            <h2>450+</h2>
            <span>Discusiones</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 3V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 3V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h2>28</h2>
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
            <h2>5,600+</h2>
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
                {forums.map((forum) => (
                  <div className={styles.forumItem} key={forum.id}>
                    <h3 className={styles.forumTitle}>{forum.title}</h3>

                    <div className={styles.forumMeta}>
                      <div className={styles.metaLeft}>
                        <span>Por {forum.author}</span>
                        <span>•</span>
                        <span>{forum.time}</span>
                      </div>

                      <div className={styles.metaRight}>
                        <span className={styles.metaIcon}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M21 15C21 16.1 20.1 17 19 17H8L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {forum.comments}
                        </span>

                        <button
                          disabled={isGuest}
                          className={`${styles.likeBtn} ${
                            forum.liked ? styles.liked : ""
                          }`}
                          onClick={() => !isGuest && toggleForumLike(forum.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {forum.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

              <div className={styles.storiesGrid}>
                {stories.map((story) => (
                  <div className={styles.storyCard} key={story.id}>
                    <div
                      className={styles.storyImg}
                      style={{
                        backgroundImage: `url(${story.image})`,
                      }}
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
                          disabled={isGuest}
                          className={`${styles.likeBtn} ${
                            story.liked ? styles.liked : ""
                          }`}
                          onClick={() => !isGuest && toggleStoryLike(story.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 21S4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11.2 4 12.6 4.8 13.5 6C14.4 4.8 15.8 4 17.5 4C20.5 4 23 6.5 23 9.5C23 15.5 15 21 15 21H12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <button disabled={isGuest} className={styles.readMore}>
                          {isGuest ? "Registrarse →" : "Leer más →"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            {/* EVENTOS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 3V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 3V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                </svg>
                Próximos Eventos
              </h2>

              {events.map((event) => (
                <div className={styles.eventItem} key={event.id}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>

                  <div className={styles.eventDetails}>
                    <p>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="16"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M8 3V7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 3V7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3 10H21"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {event.date}
                    </p>
                    <p>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 7V12L15 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {event.hour}
                    </p>
                    <p>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 21C12 21 19 14.5 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.5 12 21 12 21Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="10"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {event.place}
                    </p>
                    <p>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M4 21C4 17.5 7 15 12 15C17 15 20 17.5 20 21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {event.people} asistirán
                    </p>
                  </div>

                  <button
                    disabled={isGuest}
                    className={
                      event.attending ? styles.btnAttending : styles.btnPrimary
                    }
                    onClick={() => !isGuest && toggleAttend(event.id)}
                  >
                    {isGuest
                      ? "Registrarse"
                      : event.attending
                        ? "Asistiendo"
                        : "Asistir"}
                  </button>
                </div>
              ))}
            </div>

            {/* CONTRIBUTORS */}
            <div className={styles.contributorsCard}>
              <h2 className={styles.contributorsTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 21H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 17V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 4H17V8C17 11.3 14.8 14 12 14C9.2 14 7 11.3 7 8V4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 6H4V8C4 9.6 5.3 11 7 11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M17 6H20V8C20 9.6 18.7 11 17 11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Top Contributors
              </h2>

              <div className={styles.contributorsList}>
                {contributors.map((c) => (
                  <div className={styles.contributorItem} key={c.rank}>
                    <div className={styles.contributorLeft}>
                      <div className={styles.rank}>{c.rank}</div>

                      <div>
                        <p className={styles.contributorName}>{c.name}</p>
                        <p className={styles.contributorPoints}>
                          {c.points} puntos
                        </p>
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
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Discusión</h2>

              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
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
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                style={{ width: "100%" }}
              >
                Publicar Discusión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
