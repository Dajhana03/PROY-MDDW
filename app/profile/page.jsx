"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase/auth";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db } from "../../firebase/db";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import styles from "./profile.module.css";

const TABS = ["Perfil", "Editar", "Seguridad", "Actividad"];

const ROLE_MAP = {
  donante: { label: "Donante", emoji: "♻️", color: "#16a34a" },
  receptor: { label: "Receptor", emoji: "🎁", color: "#2563eb" },
  admin: { label: "Administrador", emoji: "🛡️", color: "#ea580c" },
  ambos: { label: "Donante y Receptor", emoji: "🤝", color: "#7c3aed" },
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

  // Edit form
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "", city: "" });

  // Password form
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
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setPreview(data.photoURL || null);
          setZoom(data.zoom || 1);
          setEditForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            city: data.city || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Cargar actividad cuando se abre la pestaña
  useEffect(() => {
    if (activeTab !== "Actividad" || !userData.userId) return;
    const load = async () => {
      try {
        const dSnap = await getDocs(query(collection(db, "donations"), where("userId", "==", userData.userId)));
        setDonations(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const rSnap = await getDocs(query(collection(db, "requests"), where("userId", "==", userData.userId)));
        setRequests(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    load();
  }, [activeTab, userData.userId]);

  const savePhoto = async () => {
    if (!selectedFile) return;
    setSaving(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const photoURL = reader.result;
      await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL, zoom });
      setUserData(prev => ({ ...prev, photoURL }));
      setPreview(photoURL);
      setShowPhotoModal(false);
      setSaving(false);
      showToast("Foto actualizada");
    };
    reader.readAsDataURL(selectedFile);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), editForm);
      setUserData(prev => ({ ...prev, ...editForm }));
      showToast("Perfil actualizado");
    } catch (e) {
      showToast("Error al guardar", "error");
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

  const role = ROLE_MAP[userData.user_type] || { label: "Usuario", emoji: "👤", color: "#64748b" };
  const initials = `${userData.first_name?.[0] || ""}${userData.last_name?.[0] || ""}`.toUpperCase();

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.spinner} />
      <p>Cargando perfil...</p>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* Hero card */}
      <div className={styles.heroCard}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.avatarWrapper} onClick={() => setShowPhotoModal(true)}>
            {preview ? (
              <img src={preview} alt="foto" className={styles.avatarImg} style={{ transform: `scale(${zoom})` }} />
            ) : (
              <span className={styles.avatarInitials}>{initials || "U"}</span>
            )}
            <div className={styles.avatarOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h4l2-2h4l2 2h4v12H4V7z" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div className={styles.heroInfo}>
            <h1>{userData.first_name} {userData.last_name}</h1>
            <p className={styles.heroEmail}>{userData.email}</p>
            <span className={styles.rolePill} style={{ background: role.color + "20", color: role.color, border: `1px solid ${role.color}40` }}>
              {role.emoji} {role.label}
            </span>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <strong>{donations.length || "—"}</strong>
              <span>Donaciones</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>{requests.length || "—"}</strong>
              <span>Solicitudes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <strong>{userData.city || "—"}</strong>
              <span>Ciudad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className={styles.content}>

        {/* ── PERFIL ── */}
        {activeTab === "Perfil" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Información personal</h2>
            <div className={styles.infoGrid}>
              {[
                { label: "Nombre", value: `${userData.first_name} ${userData.last_name}` },
                { label: "Correo", value: userData.email },
                { label: "Teléfono", value: userData.phone || "No registrado" },
                { label: "Ciudad", value: userData.city || "No registrada" },
                { label: "Fecha de nacimiento", value: userData.birth_date || "No registrada" },
                { label: "Rol", value: `${role.emoji} ${role.label}` },
              ].map(({ label, value }) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{label}</span>
                  <p className={styles.infoValue}>{value}</p>
                </div>
              ))}
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
                  <input
                    value={editForm.first_name}
                    onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Apellido</label>
                  <input
                    value={editForm.last_name}
                    onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input
                    value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Ej: 999888777"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ciudad</label>
                  <input
                    value={editForm.city}
                    onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="Ej: Lima"
                  />
                </div>
              </div>
              <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
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
                <input
                  type="password"
                  value={passForm.current}
                  onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={passForm.next}
                  onChange={e => setPassForm(p => ({ ...p, next: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={passForm.confirm}
                  onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repite la contraseña"
                />
              </div>
              {passError && <p className={styles.errorMsg}>⚠ {passError}</p>}
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
              <p className={styles.empty}>Aún no has hecho donaciones.</p>
            ) : (
              <div className={styles.activityList}>
                {donations.map(d => (
                  <div key={d.id} className={styles.activityCard}>
                    <div className={styles.activityIcon}>♻️</div>
                    <div>
                      <p className={styles.activityTitle}>{d.title || "Donación"}</p>
                      <p className={styles.activitySub}>{d.category || ""} · {d.city || ""}</p>
                    </div>
                    <span className={`${styles.activityStatus} ${styles[d.status] || ""}`}>
                      {d.status || "activa"}
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
                      <p className={styles.activityTitle}>{r.title || "Solicitud"}</p>
                      <p className={styles.activitySub}>{r.category || ""}</p>
                    </div>
                    <span className={`${styles.activityStatus}`}>{r.status || "pendiente"}</span>
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
                <input type="range" min="1" max="2.5" step="0.05" value={zoom}
                  onChange={e => setZoom(Number(e.target.value))} />
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