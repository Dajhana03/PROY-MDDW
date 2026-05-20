'use client';

import { useEffect, useRef, useState } from 'react';

const typeOptions = [
  { label: 'Artículos', value: 'articulos' },
  { label: 'Reciclables', value: 'reciclables' },
  { label: 'Alimentos', value: 'alimentos' }
];

const conditionOptions = ['Nuevo', 'Como nuevo', 'Buen estado', 'Regular'];

export default function PublishPage() {
  const [type, setType] = useState('articulos');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('Nuevo');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const draft = window.localStorage.getItem('ecocanje_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setType(data.type || 'articulos');
        setTitle(data.title || '');
        setDescription(data.description || '');
        setQuantity(data.quantity || 1);
        setCondition(data.condition || 'Nuevo');
        setLocation(data.location || '');
        setDate(data.date || '');
        setTime(data.time || '');
      } catch {
        // ignore malformed draft
      }
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    imageFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setToast('⚠️ El archivo supera 5MB');
        return;
      }
      if (uploadedFiles.length >= 6) {
        setToast('Máximo 6 imágenes permitidas');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFiles((current) => [
          ...current,
          { id: Date.now() + Math.random(), name: file.name, src: event.target.result }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleDraft = () => {
    const data = {
      type,
      title,
      description,
      quantity,
      condition,
      location,
      date,
      time
    };
    window.localStorage.setItem('ecocanje_draft', JSON.stringify(data));
    setToast('✅ Borrador guardado correctamente');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      setToast('⚠️ Por favor ingresa un título');
      return;
    }
    if (!description.trim()) {
      setToast('⚠️ Por favor agrega una descripción');
      return;
    }

    const publication = {
      id: Date.now(),
      type,
      title,
      description,
      quantity,
      condition,
      location: location || 'Ubicación no especificada',
      date: date || '—',
      time: time || '—',
      image: uploadedFiles[0]?.src || null
    };
    const existing = JSON.parse(window.localStorage.getItem('ecocanje_posts') || '[]');
    window.localStorage.setItem('ecocanje_posts', JSON.stringify([...existing, publication]));
    setToast('🎉 ¡Donación publicada exitosamente!');
    setTitle('');
    setDescription('');
    setQuantity(1);
    setCondition('Nuevo');
    setLocation('');
    setDate('');
    setTime('');
    setUploadedFiles([]);
    setType('articulos');
  };

  const removeImage = (id) => {
    setUploadedFiles((current) => current.filter((item) => item.id !== id));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="main-bg">
      <div className="page-header">
        <h1>Publicar Donación</h1>
        <p>Comparte lo que ya no usas y ayuda a quien lo necesita</p>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label className="form-label">Tipo de Donación</label>
          <div className="donation-types">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`type-btn ${type === option.value ? 'active' : ''}`}
                data-type={option.value}
                onClick={() => setType(option.value)}
              >
                <span className="type-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {option.value === 'articulos' && (
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    )}
                    {option.value === 'reciclables' && (
                      <>
                        <polyline points="1 4 1 10 7 10" />
                        <polyline points="23 20 23 14 17 14" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </>
                    )}
                    {option.value === 'alimentos' && (
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    )}
                  </svg>
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="titulo">Título de la Donación</label>
          <input
            id="titulo"
            className="form-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Libros de programación en buen estado"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            className="form-textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe el estado, cantidad y cualquier detalle importante..."
          />
        </div>

        <div
          className="upload-zone"
          id="uploadZone"
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <input
            type="file"
            id="fileInput"
            accept=".png,.jpg,.jpeg"
            multiple
            hidden
            ref={fileInputRef}
            onChange={(event) => handleFiles(event.target.files)}
          />
          <div className="upload-content" id="uploadContent">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2e8b57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            <p>Arrastra imágenes aquí o <span className="upload-link">haz clic para seleccionar</span></p>
            <small>PNG, JPG hasta 5MB</small>
          </div>
          <div className="preview-grid" id="previewGrid">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="preview-img-wrap">
                <img src={file.src} alt={file.name} />
                <button type="button" className="preview-remove" onClick={(event) => { event.stopPropagation(); removeImage(file.id); }} title="Eliminar">✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label className="form-label" htmlFor="cantidad">Cantidad</label>
            <input
              id="cantidad"
              className="form-input"
              type="number"
              value={quantity}
              min="1"
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <div className="form-group half">
            <label className="form-label" htmlFor="condicion">Condición</label>
            <div className="select-wrapper">
              <select
                id="condicion"
                className="form-select"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
              >
                {conditionOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <svg className="select-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ubicacion">Ubicación de Entrega</label>
          <input
            id="ubicacion"
            className="form-input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Campus, edificio o punto de encuentro"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Disponibilidad</label>
          <div className="form-row">
            <input
              type="date"
              className="form-input half-input"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <input
              type="time"
              className="form-input half-input"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
        </div>

        <button type="button" className="btn-preview" id="btnPreview" onClick={handlePreview}>
          Vista Previa
        </button>

        <div className="form-actions">
          <button type="button" className="btn-draft" id="btnDraft" onClick={handleDraft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar Borrador
          </button>
          <button type="button" className="btn-publish" id="btnPublish" onClick={handlePublish}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Publicar Donación
          </button>
        </div>

        <p className="form-notice">Al publicar, aceptas que la información sea visible para la comunidad universitaria.</p>
      </div>

      {previewOpen && (
        <div className="modal-overlay open" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Vista Previa</h2>
              <button className="modal-close" type="button" onClick={() => setPreviewOpen(false)} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Revisa los datos antes de publicar.</p>
              <div className="preview-row"><span className="preview-key">Tipo</span><span className="preview-val">{typeOptions.find((item) => item.value === type)?.label}</span></div>
              <div className="preview-row"><span className="preview-key">Título</span><span className="preview-val">{title || '—'}</span></div>
              <div className="preview-row"><span className="preview-key">Descripción</span><span className="preview-val">{description || '—'}</span></div>
              <div className="preview-row"><span className="preview-key">Cantidad</span><span className="preview-val">{quantity}</span></div>
              <div className="preview-row"><span className="preview-key">Condición</span><span className="preview-val">{condition}</span></div>
              <div className="preview-row"><span className="preview-key">Ubicación</span><span className="preview-val">{location || '—'}</span></div>
              <div className="preview-row"><span className="preview-key">Fecha</span><span className="preview-val">{date || '—'}</span></div>
              <div className="preview-row"><span className="preview-key">Hora</span><span className="preview-val">{time || '—'}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </main>
  );
}
