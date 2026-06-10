"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { loginUser } from "../authService";
import styles from "./login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("¡Usuario autenticado con éxito en Firebase!", user);
      router.push("/");
    } catch (error) {
      console.error("Error en Google Sign-In con Firebase:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("El proceso de inicio de sesión fue cancelado.");
      } else {
        setErrorMsg("Hubo un error al conectar con Google mediante Firebase.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const user = await loginUser(email, password);
      console.log("Usuario tradicional: ", user);
      router.push("/");
    } catch (error) {
      setErrorMsg("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.headline}>Bienvenido</h1>
      <p className={styles.subline}>
        Ingresa a tu cuenta para continuar donando y acumulando puntos
      </p>

      <div className={styles.card}>
        {/* BOTÓN SIMPLIFICADO QUE LLAMA DIRECTO A FIREBASE */}
        <button
          type="button"
          className={styles.socialBtn}
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <img
            src="/svg/google.svg"
            alt="Google"
            className={styles.socialIcon}
          />
          {isLoading ? "Cargando..." : "Continuar con Google"}
        </button>

        <div className={styles.divider}>
          <span>O con tu email</span>
        </div>

        <form onSubmit={handleLogin}>
          <div className={styles.field}>
            <label htmlFor="email">Correo Electrónico</label>
            <div className={styles.inputWrap}>
              <img src="/svg/email.svg" alt="" className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.inputWrap}>
              <img src="/svg/lock.svg" alt="" className={styles.inputIcon} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: "12px",
                  marginTop: "6px",
                  marginBottom: "0px",
                  textAlign: "left",
                  fontWeight: "500",
                }}
              >
                {errorMsg}
              </p>
            )}
          </div>

          <div className={styles.row}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </label>
            <Link href="/forgotPassword" className={styles.forgot}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Iniciar Sesión
          </button>
        </form>

        <p className={styles.registerLine}>
          ¿No tienes cuenta? <Link href="/register">Regístrate aquí</Link>
        </p>
      </div>

      <p className={styles.ssl}>Conexión segura con encriptación SSL</p>
    </main>
  );
}
