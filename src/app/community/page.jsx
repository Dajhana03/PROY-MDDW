"use client";
import "./community.css";
import {
  Users,
  MessageSquare,
  Calendar,
  Heart,
  Star,
  TrendingUp,
  Send,
  ArrowRight,
  MapPin,
  Clock,
  UserIcon,
} from "lucide-react";

export default function CommunityPage() {
  const forums = [
    {
      title: "¿Cómo mejorar el reciclaje en el campus?",
      author: "Carlos M.",
      time: "Hace 2 horas",
      comments: 24,
      likes: 45,
    },
    {
      title: "Organizando evento de donación masiva",
      author: "Ana R.",
      time: "Hace 5 horas",
      comments: 18,
      likes: 67,
    },
    {
      title: "Tips para maximizar puntos",
      author: "María G.",
      time: "Hace 1 día",
      comments: 32,
      likes: 89,
    },
  ];

  const events = [
    {
      title: "Feria de Reciclaje 2026",
      date: "15 Mayo 2026",
      hour: "10:00 AM",
      place: "Plaza Central",
      people: "145 asistirán",
    },
    {
      title: "Taller: Compostaje Casero",
      date: "20 Mayo 2026",
      hour: "3:00 PM",
      place: "Aula Verde",
      people: "67 asistirán",
    },
    {
      title: "Campaña de Donación Masiva",
      date: "25 Mayo 2026",
      hour: "9:00 AM",
      place: "Campus Norte",
      people: "203 asistirán",
    },
  ];

  const stories = [
    {
      title: "De estudiante a Eco Líder",
      author: "Juan Pérez",
      description:
        "Mi viaje desde mi primera donación hasta convertirme en embajador ECO CANJE...",
      likes: 156,
      image:
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=800&auto=format&fit=crop",
    },
    {
      title: "Cómo alimentamos a 50 familias",
      author: "Comunidad Campus Norte",
      description:
        "La historia de nuestra campaña solidaria que cambió vidas...",
      likes: 234,
      image:
        "https://images.unsplash.com/photo-1593113598332-cd59a93f7d2e?q=80&w=800&auto=format&fit=crop",
    },
    {
      title: "Reciclamos 500kg en un mes",
      author: "Grupo Verde UNAM",
      description:
        "Así logramos nuestro objetivo de reciclaje más ambicioso hasta la fecha...",
      likes: 189,
      image:
        "https://images.unsplash.com/photo-1528323273322-d81458248d40?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div className="community-page">

      {/* ══ NAVBAR ══ */}
      <header className="community-navbar">
        <div className="community-logo">
          <div className="logo-icon">🌿</div>
          <h2>ECO CANJE</h2>
        </div>

        <nav className="community-nav-links">
          <a href="#">Inicio</a>
          <a href="#">Donaciones</a>
          <a href="#">Publicar</a>
          <a href="#">Beneficios</a>
          <a href="#" className="active-link">Comunidad</a>
          <a href="#">Blog</a>
          <a href="#">Contacto</a>
        </nav>

        <div className="community-auth-buttons">
          <button className="login-btn">Iniciar sesión</button>
          <button className="register-btn">Registrarse</button>
        </div>
      </header>

      <main className="community-container">

        {/* ══ HERO ══ */}
        <section className="hero-section">
          <h1>Comunidad ECO CANJE</h1>
          <p>Conecta, comparte y aprende con estudiantes comprometidos con el cambio</p>
        </section>

        {/* ══ STATS ══ */}
        <section className="stats-section">
          <div className="stat-card">
            <Users size={30} />
            <h2>1,200+</h2>
            <span>Miembros</span>
          </div>
          <div className="stat-card">
            <MessageSquare size={30} />
            <h2>450+</h2>
            <span>Discusiones</span>
          </div>
          <div className="stat-card">
            <Calendar size={30} />
            <h2>28</h2>
            <span>Eventos</span>
          </div>
          <div className="stat-card">
            <Heart size={30} />
            <h2>5,600+</h2>
            <span>Impactos</span>
          </div>
        </section>

        {/* ══ MAIN GRID ══ */}
        <section className="content-grid">

          {/* LEFT */}
          <div className="left-content">

            {/* FORO */}
            <div className="forum-container">
              <div className="forum-header">
                <h2>
                  <MessageSquare size={18} />
                  Foro de Discusión
                </h2>
                <button className="discussion-btn">Nueva Discusión</button>
              </div>

              <div className="forum-list">
                {forums.map((forum, index) => (
                  <div className="forum-card" key={index}>
                    <h3>{forum.title}</h3>
                    <div className="forum-info">
                      <div className="forum-meta">
                        <span>Por {forum.author}</span>
                        <span>•</span>
                        <span>{forum.time}</span>
                      </div>
                      <div className="forum-actions">
                        <span><MessageSquare size={12} /> {forum.comments}</span>
                        <span><Heart size={12} /> {forum.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HISTORIAS INSPIRADORAS */}
            <div className="stories-container">
              <h2>
                <Star size={18} />
                Historias Inspiradoras
              </h2>

              <div className="stories-grid">
                {stories.map((story, index) => (
                  <div className="story-card" key={index}>
                    <div
                      className="story-image"
                      style={{ backgroundImage: `url(${story.image})` }}
                    >
                      <div className="story-overlay">
                        <h3>{story.title}</h3>
                        <p>Por {story.author}</p>
                      </div>
                    </div>
                    <div className="story-content">
                      <p>{story.description}</p>
                      <div className="story-footer">
                        <span><Heart size={13} /> {story.likes}</span>
                        <button>Leer más <ArrowRight size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="right-sidebar">

            {/* PRÓXIMOS EVENTOS */}
            <div className="events-container">
              <h2><Calendar size={18} /> Próximos Eventos</h2>

              {events.map((event, index) => (
                <div className="event-card" key={index}>
                  <h3>{event.title}</h3>
                  <div className="event-details">
                    <p><Calendar size={12} /> {event.date}</p>
                    <p><Clock size={12} /> {event.hour}</p>
                    <p><MapPin size={12} /> {event.place}</p>
                    <p><UserIcon size={12} /> {event.people}</p>
                  </div>
                  <button>Asistir</button>
                </div>
              ))}
            </div>

            {/* TOP CONTRIBUTORS */}
            <div className="contributors-container">
              <h2><TrendingUp size={18} /> Top Contributors</h2>

              <div className="contributors-list">
                <div className="contributor-card">
                  <div className="contributor-left">
                    <div className="rank">1</div>
                    <div>
                      <h4>Usuario 1</h4>
                      <p>450 puntos</p>
                    </div>
                  </div>
                  <span className="contributor-crown">👑</span>
                </div>

                <div className="contributor-card">
                  <div className="contributor-left">
                    <div className="rank">2</div>
                    <div>
                      <h4>Usuario 2</h4>
                      <p>400 puntos</p>
                    </div>
                  </div>
                  <span>🥈</span>
                </div>

                <div className="contributor-card">
                  <div className="contributor-left">
                    <div className="rank">3</div>
                    <div>
                      <h4>Usuario 3</h4>
                      <p>350 puntos</p>
                    </div>
                  </div>
                  <span>🥉</span>
                </div>
              </div>
            </div>

          </aside>
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="community-footer">
        <div className="footer-grid">

          <div>
            <div className="community-logo footer-logo">
              <div className="logo-icon">🌿</div>
              <h2>ECO CANJE</h2>
            </div>
            <p>
              Red Solidaria Universitaria: Transformando donaciones en impacto
              social y sostenibilidad.
            </p>
            <div className="socials">
              <span>📘</span>
              <span>📷</span>
              <span>🐦</span>
              <span>💼</span>
            </div>
          </div>

          <div>
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li>Donaciones</li>
              <li>Publicar Donación</li>
              <li>Beneficios</li>
              <li>Comunidad</li>
            </ul>
          </div>

          <div>
            <h3>Recursos</h3>
            <ul>
              <li>Blog</li>
              <li>Contacto</li>
              <li>Dashboard</li>
              <li>FAQs</li>
            </ul>
          </div>

          <div>
            <h3>Newsletter</h3>
            <p>Recibe noticias sobre sostenibilidad y donaciones</p>
            <div className="newsletter-box">
              <input type="email" placeholder="tu@email.com" />
              <button><Send size={16} /></button>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2026 ECO CANJE. Todos los derechos reservados.</p>
          <div className="hashtags">
            <span>#Reciclar</span>
            <span>#Donaciones</span>
            <span>#EcoCanje</span>
            <span>#Sostenibilidad</span>
          </div>
        </div>
      </footer>

    </div>
  );
}