"use client";

import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { loginUser } from "../authService";
import { auth } from "../../firebase/auth";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import styles from "../login/login.module.css";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMsg("");
      try {
        const credential = GoogleAuthProvider.credential(
          null,
          tokenResponse.access_token,
        );

        const result = await signInWithCredential(auth, credential);

        const user = result.user;
        console.log("Usuario autenticado en Firebase:", user);
      } catch (error) {
        console.error("Error al autenticar con Firebase:", error);
        setErrorMsg("Hubo un problema al sincronizar tu cuenta con Firebase.");
      }
    },
    onError: () => {
      setErrorMsg("Hubo un problema al autenticar con Google.");
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const user = await loginUser(email, password);
      console.log("Usuario: ", user);
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
        <button
          type="button"
          className={styles.socialBtn}
          onClick={() => loginWithGoogle()}
        >
          <img
            src="/svg/google.svg"
            alt="Google"
            className={styles.socialIcon}
          />
          Continuar con Google
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
            <a href="/forgotPassword" className={styles.forgot}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Iniciar Sesión
          </button>
        </form>

        <p className={styles.registerLine}>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>

      <p className={styles.ssl}>Conexión segura con encriptación SSL</p>
    </main>
  );
}

export default function Login() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return <div>Error de configuración.</div>;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
