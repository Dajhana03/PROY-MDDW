"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db } from "../../firebase/db";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import styles from "./profile.module.css";

const TABS = ["Perfil", "Editar", "Seguridad", "Actividad", "Soporte"];

const ROLE_MAP = {
  donante: { label: "Donante", color: "#16a34a" },
  receptor: { label: "Receptor", color: "#2563eb" },
  admin: { label: "Administrador", color: "#ea580c" },
  ambos: { label: "Donante y Receptor", color: "#7c3aed" },
};

const SUBJECT_LABELS = {
  ST: "Soporte Técnico",
  PD: "Pregunta sobre donaciones",
  PP: "Problemas con puntos",
  Sug: "Sugerencia",
  Otro: "Otro",
};

// Umbrales de nivel, usados tanto para el texto (userLevel) como para
// el tallo de crecimiento visual del hero.
const LEVELS = [
  { name: "Reciclador Novato", points: 0 },
  { name: "Eco-Guardián", points: 150 },
  { name: "Héroe Verde", points: 500 },
];

/* ─────────── Íconos SVG inline (reemplazan los emojis) ─────────── */
const IconEdit = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconX = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconStar = (props) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const IconLeaf = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M5 21c0-8 5-15 14-15 0 9-5 15-14 15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M5 21c3-4 6-7 12-11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IconFlame = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 2c1 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s2 1 2 4a6 6 0 1 1-12 0C5 8 9 8 12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const IconUsers = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15.5 5.5c1.3.4 2.2 1.5 2.2 2.9 0 1.4-.9 2.5-2.2 2.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M17.5 14.7c2 .6 3.5 2.3 3.5 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconRecycle = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 19H4.8a2 2 0 0 1-1.7-3l1.6-2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.3 5.2 7.9 7.6l4.2 2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 3.6h2.6a2 2 0 0 1 1.7 1l1.5 2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.8 12.6l1.4 2.4-1.4 2.4h-4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.7 19.9l1.4-2.4-4.2-2.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.2 19.9H6.6a2 2 0 0 1-1.7-1l-1.2-2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGift = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="8" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8v13" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 8c-1.5 0-4-1-4-3s1.5-2.5 2.7-1.5S12 6 12 8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 8c1.5 0 4-1 4-3s-1.5-2.5-2.7-1.5S12 6 12 8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const IconWarning = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 3l10 18H2L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17.3" r="0.9" fill="currentColor" />
  </svg>
);

const IconUpload = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconMail = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInbox = (props) => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 12h4.5l1.5 3h6l1.5-3H21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 5h14l2 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l2-7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const IconLock = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Ícono por pestaña, solo para las tabs — no afecta ninguna lógica
const TAB_ICONS = {
  Perfil: IconUsers,
  Editar: IconEdit,
  Seguridad: IconLock,
  Actividad: IconRecycle,
  Soporte: IconMail,
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Perfil");
  const [userData, setUserData] = useState({});
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Formularios ampliados con datos universitarios
  const [editForm, setEditForm] = useState({
    first_name: "", last_name: "", phone: "", city: "",
    campus: "", faculty: "", bio: ""
  });
  const [passForm, setPassForm] = useState({ current: "", next: "", confirm: "" });
  const [passError, setPassError] = useState("");

  // Actividad
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

  // Soporte (mensajes de contacto)
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);

  // uid confiable: se setea solo cuando Firebase confirma la sesión
  // (evita condiciones de carrera justo después de refrescar la página)
  const [uid, setUid] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUid(user.uid);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        // Separamos el nombre del displayName de Auth por si Firestore está vacío
        const authDisplayName = user.displayName ? user.displayName.split(" ") : [];
        const defaultFirst = authDisplayName[0] || "Usuario";
        const defaultLast = authDisplayName.slice(1).join(" ") || "";

        if (snap.exists()) {
          const data = snap.data();
          setUserData({ ...data, authEmail: user.email });
          setPreview(data.photoURL || null);
          setZoom(data.zoom || 1);
          setEditForm({
            first_name: data.first_name || defaultFirst,
            last_name: data.last_name || defaultLast,
            phone: data.phone || "",
            city: data.city || "",
            campus: data.campus || "",
            faculty: data.faculty || "",
            bio: data.bio || "",
          });
        } else {
          // Si el documento en Firestore no existe todavía, usamos los datos de Auth
          setUserData({
            first_name: defaultFirst,
            last_name: defaultLast,
            authEmail: user.email
          });
          setEditForm(p => ({
            ...p,
            first_name: defaultFirst,
            last_name: defaultLast,
          }));
        }
      } catch (e) {
        console.error("Error al cargar datos de usuario:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Cargar actividad
  useEffect(() => {
    if (activeTab !== "Actividad" || !auth.currentUser?.uid) return;
    const load = async () => {
      try {
        const uid = auth.currentUser.uid;
        const dSnap = await getDocs(query(collection(db, "donations"), where("ownerId", "==", uid)));
        setDonations(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const rSnap = await getDocs(query(collection(db, "requests"), where("userId", "==", uid)));
        setRequests(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    load();
  }, [activeTab]);

  // Cargar donaciones/solicitudes en segundo plano para las stats del hero,
  // aunque el usuario no haya entrado a la pestaña Actividad
  useEffect(() => {
    if (!uid) return;
    getDocs(query(collection(db, "donations"), where("ownerId", "==", uid)))
      .then(s => setDonations(s.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
    getDocs(query(collection(db, "requests"), where("userId", "==", uid)))
      .then(s => setRequests(s.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, [uid]);

  // Cargar mensajes de soporte del usuario (tiempo real).
  // Depende de `uid` (no de la pestaña) para que funcione apenas Firebase
  // confirme la sesión, incluso justo después de refrescar la página.
  useEffect(() => {
    if (!uid) return;
    setSupportLoading(true);
    const q = query(collection(db, "contactMessages"), where("userId", "==", uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setSupportMessages(data);
        setSupportLoading(false);
      },
      (err) => {
        console.error("Error al escuchar mensajes de soporte:", err);
        setSupportLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const savePhoto = async () => {
    if (!selectedFile || !auth.currentUser) return;
    setSaving(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const photoURL = reader.result;
        const userRef = doc(db, "users", auth.currentUser.uid);

        await setDoc(userRef, { photoURL, zoom }, { merge: true });

        setUserData(prev => ({ ...prev, photoURL }));
        setPreview(photoURL);
        setShowPhotoModal(false);
        showToast("Foto actualizada");
      } catch (e) {
        console.error("Error al guardar foto:", e);
        showToast("Error al guardar la foto", "error");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const saveEdit = async () => {
    if (!auth.currentUser) {
      showToast("No hay una sesión activa", "error");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      const cleanedForm = {
        first_name: editForm.first_name?.trim() || "",
        last_name: editForm.last_name?.trim() || "",
        phone: editForm.phone?.trim() || "",
        city: editForm.city?.trim() || "",
        campus: editForm.campus || "",
        faculty: editForm.faculty?.trim() || "",
        bio: editForm.bio?.trim() || "",
      };

      await setDoc(userRef, cleanedForm, { merge: true });

      setUserData(prev => ({ ...prev, ...cleanedForm }));
      showToast("Perfil actualizado correctamente");
      setActiveTab("Perfil");
    } catch (e) {
      console.error("Error al guardar en Firestore:", e);
      showToast("Error al guardar los cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setPassError("");
    if (passForm.next !== passForm.confirm) return setPassError("Las contraseñas no coinciden");
    if (passForm.next.length < 6) return setPassError("Mínimo 6 caracteres");
    setSaving(true);
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, passForm.current);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, passForm.next);
      setPassForm({ current: "", next: "", confirm: "" });
      showToast("Contraseña actualizada");
    } catch (e) {
      setPassError("Contraseña actual incorrecta");
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DE GAMIFICACIÓN Y UI ---
  const role = ROLE_MAP[userData.user_type] || { label: "Usuario", color: "#64748b" };
  const displayName = `${userData.first_name || "Usuario"} ${userData.last_name || ""}`.trim();
  const displayEmail = userData.email || userData.authEmail || "Correo no registrado";
  const initials = `${userData.first_name?.[0] || "U"}${userData.last_name?.[0] || ""}`.toUpperCase();

  // Puntos y Nivel
  const totalPoints = (userData.points || 0) + (donations.length * 50);
  let userLevel = LEVELS[0].name;
  if (totalPoints >= LEVELS[1].points) userLevel = LEVELS[1].name;
  if (totalPoints >= LEVELS[2].points) userLevel = LEVELS[2].name;

  // Progreso del tallo de crecimiento (0-100%) sobre la escala Novato → Héroe Verde
  const maxLevelPoints = LEVELS[LEVELS.length - 1].points;
  const stemPercent = Math.min((totalPoints / maxLevelPoints) * 100, 100);
  const nextLevel = LEVELS.find(l => totalPoints < l.points);
  const pointsToNext = nextLevel ? nextLevel.points - totalPoints : 0;

  // Un mensaje se considera respondido si su status lo dice O si ya tiene
  // texto de respuesta guardado (cubre casos donde el status no se sincronizó)
  const isAnswered = (m) => m.status === "respondido" || !!(m.reply && m.reply.trim());

  // Badge "Respondido" en la pestaña Soporte
  const answeredSupport = supportMessages.filter(isAnswered).length;

  // Barra de progreso del perfil
  const profileFields = ["first_name", "last_name", "phone", "city", "campus", "faculty", "bio"];
  const completedFields = profileFields.filter(field => userData[field] && userData[field].toString().trim() !== "");
  const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner} />
      <p>Cargando perfil...</p>
    </div>
  );

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? <IconCheck /> : <IconX />} {toast.msg}
        </div>
      )}

      {/* HERO CARD */}
      <div className={styles.heroCard}>
        <div className={styles.heroBg} />

        <div className={styles.heroTopRow}>
          <div className={styles.avatarWrapper} onClick={() => setShowPhotoModal(true)}>
            {preview ? (
              <img src={preview} alt="foto" className={styles.avatarImg} style={{ transform: `scale(${zoom})` }} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
            <div className={styles.avatarOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h4l2-2h4l2 2h4v12H4V7z" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className={styles.avatarBadge}>
              <IconEdit />
            </span>
          </div>

          <div className={styles.heroInfo}>
            <h1>{displayName}</h1>
            <p className={styles.heroEmail}>{displayEmail}</p>

            <div className={styles.badgeContainer}>
              <span className={styles.rolePill} style={{ background: role.color + "20", color: role.color, border: `1px solid ${role.color}40` }}>
                {role.label}
              </span>
              <span className={styles.levelPill}>
                <IconStar /> {userLevel}
              </span>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <IconGift className={styles.statIcon} />
              <strong>{donations.length || "0"}</strong>
              <span>Donaciones</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <IconUsers className={styles.statIcon} />
              <strong>{requests.length || "0"}</strong>
              <span>Solicitudes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <IconStar className={styles.statIcon} />
              <strong>{totalPoints}</strong>
              <span>Puntos ECO</span>
            </div>
          </div>
        </div>

        {/* Tallo de crecimiento: visualiza el nivel como algo que crece con cada donación */}
        <div className={styles.heroMetaRow}>
          <div className={styles.growthStem}>
            <div className={styles.stemTrack}>
              <div className={styles.stemFill} style={{ width: `${stemPercent}%` }} />
              {LEVELS.map((level) => {
                const pos = (level.points / maxLevelPoints) * 100;
                const reached = totalPoints >= level.points;
                return (
                  <div
                    key={level.name}
                    className={`${styles.stemNode} ${reached ? styles.stemNodeActive : ""}`}
                    style={{ left: `${pos}%` }}
                    title={level.name}
                  >
                    <IconLeaf width="12" height="12" />
                  </div>
                );
              })}
            </div>
            <div className={styles.stemLabels}>
              {LEVELS.map((level, i) => {
                const pos = (level.points / maxLevelPoints) * 100;
                // Primer nodo pegado a la izquierda, último a la derecha,
                // el resto centrado sobre su nodo — igual que en el tallo.
                const translateX = i === 0 ? "0%" : i === LEVELS.length - 1 ? "-100%" : "-50%";
                return (
                  <span
                    key={level.name}
                    className={styles.stemLabel}
                    style={{ left: `${pos}%`, transform: `translateX(${translateX})` }}
                  >
                    {level.name}
                  </span>
                );
              })}
            </div>
            <p className={styles.stemCaption}>
              {nextLevel
                ? `Te faltan ${pointsToNext} puntos para ${nextLevel.name}`
                : "Nivel máximo alcanzado — sigue donando para mantenerlo"}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => {
          const TabIcon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <TabIcon className={styles.tabIcon} />
              {tab}
              {tab === "Soporte" && answeredSupport > 0 && (
                <span className={styles.tabBadge}>Respondido</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.content}>

        {/* ── PERFIL ── */}
        {activeTab === "Perfil" && (
          <div className={styles.profileView}>

            {profileCompletion < 100 && (
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>Completa tu perfil para ganar más confianza ({profileCompletion}%)</span>
                  <button onClick={() => setActiveTab("Editar")} className={styles.linkBtn}>Completar ahora</button>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>
            )}

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Información personal</h2>
              <button onClick={() => setActiveTab("Editar")} className={styles.editFloatBtn}>
                <IconEdit /> Editar
              </button>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Nombre Completo</span>
                <p className={styles.infoValue}>{displayName}</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Correo Electrónico</span>
                <p className={styles.infoValue}>{displayEmail}</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Teléfono</span>
                <p className={styles.infoValue}>{userData.phone || "No registrado"}</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ciudad Actual</span>
                <p className={styles.infoValue}>{userData.city || "No registrada"}</p>
              </div>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Comunidad Universitaria</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sede de Estudio</span>
                <p className={styles.infoValue}>{userData.campus || "No especificada"}</p>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Facultad / Carrera</span>
                <p className={styles.infoValue}>{userData.faculty || "No especificada"}</p>
              </div>
              <div className={styles.infoItem} style={{ gridColumn: "1 / -1" }}>
                <span className={styles.infoLabel}>Sobre mí</span>
                <p className={styles.infoValue}>{userData.bio || "¡Hola! Soy parte de la comunidad EcoCanje."}</p>
              </div>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Insignias & Impacto</h2>
            <div className={styles.badgesGrid}>
              <div className={`${styles.badgeCard} ${donations.length >= 1 ? styles.badgeActive : ""}`}>
                <span className={styles.badgeIconWrap}><IconLeaf /></span>
                <p>Primera Semilla</p>
                <small>1+ Donación</small>
              </div>
              <div className={`${styles.badgeCard} ${totalPoints >= 150 ? styles.badgeActive : ""}`}>
                <span className={styles.badgeIconWrap}><IconFlame /></span>
                <p>En Racha</p>
                <small>150+ Puntos</small>
              </div>
              <div className={`${styles.badgeCard} ${userData.bio && userData.campus ? styles.badgeActive : ""}`}>
                <span className={styles.badgeIconWrap}><IconUsers /></span>
                <p>Miembro Activo</p>
                <small>Perfil 100%</small>
              </div>
            </div>
          </div>
        )}

        {/* ── EDITAR ── */}
        {activeTab === "Editar" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Editar perfil</h2>
            <div className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} placeholder="Tu nombre" />
                </div>
                <div className={styles.formGroup}>
                  <label>Apellido</label>
                  <input value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} placeholder="Tu apellido" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="Ej: 999888777" />
                </div>
                <div className={styles.formGroup}>
                  <label>Ciudad</label>
                  <input value={editForm.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="Ej: Lima" />
                </div>
              </div>

              <h3 className={styles.subTitle}>Datos Universitarios</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Sede (Campus)</label>
                  <select value={editForm.campus} onChange={e => setEditForm(p => ({ ...p, campus: e.target.value }))}>
                    <option value="">Selecciona tu sede...</option>
                    <option value="Sede Lima Centro">Sede Lima Centro</option>
                    <option value="Sede San Juan de Lurigancho">Sede San Juan de Lurigancho</option>
                    <option value="Sede Lima Sur">Sede Lima Sur</option>
                    <option value="Otra Sede">Otra Sede</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Facultad o Carrera</label>
                  <input value={editForm.faculty} onChange={e => setEditForm(p => ({ ...p, faculty: e.target.value }))} placeholder="Ej: Ing. Sistemas" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Sobre mí</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Escribe una breve descripción sobre ti y tus intereses de reciclaje..."
                  rows="3"
                ></textarea>
              </div>

              <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar todos los cambios"}
              </button>
            </div>
          </div>
        )}

        {/* ── SEGURIDAD ── */}
        {activeTab === "Seguridad" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cambiar contraseña</h2>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Contraseña actual</label>
                <input type="password" value={passForm.current} onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
              </div>
              <div className={styles.formGroup}>
                <label>Nueva contraseña</label>
                <input type="password" value={passForm.next} onChange={e => setPassForm(p => ({ ...p, next: e.target.value }))} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmar nueva contraseña</label>
                <input type="password" value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repite la contraseña" />
              </div>
              {passError && <p className={styles.errorMsg}><IconWarning /> {passError}</p>}
              <button className={styles.saveBtn} onClick={savePassword} disabled={saving}>
                {saving ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVIDAD ── */}
        {activeTab === "Actividad" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mis donaciones</h2>
            {donations.length === 0 ? (
              <p className={styles.empty}>Aún no has publicado donaciones.</p>
            ) : (
              <div className={styles.activityList}>
                {donations.map(d => (
                  <div key={d.id} className={styles.activityCard}>
                    <div className={styles.activityIcon}><IconRecycle /></div>
                    <div>
                      <p className={styles.activityTitle}>{d.title || "Donación"}</p>
                      <p className={styles.activitySub}>{d.type || "Artículo"} · {d.location || "Ubicación"}</p>
                    </div>
                    <span className={`${styles.activityStatus} ${styles[d.status] || ""}`}>
                      {d.status || "Activa"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <h2 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>Mis solicitudes</h2>
            {requests.length === 0 ? (
              <p className={styles.empty}>Aún no has hecho solicitudes.</p>
            ) : (
              <div className={styles.activityList}>
                {requests.map(r => (
                  <div key={r.id} className={styles.activityCard}>
                    <div className={styles.activityIcon}><IconGift /></div>
                    <div>
                      <p className={styles.activityTitle}>Solicitud de donación</p>
                      <p className={styles.activitySub}>Enviada recientemente</p>
                    </div>
                    <span className={styles.activityStatus}>{r.status || "Pendiente"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SOPORTE ── */}
        {activeTab === "Soporte" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mis mensajes de soporte</h2>

            {supportLoading ? (
              <p className={styles.empty}>Cargando mensajes...</p>
            ) : supportMessages.length === 0 ? (
              <div className={styles.emptySupport}>
                <IconInbox />
                <p>Aún no has enviado mensajes a soporte.</p>
                <a href="/contacto" className={styles.linkBtn}>Ir a Contacto</a>
              </div>
            ) : (
              <div className={styles.supportList}>
                {supportMessages.map((msg) => (
                  <div key={msg.id} className={styles.supportCard}>
                    <div className={styles.supportHeader}>
                      <span className={styles.supportSubject}>
                        <IconMail /> {SUBJECT_LABELS[msg.subject] || msg.subject}
                      </span>
                      <span
                        className={`${styles.supportStatus} ${isAnswered(msg) ? styles.statusDone : styles.statusPending}`}
                      >
                        {isAnswered(msg) ? "Respondido" : "Pendiente"}
                      </span>
                    </div>

                    <p className={styles.supportMessage}>{msg.message}</p>

                    {isAnswered(msg) && msg.reply && (
                      <div className={styles.supportReply}>
                        <span className={styles.supportReplyLabel}>
                          <IconCheck /> Respuesta del equipo
                        </span>
                        <p>{msg.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal foto */}
      {showPhotoModal && (
        <div className={styles.overlay} onClick={() => setShowPhotoModal(false)}>
          <div className={styles.photoModal} onClick={e => e.stopPropagation()}>
            <div className={styles.photoModalHeader}>
              <h3>Cambiar foto de perfil</h3>
              <button onClick={() => setShowPhotoModal(false)}><IconX /></button>
            </div>

            <div className={styles.photoPreviewBox}>
              {preview ? (
                <img src={preview} alt="preview" style={{ transform: `scale(${zoom})`, transition: "0.2s" }} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </div>

            {selectedFile && (
              <div className={styles.zoomControl}>
                <label>Zoom</label>
                <input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
              </div>
            )}

            <label className={styles.uploadBtn}>
              <IconUpload /> Seleccionar imagen
              <input type="file" accept="image/*" hidden onChange={e => {
                const f = e.target.files[0];
                if (f) { setSelectedFile(f); setPreview(URL.createObjectURL(f)); }
              }} />
            </label>

            {selectedFile && (
              <button className={styles.saveBtn} onClick={savePhoto} disabled={saving}>
                {saving ? "Guardando..." : "Guardar foto"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}