'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { useScrollShadow } from '../../hooks/useScrollShadow';

const NAV_LINKS = [
  { label: 'Inicio',     href: null },
  { label: 'Donaciones', href: '/' },
  { label: 'Publicar',   href: '/publish' },
  { label: 'Beneficios', href: null },
  { label: 'Comunidad',  href: null },
  { label: 'Blog',       href: null },
  { label: 'Contacto',   href: null },
];

export default function Navbar() {
  const scrolled  = useScrollShadow();
  const pathname  = usePathname();

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <i className="fa-solid fa-leaf" />
          </div>
          <span>ECO CANJE</span>
        </Link>

        {/* Nav links */}
        <nav className={styles.navbar}>
          {NAV_LINKS.map(({ label, href }) =>
            href ? (
              <Link
                key={label}
                href={href}
                className={pathname === href ? styles.active : ''}
              >
                {label}
              </Link>
            ) : (
              <a key={label} href="#">{label}</a>
            )
          )}
        </nav>

        {/* Actions */}
        <div className={styles.navActions}>
          <a href="#" className={styles.loginBtn}>Iniciar sesión</a>
          <a href="#" className={styles.registerBtn}>Registrarse</a>
        </div>

      </div>
    </header>
  );
}
