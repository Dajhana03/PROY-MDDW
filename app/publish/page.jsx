"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./publish.module.css";

// FIX: db y storage vienen de archivos separados según tu estructura de /firebase
import { db } from "../../firebase/db";
import { storage } from "../../firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const typeOptions = [
  { label: " Artículos", value: "articulos" },
  { label: " Reciclables", value: "reciclables" },
  { label: " Alimentos", value: "alimentos" },
];

const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGES = 6;
const MAPS_SCRIPT_ID = "google-maps-script";

export default function PublishPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const defaultCenter = { lat: -12.046374, lng: -77.042793 };

  // Carga del script de Google Maps (con guardia para no duplicarlo)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError(true);
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById(MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsLoaded(true));
      existingScript.addEventListener("error", () => setLoadError(true));
      return;
    }

    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError(true);

    document.head.appendChild(script);
  }, []);

  // Auth: ya NO redirige automáticamente. El invitado puede ver el formulario
  // (en modo lectura) y decide si quiere registrarse.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const [type, setType] = useState("articulos");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("Nuevo");
  const [quantity, setQuantity] = useState(1);
  const [coordinates, setCoordinates] = useState(defaultCenter);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !window.google) return;

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: coordinates,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });

      const marker = new window.google.maps.Marker({
        position: coordinates,
        map: map,
        draggable: true,
      });

      marker.addListener("dragend", () => {
        const newPos = marker.getPosition();
        const lat = newPos.lat();
        const lng = newPos.lng();

        setCoordinates({ lat, lng });
        updateAddressWithGeocoding(lat, lng);
      });

      map.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        marker.setPosition(e.latLng);
        setCoordinates({ lat, lng });
        updateAddressWithGeocoding(lat, lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      updateAddressWithGeocoding(coordinates.lat, coordinates.lng);
    } catch (err) {
      console.error("Error al inicializar el mapa:", err);
      setLoadError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const updateAddressWithGeocoding = async (lat, lng) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setLocation(data.results[0].formatted_address);
      } else {
        setLocation(`${lat}, ${lng}`);
      }
    } catch (error) {
      setLocation(`${lat}, ${lng}`);
    }
  };

  useEffect(() => {
    if (type === "alimentos") {
      setCondition("Nuevo");
    }
  }, [type]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const isGuest = authChecked && !user;

  useEffect(() => {
    try {
      const draft = localStorage.getItem("draftDonation");
      if (draft) {
        const parsed = JSON.parse(draft);
        setType(parsed.type || "articulos");
        setTitle(parsed.title || "");
        setDescription(parsed.description || "");
      }
    } catch (err) {
      console.error("No se pudo cargar el borrador:", err);
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

  const handleGetLocation = () => {
    if (isGuest) return;

    if (!navigator.geolocation) {
      setToast("Tu navegador no soporta geolocalización");
      return;
    }

    setToast("Solicitando permisos de ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };

        setCoordinates(newCoords);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setCenter(newCoords);
          mapInstanceRef.current.setZoom(17);
          markerInstanceRef.current.setPosition(newCoords);
        }

        updateAddressWithGeocoding(latitude, longitude);
        setToast("Ubicación detectada y mapa actualizado");
      },
      (error) => {
        console.error(error);
        setToast("Permiso denegado o error al obtener ubicación");
      },
    );
  };

  const handleFiles = (files) => {
    if (isGuest) {
      setToast("🔒 Regístrate para subir imágenes");
      return;
    }

    const incoming = Array.from(files);

    if (uploadedFiles.length + incoming.length > MAX_IMAGES) {
      setToast(`⚠️ Máximo ${MAX_IMAGES} imágenes por publicación`);
      return;
    }

    const validFiles = incoming.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setToast("⚠️ Solo se permiten archivos de imagen");
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setToast(`⚠️ "${file.name}" supera los ${MAX_FILE_SIZE_MB}MB`);
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
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

  const validateForm = () => {
    const nextErrors = {};

    if (!title.trim()) nextErrors.title = "El título es obligatorio";
    if (!description.trim())
      nextErrors.description = "La descripción es obligatoria";
    if (!location.trim())
      nextErrors.location = "Selecciona una ubicación en el mapa";

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      nextErrors.quantity = "La cantidad debe ser un número entero mayor a 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePublish = async () => {
    if (isGuest) {
      router.push("/register");
      return;
    }

    if (!validateForm()) {
      setToast("⚠️ Revisa los campos marcados");
      return;
    }

    try {
      setLoading(true);
      const imageUrls = [];

      for (const image of uploadedFiles) {
        if (!image.file) continue;
        const imageRef = ref(
          storage,
          `donations/${user.uid}/${Date.now()}-${image.file.name}`,
        );
        await uploadBytes(imageRef, image.file);
        const downloadURL = await getDownloadURL(imageRef);
        imageUrls.push(downloadURL);
      }

      await addDoc(collection(db, "donations"), {
        type,
        title: title.trim(),
        description: description.trim(),
        location,
        coordinates,
        condition,
        quantity: Number(quantity),
        images: imageUrls,
        likes: 0,
        comments: [],
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      setToast("🎉 Donación publicada correctamente");
      setTitle("");
      setDescription("");
      setLocation("");
      setCoordinates(defaultCenter);
      setCondition("Nuevo");
      setQuantity(1);
      setUploadedFiles([]);
      setType("articulos");
      setErrors({});
      localStorage.removeItem("draftDonation");
    } catch (error) {
      console.error("ERROR FIREBASE:", error);
      setToast("Error al publicar. Intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    if (isGuest) {
      router.push("/register");
      return;
    }

    localStorage.setItem(
      "draftDonation",
      JSON.stringify({ type, title, description }),
    );
    setToast("Borrador guardado");
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
                className={`${styles.typeBtn} ${type === option.value ? styles.active : ""}`}
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
            maxLength={80}
          />
          {errors.title && (
            <p className={styles.fieldError}>{errors.title}</p>
          )}
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
            maxLength={500}
          />
          {errors.description && (
            <p className={styles.fieldError}>{errors.description}</p>
          )}
        </div>

        {/* IMAGENES */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Imágenes (opcional)</label>
          <div
            className={styles.uploadZone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              ref={fileInputRef}
              hidden
              disabled={isGuest}
              multiple
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className={styles.uploadIcon}>↑</div>
            <p>Arrastra imágenes aquí o haz clic para seleccionar</p>
            <span>
              PNG, JPG hasta {MAX_FILE_SIZE_MB}MB · máx. {MAX_IMAGES} imágenes
            </span>
            <div className={styles.previewGrid}>
              {uploadedFiles.map((file) => (
                <div key={file.id} className={styles.previewImgWrap}>
                  <img src={file.src} alt="" />
                  <button
                    type="button"
                    className={styles.previewRemove}
                    onMouseDown={(e) => e.stopPropagation()}
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
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => {
                const qty = Math.max(1, Math.round(Number(quantity) || 1));
                setQuantity(qty);
              }}
              className={styles.formInput}
            />
            {errors.quantity && (
              <p className={styles.fieldError}>{errors.quantity}</p>
            )}
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
          <div className={styles.mapHeader}>
            <label className={styles.formLabel}>Ubicación de Entrega</label>
            <button
              type="button"
              disabled={isGuest || !isLoaded}
              onClick={handleGetLocation}
              className={styles.btnLocation}
            >
              Usar mi ubicación actual
            </button>
          </div>
          {location && (
            <p className={styles.locationText}>Seleccionado: {location}</p>
          )}
          {errors.location && (
            <p className={styles.fieldError}>{errors.location}</p>
          )}
          {loadError && (
            <p className={styles.mapError}>
              Error al cargar el mapa interactivo. Revisa tu conexión o
              inténtalo más tarde.
            </p>
          )}
          {!isLoaded && !loadError ? (
            <div className={styles.mapLoading}>
              Cargando mapa interactivo...
            </div>
          ) : (
            !loadError && (
              <div ref={mapContainerRef} className={styles.mapInstance} />
            )
          )}
        </div>

        {/* BOTONES */}
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnDraft}
            onClick={handleSaveDraft}
          >
            {isGuest ? "Registrarse" : "Guardar Borrador"}
          </button>

          <button
            type="button"
            disabled={!isGuest && loading}
            className={styles.btnPublish}
            onClick={handlePublish}
          >
            {loading
              ? "Publicando..."
              : isGuest
                ? "Crear Cuenta"
                : "Publicar Donación"}
          </button>
        </div>

        <div className={styles.bottomText}>
          Al publicar, aceptas que la información sea visible para la comunidad
          universitaria
        </div>
      </div>
      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </main>
  );
}