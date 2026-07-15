"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/client";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import styles from "./admin.module.css";

const ROLE_LABELS = {
  donante: "Donante",
  receptor: "Receptor",
  admin: "Admin",
  ambos: "Ambos",
};

const ROLE_COLORS = {
  donante: "#4caf50",
  receptor: "#2196f3",
  admin: "#ff9800",
  ambos: "#8b5cf6",
};

const SUBJECT_LABELS = {
  ST: "Soporte Técnico",
  PD: "Pregunta sobre donaciones",
  PP: "Problemas con puntos",
  Sug: "Sugerencia",
  Otro: "Otro",
};

/* ─────────── Íconos SVG inline (reemplazan los emojis) ─────────── */
const IconTrash = (props) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 7h16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 7l-.8 12.4a2 2 0 0 1-2 1.6H8.3a2 2 0 0 1-2-1.6L5.5 7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconClose = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export default function AdminPage() {
  const [tab, setTab] = useState("usuarios"); // "usuarios" | "eventos" | "mensajes"

  /* ============ USUARIOS ============ */
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
          u.city?.toLowerCase().includes(q),
      );
    }

    setFiltered(result);
  }, [users, search, roleFilter]);

  const handleRoleChange = async (user, newRole) => {
    if (user.user_type === "admin") {
      alert("No puedes modificar el rol de otro administrador.");
      return;
    }

    await updateDoc(doc(db, "users", user.id), {
      user_type: newRole,
    });
  };

  const handleDelete = async (user) => {
    if (user.user_type === "admin") {
      alert("No puedes eliminar otro administrador.");
      return;
    }

    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    await deleteDoc(doc(db, "users", user.id));
    setSelectedUser(null);
  };

  const counts = {
    todos: users.length,
    donante: users.filter((u) => u.user_type === "donante").length,
    receptor: users.filter((u) => u.user_type === "receptor").length,
    admin: users.filter((u) => u.user_type === "admin").length,
  };

  /* ============ EVENTOS ============ */
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    hour: "",
    place: "",
  });
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setEventsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleEventFormChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (creatingEvent) return;
    if (
      !eventForm.title.trim() ||
      !eventForm.date ||
      !eventForm.hour.trim() ||
      !eventForm.place.trim()
    ) {
      return;
    }

    if (eventForm.date < todayStr) {
      alert("No puedes publicar un evento con una fecha pasada.");
      return;
    }

    setCreatingEvent(true);
    try {
      await addDoc(collection(db, "events"), {
        title: eventForm.title.trim(),
        date: eventForm.date,
        hour: eventForm.hour.trim(),
        place: eventForm.place.trim(),
        attendees: [],
      });
      setEventForm({ title: "", date: "", hour: "", place: "" });
      setShowEventModal(false);
    } catch (err) {
      console.error("Error al crear evento:", err);
      alert("No se pudo publicar el evento");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("¿Eliminar este evento? También desaparecerá de Comunidad."))
      return;
    await deleteDoc(doc(db, "events", eventId));
  };

  /* ============ MENSAJES DE CONTACTO ============ */
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState("todos"); // "todos" | "pendiente" | "respondido"
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "contactMessages"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setMessagesLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredMessages =
    messageFilter === "todos"
      ? messages
      : messages.filter((m) => (m.status || "pendiente") === messageFilter);

  const messageCounts = {
    todos: messages.length,
    pendiente: messages.filter((m) => (m.status || "pendiente") === "pendiente")
      .length,
    respondido: messages.filter((m) => m.status === "respondido").length,
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText(msg.reply || "");
  };

  const closeMessageModal = () => {
    setSelectedMessage(null);
    setReplyText("");
  };

  const handleSaveReply = async () => {
    if (!selectedMessage || !replyText.trim() || sendingReply) return;
    setSendingReply(true);
    try {
      await updateDoc(doc(db, "contactMessages", selectedMessage.id), {
        reply: replyText.trim(),
        status: "respondido",
        repliedAt: serverTimestamp(),
      });
      closeMessageModal();
    } catch (err) {
      console.error("Error al guardar respuesta:", err);
      alert("No se pudo guardar la respuesta");
    } finally {
      setSendingReply(false);
    }
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

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tabBtn} ${tab === "usuarios" ? styles.tabActive : ""}`}
          onClick={() => setTab("usuarios")}
        >
          Usuarios
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "eventos" ? styles.tabActive : ""}`}
          onClick={() => setTab("eventos")}
        >
          Eventos
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "mensajes" ? styles.tabActive : ""}`}
          onClick={() => setTab("mensajes")}
        >
          Mensajes
          {messageCounts.pendiente > 0 && (
            <span className={styles.tabBadge}>{messageCounts.pendiente}</span>
          )}
        </button>
      </div>

      {/* ============ TAB USUARIOS ============ */}
      {tab === "usuarios" && (
        <>
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

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar por nombre, email o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

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
                            disabled={user.user_type === "admin"}
                            onChange={(e) =>
                              handleRoleChange(user, e.target.value)
                            }
                          >
                            <option value="donante">Donante</option>
                            <option value="receptor">Receptor</option>
                            <option value="admin">Admin</option>
                            <option value="ambos">Ambos</option>
                          </select>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(user)}
                            title="Eliminar usuario"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {selectedUser && (
            <div
              className={styles.modalOverlay}
              onClick={() => setSelectedUser(null)}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedUser(null)}
                >
                  <IconClose />
                </button>
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    className={styles.modalAvatar}
                    alt="foto"
                  />
                ) : (
                  <div className={styles.modalAvatarFallback}>
                    {selectedUser.first_name?.[0]}
                    {selectedUser.last_name?.[0]}
                  </div>
                )}
                <h2>
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
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
                  <p>
                    <strong>Ciudad:</strong> {selectedUser.city || "—"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {selectedUser.phone || "—"}
                  </p>
                  <p>
                    <strong>Fecha nac.:</strong>{" "}
                    {selectedUser.birth_date || "—"}
                  </p>
                  <p>
                    <strong>ID:</strong> <code>{selectedUser.userId}</code>
                  </p>
                </div>

                <button
                  className={styles.deleteBtnModal}
                  disabled={selectedUser.user_type === "admin"}
                  onClick={() => handleDelete(selectedUser)}
                >
                  Eliminar usuario
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ TAB EVENTOS ============ */}
      {tab === "eventos" && (
        <>
          <div className={styles.eventsHeader}>
            <h2 className={styles.eventsTitle}>
              Eventos publicados ({events.length})
            </h2>
            <button
              className={styles.newEventBtn}
              onClick={() => setShowEventModal(true)}
            >
              + Nuevo Evento
            </button>
          </div>

          {eventsLoading ? (
            <p className={styles.loading}>Cargando eventos...</p>
          ) : events.length === 0 ? (
            <p className={styles.empty}>
              Todavía no has publicado ningún evento.
            </p>
          ) : (
            <div className={styles.eventsGrid}>
              {events.map((event) => (
                <div className={styles.eventAdminCard} key={event.id}>
                  <div className={styles.eventAdminHeader}>
                    <h3>{event.title}</h3>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteEvent(event.id)}
                      title="Eliminar evento"
                    >
                      <IconTrash />
                    </button>
                  </div>
                  <p className={styles.eventAdminMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 3V7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 3V7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3 10H21"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {event.date}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ marginLeft: "8px" }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 7V12L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {event.hour}
                  </p>
                  <p className={styles.eventAdminMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21C12 21 19 14.5 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.5 12 21 12 21Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {event.place}
                  </p>
                  <p className={styles.eventAdminMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 21C4 17.5 7 15 12 15C17 15 20 17.5 20 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {(event.attendees || []).length} asistirán
                  </p>
                </div>
              ))}
            </div>
          )}

          {showEventModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowEventModal(false)}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "380px", alignItems: "stretch" }}
              >
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowEventModal(false)}
                >
                  <IconClose />
                </button>
                <h2 style={{ margin: "0 0 1rem" }}>Nuevo Evento</h2>

                <form onSubmit={handleCreateEvent} className={styles.eventForm}>
                  <label>
                    Título
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) =>
                        handleEventFormChange("title", e.target.value)
                      }
                      placeholder="Ej. Jornada de reciclaje"
                      required
                    />
                  </label>

                  <label>
                    Fecha
                    <input
                      type="date"
                      value={eventForm.date}
                      min={todayStr}
                      onChange={(e) =>
                        handleEventFormChange("date", e.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Hora
                    <input
                      type="time"
                      value={eventForm.hour}
                      onChange={(e) =>
                        handleEventFormChange("hour", e.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Lugar
                    <input
                      type="text"
                      value={eventForm.place}
                      onChange={(e) =>
                        handleEventFormChange("place", e.target.value)
                      }
                      placeholder="Ej. Parque Central"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    className={styles.newEventBtn}
                    disabled={creatingEvent}
                    style={{ width: "100%", marginTop: "0.5rem" }}
                  >
                    {creatingEvent ? "Publicando..." : "Publicar Evento"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============ TAB MENSAJES ============ */}
      {tab === "mensajes" && (
        <>
          <div className={styles.statsRow}>
            {["todos", "pendiente", "respondido"].map((f) => (
              <button
                key={f}
                className={`${styles.statCard} ${messageFilter === f ? styles.statActive : ""}`}
                onClick={() => setMessageFilter(f)}
              >
                <span className={styles.statNumber}>{messageCounts[f]}</span>
                <span className={styles.statLabel}>
                  {f === "todos"
                    ? "Total"
                    : f === "pendiente"
                      ? "Pendientes"
                      : "Respondidos"}
                </span>
              </button>
            ))}
          </div>

          {messagesLoading ? (
            <p className={styles.loading}>Cargando mensajes...</p>
          ) : filteredMessages.length === 0 ? (
            <p className={styles.empty}>No hay mensajes en esta categoría.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Asunto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className={styles.row}
                      onClick={() => openMessage(msg)}
                    >
                      <td>
                        {msg.firstName} {msg.lastName}
                      </td>
                      <td>{msg.email}</td>
                      <td>{SUBJECT_LABELS[msg.subject] || msg.subject}</td>
                      <td>
                        <span
                          className={styles.roleBadge}
                          style={{
                            background:
                              (msg.status === "respondido"
                                ? "#4caf50"
                                : "#ff9800") + "22",
                            color:
                              msg.status === "respondido"
                                ? "#4caf50"
                                : "#ff9800",
                            border: `1px solid ${msg.status === "respondido" ? "#4caf50" : "#ff9800"}55`,
                          }}
                        >
                          {msg.status === "respondido"
                            ? "Respondido"
                            : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal detalle mensaje + responder */}
          {selectedMessage && (
            <div className={styles.modalOverlay} onClick={closeMessageModal}>
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                style={{ width: "420px", alignItems: "stretch" }}
              >
                <button className={styles.closeBtn} onClick={closeMessageModal}>
                  <IconClose />
                </button>

                <h2 style={{ margin: "0 0 0.3rem" }}>
                  {selectedMessage.firstName} {selectedMessage.lastName}
                </h2>
                <p className={styles.modalEmail}>{selectedMessage.email}</p>

                <div className={styles.modalDetails}>
                  <p>
                    <strong>Asunto:</strong>{" "}
                    {SUBJECT_LABELS[selectedMessage.subject] ||
                      selectedMessage.subject}
                  </p>
                  <p>
                    <strong>Mensaje:</strong>
                  </p>
                  <p style={{ whiteSpace: "pre-wrap" }}>
                    {selectedMessage.message}
                  </p>
                </div>

                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#444",
                    marginTop: "0.8rem",
                  }}
                >
                  Tu respuesta
                </label>
                <textarea
                  className={styles.replyTextarea}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe tu respuesta para este usuario..."
                  rows={4}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    marginTop: "0.8rem",
                  }}
                >
                  <a
                    className={styles.tabBtn}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                      "Re: " +
                      (SUBJECT_LABELS[selectedMessage.subject] ||
                        selectedMessage.subject),
                    )}&body=${encodeURIComponent(replyText)}`}
                  >
                    Abrir en correo
                  </a>
                  <button
                    className={styles.newEventBtn}
                    style={{ flex: 1 }}
                    disabled={!replyText.trim() || sendingReply}
                    onClick={handleSaveReply}
                  >
                    {sendingReply ? "Guardando..." : "Guardar respuesta"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
