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
  { label: " Artículos", value: "articulos" },
  { label: " Reciclables", value: "reciclables" },
  { label: " Alimentos", value: "alimentos" },
];

export default function PublishPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const defaultCenter = { lat: -12.046374, lng: -77.042793 };

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

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError(true);

    document.head.appendChild(script);
  }, []);

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
  const [coordinates, setCoordinates] = useState(defaultCenter);

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

      marker.addListener("dragend", async () => {
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
    }
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

  const handleGetLocation = () => {
    if (isGuest) return;

    if (!navigator.geolocation) {
      setToast("Tu navegador no soporta geolocalización");
      return;
    }

    setToast("Solicitando permisos de ubicación...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };

        setCoordinates(newCoords);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setCenter(newCoords);
          mapInstanceRef.current.setZoom(17); // Hacemos un acercamiento más preciso
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
        coordinates,
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
      setCoordinates(defaultCenter);
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
        s<h1>Publicar Donación</h1>       
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
           
          {loadError && (
            <p className={styles.mapError}>
              Error al cargar el mapa interactivo            
            </p>
          )}
               
          {!isLoaded ? (
            <div className={styles.mapLoading}>
              Cargando mapa interactivo...            
            </div>
          ) : (
            <div ref={mapContainerRef} className={styles.mapInstance} />
          )}
                 
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
                JSON.stringify({ type, title, description }),
              );
              setToast("Borrador guardado");
            }}
          >
            {isGuest ? "Registrarse" : "Guardar Borrador"}         
          </button>
          <button
            type="button"
            disabled={isGuest || loading}
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
      {toast && <div className={styles.toast}>{toast}</div>}   
    </main>
  );
}
