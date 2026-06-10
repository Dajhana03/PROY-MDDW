"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./forgotPassword.module.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Paso 2: Estados del OTP
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(120); 
  const inputRefs = useRef([]);

  // Paso 3: Estados de Nueva Contraseña
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (step !== 2 || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (index < 5 && element.value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    setErrorMsg("");
    setStep(2);
    setTimer(120);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code === "123456") { 
      setErrorMsg("");
      setStep(3);
    } else {
      setErrorMsg("Código OTP incorrecto. Usa el código demo 123456.");
    }
  };

  const handleStep3Submit = (e) => {
    e.preventDefault();
    if (!Object.values(validations).every(Boolean)) {
      setErrorMsg("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    setErrorMsg("");
    setStep(4);
  };

  const handleResendOtp = () => {
    setOtp(new Array(6).fill(""));
    setTimer(120);
    setErrorMsg("");
    inputRefs.current[0]?.focus();
  };

  return (
    <section className={styles.pageContainer}>
      
      {/* Indicador de progreso (Pasos 1, 2 y 3) */}
      {step <= 3 && (
        <div className={styles.progressContainer}>
          <div className={`${styles.stepCircle} ${step >= 1 ? styles.activeStep : ""}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <div className={`${styles.progressLine} ${step >= 2 ? styles.lineActive : ""}`}></div>
          <div className={`${styles.stepCircle} ${step >= 2 ? styles.activeStep : ""}`}>
            {step > 2 ? "✓" : "2"}
          </div>
          <div className={`${styles.progressLine} ${step >= 3 ? styles.lineActive : ""}`}></div>
          <div className={`${styles.stepCircle} ${step === 3 ? styles.activeStep : ""}`}>3</div>
        </div>
      )}

      {/* Icono superior dinámico */}
      <div className={styles.centerIconArea}>
        {step === 1 && (
          <div className={styles.iconCircle}>
            <img src="/svg/email.svg" alt="svg email" className={styles.topIconImg} />
          </div>
        )}
        {step === 2 && (
          <div className={`${styles.iconCircle} ${styles.iconCircleGreen}`}>
            <img src="/svg/security.svg" alt="svg security" className={styles.topIconImg} />
          </div>
        )}
        {step === 3 && (
          <div className={`${styles.iconCircle} ${styles.iconCircleGreen}`}>
            <img src="/svg/lock.svg" alt="" className={styles.topIconImg} />
          </div>
        )}
        {step === 4 && (
          <div className={`${styles.iconCircle} ${styles.iconCircleSuccess}`}>
            <img src="/svg/checkCircle.svg" alt="svg circle" className={styles.topIconImg} />
          </div>
        )}
      </div>

      {/* Textos de la cabecera */}
      <h1 className={styles.mainTitle}>
        {step === 1 && "Recuperar contraseña"}
        {step === 2 && "Ingresa tu código"}
        {step === 3 && "Nueva contraseña"}
        {step === 4 && "¡Contraseña actualizada!"}
      </h1>
      <p className={styles.mainSubtitle}>
        {step === 1 && "Ingresa tu correo y te enviaremos un código de verificación"}
        {step === 2 && <>Enviamos un código de 6 dígitos a <strong className={styles.emailHighlighted}>{email || "tu@correo.com"}</strong></>}
        {step === 3 && "Elige una contraseña segura para tu cuenta"}
        {step === 4 && "Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."}
      </p>

      {/* Tarjeta de Formulario */}
      <div className={styles.card}>
        {errorMsg && <p className={styles.generalError}>{errorMsg}</p>}

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
                />
              </div>
            </div>
            <button type="submit" className={styles.btnSubmit}>
              Enviar código OTP
            </button>
            <Link href="/login" className={styles.backLink}>
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}

        {/* PASO 2: Entrada del código de 6 dígitos */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <div className={styles.otpRow} onPaste={handleOtpPaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className={styles.otpInput}
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                />
              ))}
            </div>

            <p className={styles.timerText}>
              El código expira en <span className={styles.timeCount}>{formatTime(timer)}</span>
            </p>

            <button type="submit" className={styles.btnSubmit}>
              Verificar código
            </button>

            <div className={styles.resendArea}>
              <p>¿No recibiste el código?</p>
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={timer > 0}
                className={styles.btnResend}
              >
                🔄 Reenviar código
              </button>
            </div>

            <div className={styles.demoBox}>
              Demo: usa el código <strong className={styles.demoCode}>123456</strong> para avanzar
            </div>

            <button type="button" onClick={() => setStep(1)} className={styles.backLink}>
              ← Cambiar correo
            </button>
          </form>
        )}

        {/* PASO 3: Nueva Contraseña */}
        {step === 3 && (
          <form onSubmit={handleStep3Submit}>
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
                />
                <button
                  type="button"
                  className={styles.toggleEye}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
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
                />
                <button
                  type="button"
                  className={styles.toggleEye}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
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

            <button type="submit" className={styles.btnSubmit}>
              Guardar nueva contraseña
            </button>
          </form>
        )}

        {/* PASO 4: Éxito Final */}
        {step === 4 && (
          <div className={styles.successWrapper}>
            <div className={styles.dashedDivider}></div>
            <p className={styles.securityNotice}>
              Por seguridad, tu sesión anterior ha sido cerrada en todos los dispositivos.
            </p>
            <Link href="/login" className={styles.btnSubmit} style={{ display: "block", textDecoration: "none", lineHeight: "24px" }}>
              Ir a iniciar sesión
            </Link>
          </div>
        )}
      </div>

      <p className={styles.ssl}>Conexión segura con encriptación SSL</p>
    </section>
  );
}