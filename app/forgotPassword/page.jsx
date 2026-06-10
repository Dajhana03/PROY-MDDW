"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase/auth";
import { sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import styles from "./forgotPassword.module.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Estados de errores y éxitos locales debajo de los controles
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // 🟢 NUEVO: Estado para el mensaje verde de éxito
  const [successMsg, setSuccessMsg] = useState("");
  // 🟢 NUEVO: Estado para alternar el texto del botón de reenvío
  const [isResent, setIsResent] = useState(false);

  // Estados de Nueva Contraseña
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oobCode, setOobCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("oobCode"); 
      if (code) {
        setOobCode(code);
        setStep(3); 
      }
    }
  }, []);

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setSuccessMsg("");
    setIsLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/login`, 
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setStep(2); 
    } catch (error) {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        setEmailError("El correo electrónico no se encuentra registrado.");
      } else {
        setEmailError("Hubo un problema al enviar el enlace. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    if (!Object.values(validations).every(Boolean)) {
      setPasswordError("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);

    try {
      if (!oobCode) {
        setPasswordError("El enlace no es válido o ha expirado.");
        return;
      }
      
      await confirmPasswordReset(auth, oobCode, password);
      router.push("/login");

    } catch (error) {
      if (error.code === "auth/expired-action-code") {
        setPasswordError("El enlace ha expirado. Solicita uno nuevo.");
      } else {
        setPasswordError("No se pudo actualizar la contraseña. Inténtalo más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 FUNCIÓN DE REENVÍO CORREGIDA (SIN ALERT)
  const handleResendEmail = async () => {
    setEmailError("");
    setSuccessMsg("");
    setIsLoading(true);
    setIsResent(false);
    
    const actionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      // Cambiamos el estado a true si la promesa de Firebase se cumple
      setIsResent(true);
      setSuccessMsg("Enlace reenviado con éxito.");
    } catch (error) {
      setEmailError("No se pudo reenviar el correo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.pageContainer}>
      
      {/* Indicador de progreso */}
      {step <= 2 && (
        <div className={styles.progressContainer}>
          <div className={`${styles.stepCircle} ${step >= 1 ? styles.activeStep : ""}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <div className={`${styles.progressLine} ${step >= 2 ? styles.lineActive : ""}`}></div>
          <div className={`${styles.stepCircle} ${step === 2 ? styles.activeStep : ""}`}>2</div>
        </div>
      )}

      {/* Icono superior dinámico */}
      <div className={styles.centerIconArea}>
        {step === 1 && (
          <div className={styles.iconCircle}>
            <img src="/svg/email.svg" alt="Email" className={styles.topIconImg} />
          </div>
        )}
        {step === 2 && (
          <div className={`${styles.iconCircle} ${styles.iconCircleGreen}`}>
            <img src="/svg/security.svg" alt="Verificación" className={styles.topIconImg} />
          </div>
        )}
        {step === 3 && (
          <div className={`${styles.iconCircle} ${styles.iconCircleGreen}`}>
            <img src="/svg/lock.svg" alt="Candado" className={styles.topIconImg} />
          </div>
        )}
      </div>

      {/* Textos de la cabecera */}
      <h1 className={styles.mainTitle}>
        {step === 1 && "Recuperar contraseña"}
        {step === 2 && "Verifica tu correo"}
        {step === 3 && "Restablecer contraseña"}
      </h1>
      <p className={styles.mainSubtitle}>
        {step === 1 && "Ingresa tu correo y te enviaremos un enlace oficial de recuperación."}
        {step === 2 && <>Hemos enviado un enlace de acceso a <strong className={styles.emailHighlighted}>{email || "tu@correo.com"}</strong>.</>}
        {step === 3 && "Elige una nueva contraseña segura para tu cuenta de EcoCanje."}
      </p>

      {/* Tarjeta de Formulario */}
      <div className={styles.card}>

        {/* PASO 1: Captura de Email */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className={styles.field}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrap}>
                <img src="/svg/email.svg" alt="" className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {emailError && <p className={styles.errorMessage}>{emailError}</p>}
            </div>
            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
            <Link href="/login" className={styles.backLink}>
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}

        {/* PASO 2: Espera del correo */}
        {step === 2 && (
          <div className={styles.successWrapper}>
            <p className={styles.securityNotice} style={{ textAlign: "center", marginBottom: "20px" }}>
              Por favor, revisa tu bandeja de entrada y la carpeta de spam. Sigue el enlace recibido para cambiar tu contraseña.
            </p>

            {/* 🟢 EL BOTÓN MANEJA SU TEXTO DINÁMICAMENTE SEGÚN LOS ESTADOS */}
            <button 
              type="button" 
              onClick={handleResendEmail} 
              disabled={isLoading}
              className={styles.btnSubmit}
              style={{ marginBottom: "8px" }}
            >
              {isLoading ? "Reenviando..." : isResent ? "¡Reenviado con éxito! ✓" : "🔄 Reenviar enlace por correo"}
            </button>

            {/* 🟢 MENSAJES DE ERROR O ÉXITO UBICADOS DEBAJO DEL BOTÓN */}
            {emailError && <p className={styles.errorMessage} style={{ marginBottom: "15px", textAlign: "center" }}>{emailError}</p>}
            {successMsg && <p className={styles.successMessage}>{successMsg}</p>}

            <button type="button" onClick={() => { setStep(1); setIsResent(false); setSuccessMsg(""); }} className={styles.backLink} style={{ marginTop: "12px" }}>
              ← Cambiar correo
            </button>
          </div>
        )}

        {/* PASO 3 INTERNO: Nueva Contraseña */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.field}>
              <label htmlFor="password">Nueva contraseña</label>
              <div className={styles.inputWrap}>
                <img src="/svg/lock.svg" alt="" className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.toggleEye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className={styles.inputWrap}>
                <img src="/svg/lock.svg" alt="" className={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.toggleEye}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {confirmPasswordError && <p className={styles.errorMessage}>{confirmPasswordError}</p>}
            </div>

            <ul className={styles.validationList}>
              <li className={validations.length ? styles.valid : styles.invalid}>
                {validations.length ? "✓" : "○"} Al menos 8 caracteres
              </li>
              <li className={validations.uppercase ? styles.valid : styles.invalid}>
                {validations.uppercase ? "✓" : "○"} Una letra mayúscula
              </li>
              <li className={validations.number ? styles.valid : styles.invalid}>
                {validations.number ? "✓" : "○"} Un número
              </li>
              <li className={validations.special ? styles.valid : styles.invalid}>
                {validations.special ? "✓" : "○"} Un carácter especial
              </li>
            </ul>

            <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </div>

      <p className={styles.ssl}>Conexión segura con encriptación SSL</p>
    </section>
  );
}