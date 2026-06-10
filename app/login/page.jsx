"use client";

import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { loginUser } from "../authService"; 
import styles from "../login/login.module.css";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Token de Google obtenido con éxito:", tokenResponse);
      
      try {
        alert("¡Inicio de sesión con Google exitoso!");
      } catch (error) {
        alert("Error al iniciar sesion");
      }
    },
    onError: () => {
      alert("Hubo un problema al autenticar con Google.");
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(email, password);
      console.log("Usuario: ", user);
      alert("Succesfull Login");
    } catch (error) {
      alert("Incorrect Credentials");
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

        <button type="button" className={styles.socialBtn}>
          <img
            src="/svg/facebook.svg"
            alt="Facebook"
            className={styles.socialIcon}
          />
          Continuar con Facebook
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
            <a href="#" className={styles.forgot}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className={styles.btnSubmit}>
            Iniciar Sesión
          </button>
        </form>

        <p className={styles.registerLine}>
          ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
        </p>
      </div>

      <p className={styles.ssl}>Conexión segura con encriptación SSL</p>
    </main>
  );
}

export default function Login() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}