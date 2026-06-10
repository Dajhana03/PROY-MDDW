"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/db";
import { doc, getDoc } from "firebase/firestore";
import styles from "./profile.module.css";
import { updateDoc } from "firebase/firestore";
export default function ProfilePage() {
  const [showModal, setShowModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Usuario Firebase:", user);

      if (!user) {
        console.log("No hay usuario logueado");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);

        const docSnap = await getDoc(docRef);

        console.log("Documento:", docSnap.exists());

        if (docSnap.exists()) {
          const data = docSnap.data();

          setUserData(data);

          if (data.photoURL) {
            setPreview(data.photoURL);
          }

          if (data.zoom) {
            setZoom(data.zoom);
          }
        } else {
          console.log("No existe documento users/" + user.uid);
        }
      } catch (error) {
        console.error("ERROR COMPLETO:", error);
        alert(error.message);
      }
    });

    return () => unsubscribe();
  }, []);
  const saveProfilePhoto = async () => {
    try {
      const user = auth.currentUser;

      if (!user || !selectedFile) return;

      const reader = new FileReader();

      reader.onloadend = async () => {
        const photoURL = reader.result;

        await updateDoc(doc(db, "users", user.uid), {
          photoURL,
          zoom,
        });

        setUserData({
          ...userData,
          photoURL,
        });

        setPreview(photoURL);

        setShowEditorModal(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error(error);
    }
  };
  if (!userData)
    return (
      <div className={styles.container}>
        <p>Cargando perfil...</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15.5A3.5 3.5 0 1012 8.5a3.5 3.5 0 000 7z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.04-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.55-1.04H3a2 2 0 110-4h.09A1.7 1.7 0 004.64 8.9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001.04-1.55V3a2 2 0 114 0v.09a1.7 1.7 0 001.04 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 8.9V9a1.7 1.7 0 001.55 1.04H21a2 2 0 110 4h-.09A1.7 1.7 0 0019.4 15z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        Configuración
      </h1>

      <div className={styles.card}>
        <h2>Perfil</h2>

        <div className={styles.photoSection}>
          <div className={styles.avatarPreview}>
            {preview || userData.photoURL ? (
              <img
                src={preview || userData.photoURL}
                alt="Preview"
                className={styles.profileImage}
                style={{
                  transform: `scale(${zoom})`,
                  transition: "0.2s",
                }}
              />
            ) : (
              <>
                {userData.first_name?.charAt(0).toUpperCase()}
                {userData.last_name?.charAt(0).toUpperCase()}
              </>
            )}
          </div>

          <button
            className={styles.changePhotoBtn}
            onClick={() => setShowModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h4l2-2h4l2 2h4v12H4V7z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="13"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Cambiar foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setSelectedFile(file);
                  setPreview(URL.createObjectURL(file));
                  setShowModal(false);
                  setShowEditorModal(true);
                }
              }}
            />
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <span>Nombre</span>
            <p>
              {userData.first_name} {userData.last_name}
            </p>
          </div>

          <div className={styles.infoItem}>
            <span>Correo</span>
            <p>{userData.email}</p>
          </div>

          <div className={styles.infoItem}>
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M4 20a8 8 0 0116 0"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Rol
            </span>
            <p>
              {userData.user_type === "donante"
                ? "♻️ Donador"
                : userData.user_type === "receptor"
                  ? "🎁 Receptor"
                  : userData.user_type === "ambos"
                    ? "🤝 Donador y Receptor"
                    : "Usuario"}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20h4l10-10-4-4L4 16v4z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Editar perfil
          </button>

          <button className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="11"
                width="14"
                height="9"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 11V8a4 4 0 118 0v3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Cambiar contraseña
          </button>

          <button className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0012 22z"
                fill="currentColor"
              />
              <path
                d="M18 16V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Notificaciones
          </button>

          <button className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Privacidad
          </button>
        </div>
        {showModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Selecciona una imagen</h3>

                <button
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setSelectedFile(file);
                        setPreview(URL.createObjectURL(file));
                        setShowModal(false);
                        setShowEditorModal(true);
                      }
                    }}
                  />

                  <div className={styles.uploadContent}>
                    <div className={styles.uploadContent}>
                      <div className={styles.uploadCircle}>+</div>

                      <h4>Subir imagen</h4>

                      <span>PNG, JPG o JPEG</span>
                    </div>
                  </div>
                </label>

                <div className={styles.gifGrid}>
                  <img
                    src="https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif"
                    alt=""
                    onClick={() => {
                      setPreview(
                        "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
                      );
                      setShowModal(false);
                    }}
                  />
                  <img
                    src="https://media.giphy.com/media/l3vRlT2k2L35Cnn5C/giphy.gif"
                    alt=""
                  />
                  <img
                    src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"
                    alt=""
                  />
                  <img
                    src="https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showEditorModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowEditorModal(false)}
        >
          <div
            className={styles.editorModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Editar foto</h2>

            <div className={styles.editorPreview}>
              <img
                src={preview || userData.photoURL}
                alt="Preview"
                className={styles.profileImage}
                style={{
                  transform: `scale(${zoom})`,
                  transition: "0.2s",
                }}
              />
            </div>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />

            <div className={styles.modalActions}>
              <button className={styles.resetBtn} onClick={() => setZoom(1)}>
                Restablecer zoom
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setShowEditorModal(false)}
              >
                Cancelar
              </button>

              <button className={styles.applyBtn} onClick={saveProfilePhoto}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
