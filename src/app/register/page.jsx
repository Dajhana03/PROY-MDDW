"use client";

import { useState } from "react";
import { registerUser } from "../authService";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

function RegisterPage() {
  const [step, setStep] = useState(1);

  // Paso 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Paso 2
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [userType, setUserType] = useState("");
  const [ageError, setAgeError] = useState("");  // ← nuevo

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleNext = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      alert("Completa todos los campos antes de continuar");
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!phone || !birthDate || !city || !userType) {
      alert("Completa todos los campos antes de enviar");
      setLoading(false);
      return;
    }

    // Validación de edad
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    const realAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (realAge < 18) {
      setAgeError("Solo mayores de edad pueden registrarse en ECO CANJE.");
      setLoading(false);
      return;
    } else {
      setAgeError("");
    }

    try {
      const result = await registerUser(email, password, firstName, lastName);
      if (result.success) {
        alert("Cuenta creada correctamente");
        router.push("/login");
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

        {/* STEPS */}
        <div className={styles.steps}>
          <div className={step === 1 ? styles["step-active"] : styles["step-done"]}>
            <span>1</span>
            <p>Datos Básicos</p>
          </div>
          <div className={styles.line}></div>
          <div className={step === 2 ? styles["step-active"] : styles.step}>
            <span>2</span>
            <p>Información Adicional</p>
          </div>
        </div>

        <div className={styles["form-container"]}>

          {/* ── PASO 1 ── */}
          {step === 1 && (
            <>
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

              <form onSubmit={handleNext}>
                <div className={styles.row}>
                  <div className={styles["input-group"]}>
                    <label>Nombre</label>
                    <div className={styles["input-wrapper"]}>
                      <img src="/svg/user.svg" alt="" className={styles["input-icon"]} />
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" required placeholder="Juan" />
                    </div>
                  </div>

                  <div className={styles["input-group"]}>
                    <label>Apellido</label>
                    <div className={styles["input-wrapper"]}>
                      <img src="/svg/user.svg" alt="" className={styles["input-icon"]} />
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" required placeholder="Pérez" />
                    </div>
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label>Correo Electrónico</label>
                  <div className={styles["input-wrapper"]}>
                    <img src="/svg/email.svg" alt="" className={styles["input-icon"]} />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="tu@email.com" />
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label>Contraseña</label>
                  <div className={styles["input-wrapper"]}>
                    <img src="/svg/lock.svg" alt="" className={styles["input-icon"]} />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" />
                  </div>
                  <p className={styles["password-info"]}>Mínimo 8 caracteres</p>
                </div>

                <button type="submit" className={styles["register-button"]}>
                  Continuar →
                </button>
              </form>

              <div className={styles["login-text"]}>
                ¿Ya tienes cuenta?{" "}
                <span onClick={() => router.push("/login")}>Inicia sesión</span>
              </div>
            </>
          )}

          {/* ── PASO 2 ── */}
          {step === 2 && (
            <form onSubmit={handleRegister}>
              <div className={styles.row}>
                <div className={styles["input-group"]}>
                  <label>Teléfono</label>
                  <div className={styles["input-wrapper"]}>
                    <img src="/svg/phone.svg" alt="" className={styles["input-icon"]} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required placeholder="+51 999 000 000" />
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label>Fecha de nacimiento</label>
                  <div className={styles["input-wrapper"]}>
                    <img src="/svg/date.svg" alt="" className={styles["input-icon"]} />
                    <input
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        setAgeError(""); // limpiar error al cambiar fecha
                      }}
                      type="date"
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                        .toISOString().split("T")[0]}
                    />
                  </div>
                  {/* ← mensaje de error de edad */}
                  {ageError && <p className={styles["age-error"]}>{ageError}</p>}
                </div>
              </div>

              <div className={styles["input-group"]}>
                <label>Ciudad</label>
                <div className={styles["input-wrapper"]}>
                  <img src="/svg/place.svg" alt="" className={styles["input-icon"]} />
                  <input value={city} onChange={(e) => setCity(e.target.value)} type="text" required placeholder="Lima" />
                </div>
              </div>

              <div className={styles["input-group"]}>
                <label>Tipo de usuario</label>
                <div className={styles["input-wrapper"]}>
                  <img src="/svg/user.svg" alt="" className={styles["input-icon"]} />
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    required
                    className={styles["input-select"]}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="donante">Donante</option>
                    <option value="receptor">Receptor</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
              </div>

              <div className={styles["btn-group"]}>
                <button type="button" onClick={() => setStep(1)} className={styles["back-button"]}>
                  ← Volver
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles["register-button"]}${loading ? ` ${styles.loading}` : ""}`}
                >
                  {loading ? <div className={styles.spinner} /> : <span>Crear cuenta</span>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}

export default RegisterPage;