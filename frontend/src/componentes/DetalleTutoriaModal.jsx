import styles from "../styles/components/DetalleTutoriaModal.module.css";

function DetalleTutoriaModal({ tutoria, onClose }) {
  if (!tutoria) return null;
  
  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>📋 Detalle de Tutoría</h3>
          <button className={styles.headerCloseBtn} onClick={onClose} title="Cerrar">
            &times;
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Columna 1: Información General */}
          <div className={styles.section}>
            <h4>📊 Información General</h4>
            <div className={styles.grid}>
              <div className={styles.infoItem}>
                <strong>Estudiante:</strong>
                <span>{tutoria.estudiante} ({tutoria.codigo_estudiante})</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Tutor:</strong>
                <span>{tutoria.tutor}</span>
                {tutoria.tutor_email && (
                  <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                    {tutoria.tutor_email}
                  </span>
                )}
              </div>
              <div className={styles.infoItem}>
                <strong>Semestre:</strong>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: 'var(--color-primary)',
                  fontSize: '1.1rem'
                }}>
                  {tutoria.semestre}
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Fecha y Hora:</strong>
                <span style={{ fontWeight: '500' }}>
                  {formatDate(tutoria.fecha)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Tipo de Tutoría:</strong>
                <span className={`${styles.tipo} ${styles[tutoria.tipo?.toLowerCase()] || styles.general}`}>
                  {tutoria.tipo || 'GENERAL'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <strong>Modalidad:</strong>
                <span>{tutoria.modalidad || 'No especificada'}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>Ambiente/Lugar:</strong>
                <span>{tutoria.ambiente || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Observaciones y Detalles */}
          <div>
            {/* Observaciones */}
            <div className={styles.section}>
              <h4>📝 Observaciones</h4>
              {tutoria.observaciones?.academico && (
                <div className={styles.observacion}>
                  <strong>🔬 Académico:</strong>
                  <p>{tutoria.observaciones.academico}</p>
                </div>
              )}
              {tutoria.observaciones?.personal && (
                <div className={styles.observacion}>
                  <strong>👤 Personal:</strong>
                  <p>{tutoria.observaciones.personal}</p>
                </div>
              )}
              {tutoria.observaciones?.profesional && (
                <div className={styles.observacion}>
                  <strong>💼 Profesional:</strong>
                  <p>{tutoria.observaciones.profesional}</p>
                </div>
              )}
              {tutoria.observaciones?.general && (
                <div className={styles.observacion}>
                  <strong>📋 Resumen General:</strong>
                  <p>{tutoria.observaciones.general}</p>
                </div>
              )}
              
              {!tutoria.observaciones?.academico && 
               !tutoria.observaciones?.personal && 
               !tutoria.observaciones?.profesional && 
               !tutoria.observaciones?.general && (
                <div className={styles.observacion}>
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
                    No hay observaciones registradas para esta tutoría.
                  </p>
                </div>
              )}
            </div>

            {/* Derivación (si existe) */}
            {tutoria.requiere_derivacion && tutoria.derivacion && (
              <div className={styles.section}>
                <h4>🔄 Derivación</h4>
                <div className={styles.grid}>
                  <div className={styles.infoItem}>
                    <strong>Especialidad:</strong>
                    <span style={{ color: '#d63384', fontWeight: '500' }}>
                      {tutoria.derivacion.especialidad}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Motivo:</strong>
                    <span>{tutoria.derivacion.motivo}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Registro */}
            <div className={styles.section}>
              <h4>📅 Registro</h4>
              <div className={styles.grid}>
                <div className={styles.infoItem}>
                  <strong>Registrado el:</strong>
                  <span>{formatDate(tutoria.fechas?.registro)}</span>
                </div>
                {tutoria.fechas?.actualizacion && (
                  <div className={styles.infoItem}>
                    <strong>Última Actualización:</strong>
                    <span>{formatDate(tutoria.fechas.actualizacion)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleTutoriaModal;