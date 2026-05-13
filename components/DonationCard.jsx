"use client";

import "../app/publish/publish.css";
import { useState } from "react";

const tagClasses = {
  articulos: "tag-articulos",
  reciclables: "tag-reciclables",
  alimentos: "tag-alimentos",
};

export default function DonationCard({ donation, onRequest }) {
  const [liked, setLiked] = useState(donation.liked);
  const [likes, setLikes] = useState(donation.likes);

  const handleLike = () => {
    setLiked((current) => !current);
    setLikes((current) => (liked ? current - 1 : current + 1));
  };

  return (
    <article className="donation-card">
      <div className="card-header">
        <div className="card-user">
          <div className="avatar" style={{ background: donation.avatarColor }}>
            {donation.iniciales}
          </div>
          <div className="user-info">
            <span className="user-name">{donation.autor}</span>
            <span className="user-time">{donation.tiempo}</span>
          </div>
        </div>
        <span className="pts-badge">{donation.pts}</span>
      </div>

      <div className="card-body">
        <span className={`card-tag ${tagClasses[donation.type] || ""}`}>
          {donation.tag}
        </span>
        <h2 className="card-title">{donation.title}</h2>
        <p className="card-desc">{donation.description}</p>
        {donation.img ? (
          <img src={donation.img} alt={donation.title} className="card-img" />
        ) : (
          <div className="card-img-placeholder">Sin imagen disponible</div>
        )}
        <p className="card-location">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {donation.ubicacion}
        </p>
      </div>

      <div className="card-footer">
        <div className="card-actions">
          <button
            className={`action-btn ${liked ? "liked" : ""}`}
            type="button"
            onClick={handleLike}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likes}
          </button>
          <button
            className="action-btn"
            type="button"
            onClick={() => onRequest(donation)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16 4l4 4-4 4" />
              <path d="M20 8H5a3 3 0 0 0-3 3v6" />
            </svg>
            Solicitar
          </button>
        </div>
        <button
          className="btn-solicitar"
          type="button"
          onClick={() => onRequest(donation)}
          disabled={donation.solicitado}
        >
          {donation.solicitado ? "Solicitado" : "Solicitar"}
        </button>
      </div>
    </article>
  );
}
