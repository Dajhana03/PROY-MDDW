"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./publish.module.css";
import { db } from "../../firebase/dataDonations.js";
import { collection, addDoc } from "firebase/firestore";

const typeOptions = [
  { label: "Artículos", value: "articulos" },
  { label: "Reciclables", value: "reciclables" },
  { label: "Alimentos", value: "alimentos" },
];

export default function PublishPage() {
  const [type, setType] = useState("articulos");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleFiles = (files) => {
    const images = Array.from(files);

    images.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: e.target.result,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setUploadedFiles((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <main className={styles.mainBg}>
      <div className={styles.pageHeader}>
        <h1>Publicar Donación</h1>
        <p>Comparte lo que ya no usas y ayuda a otros</p>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Tipo de Donación
          </label>

          <div className={styles.donationTypes}>
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`${styles.typeBtn} ${
                  type === option.value ? styles.active : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Título
          </label>

          <input
            type="text"
            placeholder="Ej: Libros de programación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Descripción
          </label>

          <textarea
            placeholder="Describe tu donación..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formTextarea}
          />
        </div>

        <div
          className={styles.uploadZone}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            hidden
            multiple
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <p>Haz clic para subir imágenes</p>

          <div className={styles.previewGrid}>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className={styles.previewImgWrap}
              >
                <img src={file.src} alt="" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(file.id);
                  }}
                  className={styles.previewRemove}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnDraft}
            onClick={() =>
              setToast("✅ Borrador guardado")
            }
          >
            Guardar
          </button>

          <button
            type="button"
            className={styles.btnPublish}
           onClick={async () => {
  try {
    await addDoc(collection(db, "donations"), {
      type,
      title,
      description,
    });
    setToast("🎉 Publicado correctamente");
  } catch (e) {
    console.error(e);
  }
}}
          >
            Publicar
          </button>
        </div>
      </div>

      {toast && (
        <div className={styles.toast}>
          {toast}
        </div>
      )}
    </main>
  );
}