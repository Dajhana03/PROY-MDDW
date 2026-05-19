"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { useScrollShadow } from "../../hooks/useScrollShadow";

export default function Header() {
  const scrolled = useScrollShadow();
  const pathname = usePathname();

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/images/logo.webp" alt="EcoCanje Logo" />
          </div>

          <span className={styles.logoName}>ECO CANJE</span>
        </Link>

        <nav className={styles.navbar}>
          <Link href="/" className={pathname === "/" ? styles.active : ""}>
            Inicio
          </Link>

          <Link href="/donations" className={pathname === "/donations" ? styles.active : ""}>
            Donaciones
          </Link>

          <Link
            href="/publish"
            className={pathname === "/publish" ? styles.active : ""}
          >
            Publicar
          </Link>

          <Link
            href="/benefits"
            className={pathname === "/benefits" ? styles.active : ""}
          >
            Beneficios
          </Link>

          <Link
            href="/community"
            className={pathname === "/community" ? styles.active : ""}
          >
            Comunidad
          </Link>

          <Link
            href="/blog"
            className={pathname === "/blog" ? styles.active : ""}
          >
            Blog
          </Link>

          <Link
            href="/contact"
            className={pathname === "/contact" ? styles.active : ""}
          >
            Contacto
          </Link>
        </nav>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginBtn}>
            Iniciar sesión
          </Link>

          <Link href="/register" className={styles.registerBtn}>
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
