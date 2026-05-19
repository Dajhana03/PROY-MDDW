"use client";

import { useState } from "react";
import styles from "./community.module.css";

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
    image: "/images/story1.jpg",
  },
  {
    id: 2,
    title: "Cómo alimentamos a 50 familias",
    author: "Campus Norte",
    description: "La historia de nuestra campaña solidaria que cambió vidas.",
    likes: 234,
    liked: false,
    image: "/images/story2.jpg",
  },
  {
    id: 3,
    title: "Reciclamos 500kg en un mes",
    author: "Grupo Verde",
    description: "Así logramos nuestro objetivo ecológico más ambicioso.",
    likes: 189,
    liked: false,
    image: "/images/story3.jpg",
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

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const toggleForumLike = (id) => {
    setForums((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              liked: !f.liked,
              likes: f.liked ? f.likes - 1 : f.likes + 1,
            }
          : f
      )
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
          : s
      )
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
          : e
      )
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
        </section>

        {/* STATS */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <h2>1,200+</h2>
            <span>Miembros</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <h2>450+</h2>
            <span>Discusiones</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <h2>28</h2>
            <span>Eventos</span>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💚</div>
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
                  💬 Foro de Discusión
                </h2>

                <button
                  className={styles.btnPrimary}
                  onClick={() => setShowModal(true)}
                >
                  ＋ Nueva Discusión
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
                          💬 {forum.comments}
                        </span>

                        <button
                          className={`${styles.likeBtn} ${
                            forum.liked ? styles.liked : ""
                          }`}
                          onClick={() => toggleForumLike(forum.id)}
                        >
                          ❤️ {forum.likes}
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
                ⭐ Historias Inspiradoras
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
                          className={`${styles.likeBtn} ${
                            story.liked ? styles.liked : ""
                          }`}
                          onClick={() => toggleStoryLike(story.id)}
                        >
                          ❤️ {story.likes}
                        </button>

                        <button className={styles.readMore}>
                          Leer más →
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
                📅 Próximos Eventos
              </h2>

              {events.map((event) => (
                <div className={styles.eventItem} key={event.id}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>

                  <div className={styles.eventDetails}>
                    <p>📅 {event.date}</p>
                    <p>⏰ {event.hour}</p>
                    <p>📍 {event.place}</p>
                    <p>👤 {event.people} asistirán</p>
                  </div>

                  <button
                    className={
                      event.attending
                        ? styles.btnAttending
                        : styles.btnPrimary
                    }
                    onClick={() => toggleAttend(event.id)}
                  >
                    {event.attending ? "✔ Asistiendo" : "Asistir"}
                  </button>
                </div>
              ))}
            </div>

            {/* CONTRIBUTORS */}
            <div className={styles.contributorsCard}>
              <h2 className={styles.contributorsTitle}>
                📈 Top Contributors
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
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
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