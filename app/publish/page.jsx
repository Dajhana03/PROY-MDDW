"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./publish.module.css";

import { db, storage } from "../../firebase/donations";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
const typeOptions = [
  {
    label: " Artículos",
    value: "articulos",
  },
  {
    label: " Reciclables",
    value: "reciclables",
  },
  {
    label: " Alimentos",
    value: "alimentos",
  },
];

export default function PublishPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
  const [type, setType] = useState("articulos");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [location, setLocation] = useState("");

  const [condition, setCondition] = useState("Nuevo");

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (type === "alimentos") {
      setCondition("Nuevo");
    }
  }, [type]);

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState("");

  const isGuest = !user;

  useEffect(() => {
    const draft = localStorage.getItem("draftDonation");

    if (draft) {
      const parsed = JSON.parse(draft);

      setType(parsed.type || "articulos");
      setTitle(parsed.title || "");
      setDescription(parsed.description || "");
    }
  }, []);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleFiles = (files) => {
    if (isGuest) {
      setToast("🔒 Regístrate para subir imágenes");
      return;
    }
    const images = Array.from(files);

    images.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: e.target.result,
            file,
          },
        ]);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setUploadedFiles((prev) => prev.filter((img) => img.id !== id));
  };

  const handlePublish = async () => {
    if (isGuest) {
      setToast("🔒 Regístrate para poder publicar donaciones");
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      setToast("⚠️ Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const imageUrls = [];

      for (const image of uploadedFiles) {
        if (!image.file) continue;

        const imageRef = ref(
          storage,
          `donations/${Date.now()}-${image.file.name}`,
        );

        await uploadBytes(imageRef, image.file);

        const downloadURL = await getDownloadURL(imageRef);

        imageUrls.push(downloadURL);
      }

      await addDoc(collection(db, "donations"), {
        type,
        title,
        description,
        location,
        condition,
        quantity: Number(quantity),

        images: imageUrls,

        likes: 0,
        comments: [],

        createdAt: serverTimestamp(),
      });

      setToast("🎉 Donación publicada correctamente");

      setTitle("");
      setDescription("");
      setLocation("");
      setCondition("Nuevo");
      setQuantity(1);
      setUploadedFiles([]);
      setType("articulos");

      localStorage.removeItem("draftDonation");
    } catch (error) {
      console.error("ERROR FIREBASE:", error);

      setToast("Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.mainBg}>
      <div className={styles.pageHeader}>
        <h1>Publicar Donación</h1>

        <p>Comparte lo que ya no usas y ayuda a quien lo necesita</p>
        {isGuest && (
          <div className={styles.guestWarning}>
            ✨ Regístrate para publicar y compartir donaciones con la comunidad
          </div>
        )}
      </div>

      <div className={styles.formCard}>
        {/* TIPOS */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tipo de Donación</label>

          <div className={styles.donationTypes}>
            {typeOptions.map((option) => (
              <button
                key={option.value}
                disabled={isGuest}
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

        {/* TITULO */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Título de la Donación</label>

          <input
            type="text"
            disabled={isGuest}
            placeholder="Ej: Libros de programación"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.formInput}
          />
        </div>

        {/* DESCRIPCION */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Descripción</label>

          <textarea
            disabled={isGuest}
            placeholder="Describe el estado, cantidad y cualquier detalle importante..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formTextarea}
          />
        </div>

        {/* IMAGENES */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Imágenes (opcional)</label>

          <div
            className={styles.uploadZone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();

              if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
              }
            }}
          >
            <input
              ref={fileInputRef}
              hidden
              disabled={isGuest}
              multiple
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className={styles.uploadIcon}>↑</div>

            <p>Arrastra imágenes aquí o haz clic para seleccionar</p>

            <span>PNG, JPG hasta 10MB</span>

            <div className={styles.previewGrid}>
              {uploadedFiles.map((file) => (
                <div key={file.id} className={styles.previewImgWrap}>
                  <img src={file.src} alt="" />

                  <button
                    type="button"
                    className={styles.previewRemove}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      removeImage(file.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILAS */}
        <div className={styles.rowGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Cantidad</label>

            <input
              type="number"
              disabled={isGuest}
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Condición</label>

            <select
              disabled={isGuest}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={styles.formInput}
            >
              <option>Nuevo</option>

              {type !== "alimentos" && (
                <>
                  <option>Usado</option>
                  <option>Regular</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* UBICACION */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ubicación de Entrega</label>

          <input
            type="text"
            disabled={isGuest}
            placeholder="Campus, edificio o punto de encuentro"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.formInput}
          />
        </div>

        {/* BOTONES */}
        <div className={styles.formActions}>
          <button
            type="button"
            disabled={isGuest}
            className={styles.btnDraft}
            onClick={() => {
              localStorage.setItem(
                "draftDonation",
                JSON.stringify({
                  type,
                  title,
                  description,
                }),
              );

              setToast("Borrador guardado");
            }}
          >
            {isGuest ? "Registrarse" : "Guardar Borrador"}
          </button>

          <button
            type="button"
            disabled={isGuest}
            className={styles.btnPublish}
            onClick={handlePublish}
          >
            {isGuest ? "Crear Cuenta" : "Publicar Donación"}
          </button>
        </div>

        <div className={styles.bottomText}>
          Al publicar, aceptas que la información sea visible para la comunidad
          universitaria
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}
