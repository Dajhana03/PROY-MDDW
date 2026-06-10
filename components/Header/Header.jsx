"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase/auth"; // 👈 AJUSTA si tu ruta cambia
import styles from "./Header.module.css";
import { useScrollShadow } from "../../hooks/useScrollShadow";
import { db } from "../../firebase/db";
import { doc, getDoc } from "firebase/firestore";

export default function Header() {
  const scrolled = useScrollShadow();
  const pathname = usePathname();
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  // 👤 detectar usuario logueado
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.photoURL) {
            setProfilePhoto(data.photoURL);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadProfilePhoto();
  }, [user]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("USUARIO:", currentUser);
      console.log("DISPLAYNAME:", currentUser?.displayName);

      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setOpen(false);
    router.push("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
      );
    }

    return parts[0].charAt(0).toUpperCase();
  };
  const getShortName = (name) => {
    if (!name) return user?.email?.split("@")[0] || "Usuario";

    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }

    return parts[0];
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.navContainer}`}>
        {/* LOGO */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <img src="/images/logo.webp" alt="EcoCanje Logo" />
          </div>
          <span className={styles.logoName}>ECO CANJE</span>
        </Link>

        {/* NAV */}
        <nav className={styles.navbar}>
          <Link href="/" className={pathname === "/" ? styles.active : ""}>
            Inicio
          </Link>
          <Link
            href="/donations"
            className={pathname === "/donations" ? styles.active : ""}
          >
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
            href="/contact"
            className={pathname === "/contact" ? styles.active : ""}
          >
            Contacto
          </Link>
        </nav>

        {/* 🔥 AUTH SECTION */}
        <div className={styles.navActions}>
          {!user ? (
            <>
              <Link href="/login" className={styles.loginBtn}>
                Iniciar sesión
              </Link>

              <Link href="/register" className={styles.registerBtn}>
                Registrarse
              </Link>
            </>
          ) : (
            <div className={styles.userBox}>
              {/* Avatar + nombre */}
              <div className={styles.userBtn} onClick={() => setOpen(!open)}>
                <div className={styles.avatar}>
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Perfil"
                      className={styles.avatarImage}
                    />
                  ) : (
                    getInitials(user.displayName || user.email)
                  )}
                </div>

                <span className={styles.userName}>
                  Hola, {getShortName(user.displayName)}
                </span>

                <span
                  className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}
                >
                  ▼
                </span>
              </div>

              {/* Dropdown */}
              {open && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.profileBtn}
                    onClick={() => {
                      setOpen(false);
                      router.push("/profile");
                    }}
                  >
                    Perfil
                  </button>

                  <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
