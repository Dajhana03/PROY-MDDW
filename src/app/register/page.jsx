"use client";

import { useState } from "react";
import { registerUser } from "../authService";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!firstName || !lastName || !email || !password) {
      alert("Completar el formulario antes de enviar");
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(email, password, firstName, lastName);
      if (result.success) {
        alert("Cuenta creada correctamente");
        router.push("");
      } else {
        if (result.error.code === "auth/email-already-in-use") {
          alert("El correo ya está registrado");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["register-container"]}>
      <div className={styles["register-card"]}>
        <div className={styles["title-register"]}>Únete a ECO CANJE</div>

        <div className={styles["subtitle-register"]}>
          Crea tu cuenta en 2 simples pasos
        </div>

        <div className={styles.steps}>
          <div className={styles["step-active"]}>
            <span>1</span>
            <p>Datos Básicos</p>
          </div>
          <div className={styles.line}></div>
          <div className={styles.step}>
            <span>2</span>
            <p>Información Adicional</p>
          </div>
        </div>

        <div className={styles["form-container"]}>
          <button className={styles["social-btn"]} type="button">
            <img src="/svg/google.svg" alt="Google" className={styles["social-icon"]} />
            Registrarse con Google
          </button>

          <button className={styles["social-btn"]} type="button">
            <img src="/svg/facebook.svg" alt="Facebook" className={styles["social-icon"]} />
            Registrarse con Facebook
          </button>

          <div className={styles.divider}>
            <span>O con tu email</span>
          </div>

          <form onSubmit={handleRegister}>
            <div className={styles.row}>
              <div className={styles["input-group"]}>
                <label>Nombre</label>
                <div className={styles["input-wrapper"]}>
                  <img src="/svg/user.svg" alt="Usuario" className={styles["input-icon"]} />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    required
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div className={styles["input-group"]}>
                <label>Apellido</label>
                <div className={styles["input-wrapper"]}>
                  <img src="/svg/user.svg" alt="Usuario" className={styles["input-icon"]} />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    required
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label>Correo Electrónico</label>
              <div className={styles["input-wrapper"]}>
                <img src="/svg/email.svg" alt="Email" className={styles["input-icon"]} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className={styles["input-group"]}>
              <label>Contraseña</label>
              <div className={styles["input-wrapper"]}>
                <img src="/svg/lock.svg" alt="Contraseña" className={styles["input-icon"]} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
              <p className={styles["password-info"]}>Mínimo 8 caracteres</p>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`${styles["register-button"]}${loading ? ` ${styles.loading}` : ""}`}
            >
              {loading ? <div className={styles.spinner} /> : <span>Continuar →</span>}
            </button>
          </form>

          <div className={styles["login-text"]}>
            ¿Ya tienes cuenta?{" "}
            <span onClick={() => router.push("/login")}>Inicia sesión</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;