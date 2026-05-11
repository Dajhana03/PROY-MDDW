"use client";
import { useState } from "react";
import styles from "./community.module.css";
import {
  Users, MessageSquare, Calendar, Heart, Star,
  TrendingUp, Send, ArrowRight, MapPin, Clock,
  UserIcon, Plus, X, CheckCircle,
} from "lucide-react";

const initialForums = [
  { id: 1, title: "¿Cómo mejorar el reciclaje en el campus?", author: "Carlos M.", time: "Hace 2 horas", comments: 24, likes: 45, liked: false },
  { id: 2, title: "Organizando evento de donación masiva", author: "Ana R.", time: "Hace 5 horas", comments: 18, likes: 67, liked: false },
  { id: 3, title: "Tips para maximizar puntos", author: "María G.", time: "Hace 1 día", comments: 32, likes: 89, liked: false },
];

const initialEvents = [
  { id: 1, title: "Feria de Reciclaje 2026", date: "15 Mayo 2026", hour: "10:00 AM", place: "Plaza Central", people: 145, attending: false },
  { id: 2, title: "Taller: Compostaje Casero", date: "20 Mayo 2026", hour: "3:00 PM", place: "Aula Verde", people: 67, attending: false },
  { id: 3, title: "Campaña de Donación Masiva", date: "25 Mayo 2026", hour: "9:00 AM", place: "Campus Norte", people: 203, attending: false },
];

const initialStories = [
  { id: 1, title: "De estudiante a Eco Líder", author: "Juan Pérez", description: "Mi viaje desde mi primera donación hasta convertirme en embajador ECO CANJE...", likes: 156, liked: false, image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Cómo alimentamos a 50 familias", author: "Comunidad Campus Norte", description: "La historia de nuestra campaña solidaria que cambió vidas...", likes: 234, liked: false, image: "https://images.unsplash.com/photo-1593113598332-cd59a93f7d2e?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Reciclamos 500kg en un mes", author: "Grupo Verde UNAM", description: "Así logramos nuestro objetivo de reciclaje más ambicioso hasta la fecha...", likes: 189, liked: false, image: "https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=800&auto=format&fit=crop" },
];

const contributors = [
  { rank: 1, name: "Ana Rodríguez", points: 450, badge: "👑" },
  { rank: 2, name: "Carlos Mendoza", points: 400, badge: "🥈" },
  { rank: 3, name: "María García", points: 350, badge: "🥉" },
];

export default function CommunityPage() {
  const [forums, setForums] = useState(initialForums);
  const [events, setEvents] = useState(initialEvents);
  const [stories, setStories] = useState(initialStories);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const toggleForumLike = (id) => {
    setForums((prev) =>
      prev.map((f) => f.id === id ? { ...f, liked: !f.liked, likes: f.liked ? f.likes - 1 : f.likes + 1 } : f)
    );
  };

  const toggleStoryLike = (id) => {
    setStories((prev) =>
      prev.map((s) => s.id === id ? { ...s, liked: !s.liked, likes: s.liked ? s.likes - 1 : s.likes + 1 } : s)
    );
  };

  const toggleAttend = (id) => {
    setEvents((prev) =>
      prev.map((e) => e.id === id ? { ...e, attending: !e.attending, people: e.attending ? e.people - 1 : e.people + 1 } : e)
    );
  };

  const handleNewDiscussion = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setForums((prev) => [
      { id: Date.now(), title: newTitle.trim(), author: "Tú", time: "Ahora mismo", comments: 0, likes: 0, liked: false },
      ...prev,
    ]);
    setNewTitle("");
    setNewContent("");
    setShowModal(false);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className={styles.page}>

      {/* NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <span className={styles.logoText}>ECO CANJE</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#">Inicio</a>
          <a href="#">Donaciones</a>
          <a href="#">Publicar</a>
          <a href="#">Beneficios</a>
          <a href="#" className={styles.activeLink}>Comunidad</a>
          <a href="#">Blog</a>
          <a href="#">Contacto</a>
        </nav>
        <div className={styles.authButtons}>
          <button className={styles.loginBtn}>Iniciar sesión</button>
          <button className={styles.registerBtn}>Registrarse</button>
        </div>
      </header>

      <main className={styles.container}>

        {/* HERO */}
        <section className={styles.hero}>
          <h1>Comunidad ECO CANJE</h1>
          <p>Conecta, comparte y aprende con estudiantes comprometidos con el cambio</p>
        </section>

        {/* STATS */}
        <section className={styles.stats}>
          <div className={styles.statCard}><Users size={28} /><h2>1,200+</h2><span>Miembros</span></div>
          <div className={styles.statCard}><MessageSquare size={28} /><h2>450+</h2><span>Discusiones</span></div>
          <div className={styles.statCard}><Calendar size={28} /><h2>28</h2><span>Eventos</span></div>
          <div className={styles.statCard}><Heart size={28} /><h2>5,600+</h2><span>Impactos</span></div>
        </section>

        {/* GRID */}
        <section className={styles.grid}>
          <div className={styles.leftCol}>

            {/* FORO */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><MessageSquare size={16} />Foro de Discusión</h2>
                <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
                  <Plus size={14} /> Nueva Discusión
                </button>
              </div>
              <div className={styles.forumList}>
                {forums.map((forum) => (
                  <div className={styles.forumItem} key={forum.id}>
                    <h3 className={styles.forumTitle}>{forum.title}</h3>
                    <div className={styles.forumMeta}>
                      <div className={styles.metaLeft}>
                        <span>Por {forum.author}</span>
                        <span className={styles.dot}>•</span>
                        <span>{forum.time}</span>
                      </div>
                      <div className={styles.metaRight}>
                        <span className={styles.metaIcon}><MessageSquare size={11} /> {forum.comments}</span>
                        <button className={`${styles.likeBtn} ${forum.liked ? styles.liked : ""}`} onClick={() => toggleForumLike(forum.id)}>
                          <Heart size={11} fill={forum.liked ? "currentColor" : "none"} /> {forum.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIAS */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: "14px" }}><Star size={16} />Historias Inspiradoras</h2>
              <div className={styles.storiesGrid}>
                {stories.map((story) => (
                  <div className={styles.storyCard} key={story.id}>
                    <div className={styles.storyImg} style={{ backgroundImage: `url(${story.image})` }}>
                      <div className={styles.storyOverlay}>
                        <h3>{story.title}</h3>
                        <p>Por {story.author}</p>
                      </div>
                    </div>
                    <div className={styles.storyBody}>
                      <p>{story.description}</p>
                      <div className={styles.storyFooter}>
                        <button className={`${styles.likeBtn} ${story.liked ? styles.liked : ""}`} onClick={() => toggleStoryLike(story.id)}>
                          <Heart size={12} fill={story.liked ? "currentColor" : "none"} /> {story.likes}
                        </button>
                        <button className={styles.readMore}>Leer más <ArrowRight size={12} /></button>
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
              <h2 className={styles.cardTitle} style={{ marginBottom: "4px" }}><Calendar size={16} /> Próximos Eventos</h2>
              {events.map((event) => (
                <div className={styles.eventItem} key={event.id}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <div className={styles.eventDetails}>
                    <p><Calendar size={11} /> {event.date}</p>
                    <p><Clock size={11} /> {event.hour}</p>
                    <p><MapPin size={11} /> {event.place}</p>
                    <p><UserIcon size={11} /> {event.people} asistirán</p>
                  </div>
                  <button
                    className={event.attending ? styles.btnAttending : styles.btnPrimary}
                    onClick={() => toggleAttend(event.id)}
                    style={{ width: "100%" }}
                  >
                    {event.attending ? <><CheckCircle size={13} /> Asistiendo</> : "Asistir"}
                  </button>
                </div>
              ))}
            </div>

            {/* TOP CONTRIBUTORS */}
            <div className={styles.contributorsCard}>
              <h2 className={styles.contributorsTitle}><TrendingUp size={16} /> Top Contributors</h2>
              <div className={styles.contributorsList}>
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

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🌿</span>
              <span className={styles.logoText}>ECO CANJE</span>
            </div>
            <p className={styles.footerDesc}>Red Solidaria Universitaria: Transformando donaciones en impacto social y sostenibilidad.</p>
            <div className={styles.socials}>
              <span>📘</span><span>📷</span><span>🐦</span><span>💼</span>
            </div>
          </div>
          <div>
            <h3>Enlaces Rápidos</h3>
            <ul><li>Donaciones</li><li>Publicar Donación</li><li>Beneficios</li><li>Comunidad</li></ul>
          </div>
          <div>
            <h3>Recursos</h3>
            <ul><li>Blog</li><li>Contacto</li><li>Dashboard</li><li>FAQs</li></ul>
          </div>
          <div>
            <h3>Newsletter</h3>
            <p className={styles.footerNewsletterDesc}>Recibe noticias sobre sostenibilidad y donaciones</p>
            {subscribed ? (
              <p className={styles.subscribedMsg}><CheckCircle size={14} /> ¡Suscrito correctamente!</p>
            ) : (
              <form className={styles.newsletterBox} onSubmit={handleSubscribe}>
                <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit"><Send size={15} /></button>
              </form>
            )}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 ECO CANJE. Todos los derechos reservados.</p>
          <div className={styles.hashtags}>
            <span>#Reciclar</span><span>#Donaciones</span><span>#EcoCanje</span><span>#Sostenibilidad</span>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nueva Discusión</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleNewDiscussion}>
              <div className={styles.field}>
                <label>Título</label>
                <input type="text" placeholder="¿Sobre qué quieres hablar?" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required autoFocus />
              </div>
              <div className={styles.field}>
                <label>Descripción (opcional)</label>
                <textarea placeholder="Cuéntanos más detalles..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} />
              </div>
              <button type="submit" className={styles.btnPrimary} style={{ width: "100%" }}>Publicar Discusión</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}