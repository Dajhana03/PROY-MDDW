'use client';

import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import DonationCard from './components/DonationCard';
import donationsData from './data/donations';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  const [donations, setDonations] = useState(donationsData);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [toast, setToast] = useState('');

  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);
      const matchesFilter =
        activeFilter === 'todas' || item.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter, donations]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleRequest = (donation) => {
    setSelectedDonation(donation);
    setRequestMessage('');
  };

  const confirmRequest = () => {
    if (!selectedDonation) return;
    setDonations((current) =>
      current.map((item) =>
        item.id === selectedDonation.id
          ? { ...item, solicitado: true }
          : item
      )
    );
    setToast(`Solicitud enviada para “${selectedDonation.title}”`);
    setSelectedDonation(null);
  };

  const closeModal = () => {
    setSelectedDonation(null);
  };

  return (
    <main className="main-bg">
      <div className="layout">
        <Sidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        <section className="feed" id="feed">
          <div className="feed-header">
            <h1>Feed de Donaciones</h1>
            <p>Descubre y solicita donaciones de la comunidad universitaria</p>
          </div>

          <div className="cards-container">
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} onRequest={handleRequest} />
              ))
            ) : (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c3e6d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No se encontraron donaciones con ese filtro.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedDonation && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Solicitar Donación</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Estás solicitando: <strong>{selectedDonation.title}</strong></p>
              <label className="modal-label">Mensaje para el donante (opcional)</label>
              <textarea
                className="modal-textarea"
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Ej: Hola, me gustaría solicitar esta donación porque..."
              />
              <button className="btn-confirm" onClick={confirmRequest}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Confirmar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </main>
  );
}
