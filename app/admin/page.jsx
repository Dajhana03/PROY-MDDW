"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/client";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import styles from "./admin.module.css";

const ROLE_LABELS = {
  donante: "Donante",
  receptor: "Receptor",
  admin: "Admin",
};

const ROLE_COLORS = {
  donante: "#4caf50",
  receptor: "#2196f3",
  admin: "#ff9800",
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Escucha en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    });

    return () => unsub(); // limpia al desmontar
  }, []);

  // Filtros
  useEffect(() => {
    let result = [...users];

    if (roleFilter !== "todos") {
      result = result.filter((u) => u.user_type === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    await updateDoc(doc(db, "users", userId), { user_type: newRole });
  };

  const handleDelete = async (userId) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    await deleteDoc(doc(db, "users", userId));
    setSelectedUser(null);
  };

  const counts = {
    todos: users.length,
    donante: users.filter((u) => u.user_type === "donante").length,
    receptor: users.filter((u) => u.user_type === "receptor").length,
    admin: users.filter((u) => u.user_type === "admin").length,
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Panel de Administración</h1>
        <span className={styles.liveTag}>
          <span className={styles.liveDot} />
          Tiempo real
        </span>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {["todos", "donante", "receptor", "admin"].map((role) => (
          <button
            key={role}
            className={`${styles.statCard} ${roleFilter === role ? styles.statActive : ""}`}
            onClick={() => setRoleFilter(role)}
          >
            <span className={styles.statNumber}>{counts[role]}</span>
            <span className={styles.statLabel}>
              {role === "todos" ? "Total" : ROLE_LABELS[role] + "s"}
            </span>
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <p className={styles.loading}>Cargando usuarios...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Ciudad</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className={styles.row}
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className={styles.userCell}>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="avatar"
                          className={styles.avatar}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {user.first_name?.[0]}
                          {user.last_name?.[0]}
                        </div>
                      )}
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.city || "—"}</td>
                    <td>
                      <span
                        className={styles.roleBadge}
                        style={{
                          background: ROLE_COLORS[user.user_type] + "22",
                          color: ROLE_COLORS[user.user_type],
                          border: `1px solid ${ROLE_COLORS[user.user_type]}55`,
                        }}
                      >
                        {ROLE_LABELS[user.user_type] || user.user_type}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className={styles.roleSelect}
                        value={user.user_type}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="donante">Donante</option>
                        <option value="receptor">Receptor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(user.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>✕</button>
            {selectedUser.photoURL ? (
              <img src={selectedUser.photoURL} className={styles.modalAvatar} alt="foto" />
            ) : (
              <div className={styles.modalAvatarFallback}>
                {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
              </div>
            )}
            <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>
            <p className={styles.modalEmail}>{selectedUser.email}</p>
            <span
              className={styles.roleBadge}
              style={{
                background: ROLE_COLORS[selectedUser.user_type] + "22",
                color: ROLE_COLORS[selectedUser.user_type],
                border: `1px solid ${ROLE_COLORS[selectedUser.user_type]}55`,
              }}
            >
              {ROLE_LABELS[selectedUser.user_type]}
            </span>
            <div className={styles.modalDetails}>
              <p><strong>Ciudad:</strong> {selectedUser.city || "—"}</p>
              <p><strong>Teléfono:</strong> {selectedUser.phone || "—"}</p>
              <p><strong>Fecha nac.:</strong> {selectedUser.birth_date || "—"}</p>
              <p><strong>ID:</strong> <code>{selectedUser.userId}</code></p>
            </div>
            <button
              className={styles.deleteBtnModal}
              onClick={() => handleDelete(selectedUser.id)}
            >
              Eliminar usuario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}