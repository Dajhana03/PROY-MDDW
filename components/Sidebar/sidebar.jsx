"use client";

const filterOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Artículos', value: 'articulos' },
  { label: 'Reciclables', value: 'reciclables' },
  { label: 'Alimentos', value: 'alimentos' }
];

export default function Sidebar({ searchTerm, setSearchTerm, activeFilter, setActiveFilter }) {
  return (
    <aside className="sidebar">
      <div className="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar donaciones..."
        />
      </div>

      <div className="filter-card">
        <div className="filter-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtrar por Tipo
        </div>
        <div className="filter-options">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-btn ${activeFilter === option.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="impact-card">
        <div className="impact-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Tu Impacto
        </div>
        <div className="impact-rows">
          <div className="impact-row">
            <span className="impact-label">Donaciones:</span>
            <span className="impact-value">12</span>
          </div>
          <div className="impact-row">
            <span className="impact-label">Puntos:</span>
            <span className="impact-value">850</span>
          </div>
          <div className="impact-row">
            <span className="impact-label">Nivel:</span>
            <span className="impact-nivel">
              Plata
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}