"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db } from "../../firebase/db";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import styles from "./profile.module.css";

const TABS = ["Perfil", "Editar", "Seguridad", "Actividad"];

const ROLE_MAP = {
  donante: { label: "Donante", color: "#16a34a" },
  receptor: { label: "Receptor", color: "#2563eb" },
  admin: { label: "Administrador", color: "#ea580c" },
  ambos: { label: "Donante y Receptor", color: "#7c3aed" },
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

 useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) return;
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

  const savePhoto = async () => {
  if (!selectedFile || !auth.currentUser) return;
  setSaving(true);
  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const photoURL = reader.result;
      const userRef = doc(db, "users", auth.currentUser.uid);

      // SOLUCIÓN: También protegemos la subida de foto de perfil
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

    // SOLUCIÓN: Cambiamos updateDoc por setDoc con merge: true
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
  let userLevel = "Reciclador Novato";
  if (totalPoints >= 150) userLevel = "Eco-Guardián";
  if (totalPoints >= 500) userLevel = "Héroe Verde 🍃";

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
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* HERO CARD MEJORADO */}
      <div className={styles.heroCard}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.avatarWrapper} onClick={() => setShowPhotoModal(true)}>
            {preview ? (
              <img src={preview} alt="foto" className={styles.avatarImg} style={{ transform: `scale(${zoom})` }} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
            <div className={styles.avatarOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h4l2-2h4l2 2h4v12H4V7z" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          
          <div className={styles.heroInfo}>
            <h1>{displayName}</h1>
            <p className={styles.heroEmail}>{displayEmail}</p>
            
            <div className={styles.badgeContainer}>
              <span className={styles.rolePill} style={{ background: role.color + "20", color: role.color, border: `1px solid ${role.color}40` }}>
                {role.emoji} {role.label}
              </span>
              <span className={styles.levelPill}>
                🌟 Nivel: {userLevel}
              </span>
            </div>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <strong>{donations.length || "0"}</strong>
              <span>Donaciones</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>{requests.length || "0"}</strong>
              <span>Solicitudes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>{totalPoints}</strong>
              <span>Puntos ECO</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {/* ── PERFIL MEJORADO ── */}
        {activeTab === "Perfil" && (
          <div className={styles.profileView}>
            
            {/* Barra de progreso */}
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
                ✏️ Editar
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
                <span className={styles.badgeIcon}>🌱</span>
                <p>Primera Semilla</p>
                <small>1+ Donación</small>
              </div>
              <div className={`${styles.badgeCard} ${totalPoints >= 150 ? styles.badgeActive : ""}`}>
                <span className={styles.badgeIcon}>🔥</span>
                <p>En Racha</p>
                <small>150+ Puntos</small>
              </div>
              <div className={`${styles.badgeCard} ${userData.bio && userData.campus ? styles.badgeActive : ""}`}>
                <span className={styles.badgeIcon}>🤝</span>
                <p>Miembro Activo</p>
                <small>Perfil 100%</small>
              </div>
            </div>
          </div>
        )}

        {/* ── EDITAR (Actualizado con campos universitarios) ── */}
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

        {/* ── SEGURIDAD (Se mantiene igual) ── */}
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
              {passError && <p className={styles.errorMsg}>⚠ {passError}</p>}
              <button className={styles.saveBtn} onClick={savePassword} disabled={saving}>
                {saving ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </div>
          </div>
        )}

        {/* ── ACTIVIDAD (Se mantiene igual) ── */}
        {activeTab === "Actividad" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mis donaciones</h2>
            {donations.length === 0 ? (
              <p className={styles.empty}>Aún no has publicado donaciones.</p>
            ) : (
              <div className={styles.activityList}>
                {donations.map(d => (
                  <div key={d.id} className={styles.activityCard}>
                    <div className={styles.activityIcon}>♻️</div>
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
                    <div className={styles.activityIcon}>🎁</div>
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
      </div>

      {/* Modal foto */}
      {showPhotoModal && (
        <div className={styles.overlay} onClick={() => setShowPhotoModal(false)}>
          <div className={styles.photoModal} onClick={e => e.stopPropagation()}>
            <div className={styles.photoModalHeader}>
              <h3>Cambiar foto de perfil</h3>
              <button onClick={() => setShowPhotoModal(false)}>✕</button>
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
              📁 Seleccionar imagen
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