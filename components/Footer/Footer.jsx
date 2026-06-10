'use client';

import { useState } from 'react';
import styles from './Footer.module.css';

const SOCIAL_ICONS = ['facebook-f', 'twitter', 'instagram', 'linkedin-in'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 2200);
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>

        {/* Brand */}
        <div className={styles.footerBrand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><i className="fa-solid fa-leaf" /></div>
            <span>ECO CANJE</span>
          </div>
          <p>Red solidaria sostenible para estudiantes y comunidades.</p>
          <div className={styles.socials}>
            {SOCIAL_ICONS.map((icon) => (
              <a key={icon} href="#">
                <i className={`fa-brands fa-${icon}`} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className={styles.footerLinks}>
          <div>
            <h4>Enlaces</h4>
            <a href="/donations">Donaciones</a>
            <a href="/benefits">Beneficios</a>
            <a href="/community">Comunidad</a>
          </div>
          <div>
            <h4>Recursos</h4>
            <a href="/faq">FAQ</a>
            <a href="/terms">Terminos y condiciones</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <h4>Newsletter</h4>
          <p>Recibe noticias sobre sostenibilidad y recompensas.</p>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Tu correo"
              value={email}
              className={error ? styles.inputError : ''}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              className={sent ? styles.sent : ''}
              onClick={handleSubmit}
            >
              {sent
                ? <span>✓</span>
                : <i className="fa-solid fa-paper-plane" />
              }
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
