"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/db";
import { doc, getDoc } from "firebase/firestore";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;

      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    loadUser();
  }, []);

  if (!userData) return <p>Cargando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚙️ Configuración</h1>

      <div className={styles.card}>
        <h2>Perfil</h2>

        <div className={styles.photoSection}>
          <div className={styles.avatarPreview}>
            {preview ? (
              <img src={preview} alt="Perfil" className={styles.profileImage} />
            ) : (
              "👤"
            )}
          </div>

          <label className={styles.option}>
            📷 Cambiar foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
