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

  // Función para formatear el nombre del semestre
  const formatSemesterName = (semestre) => {
    if (!semestre) return 'No disponible';
    
    // Formato académico estándar
    if (semestre.match(/^\d{4}-\d$/)) {
      const [year, period] = semestre.split('-');
      const periodNames = {
        '1': 'I',
        '2': 'II',
        '3': 'Verano'
      };
      return `${year} - Semestre ${periodNames[period] || period}`;
    }
    
    return semestre;
  };

  // Obtener clase para el tipo de tutoría
  const getTipoClass = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'ACADEMICA': return styles.tipoAcademica;
      case 'PERSONAL': return styles.tipoPersonal;
      case 'PROFESIONAL': return styles.tipoProfesional;
      default: return styles.tipoGeneral;
    }
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
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>{tutoria.estudiante}</span>
                  {tutoria.codigo_estudiante && (
                    <span className={styles.studentCode}>
                      Código: {tutoria.codigo_estudiante}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <strong>Tutor:</strong>
                <div className={styles.tutorInfo}>
                  <span className={styles.tutorName}>{tutoria.tutor}</span>
                  {tutoria.tutor_email && (
                    <span className={styles.tutorEmail}>
                      {tutoria.tutor_email}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <strong>Semestre:</strong>
                <span className={styles.semesterBadge}>
                  {formatSemesterName(tutoria.semestre)}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <strong>Fecha y Hora:</strong>
                <span className={styles.dateTime}>
                  {formatDate(tutoria.fecha)}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <strong>Tipo de Tutoría:</strong>
                <span className={`${styles.tipoBadge} ${getTipoClass(tutoria.tipo)}`}>
                  {tutoria.tipo || 'GENERAL'}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <strong>Modalidad:</strong>
                <span className={styles.modalidadText}>{tutoria.modalidad || 'No especificada'}</span>
              </div>
              
              {tutoria.ambiente && (
                <div className={styles.infoItem}>
                  <strong>Ambiente/Lugar:</strong>
                  <span className={styles.ambienteText}>{tutoria.ambiente}</span>
                </div>
              )}
            </div>
          </div>

          {/* Columna 2: Observaciones por categoría */}
          <div>
            {/* Observaciones organizadas */}
            <div className={styles.section}>
              <h4>📋 Observaciones por Área</h4>
              <div className={styles.observacionesGrid}>
                {tutoria.observaciones?.academico && (
                  <div className={styles.observacionCategoria}>
                    <div className={`${styles.observacionHeader} ${styles.academico}`}>
                      <span className={styles.observacionIcon}>📚</span>
                      <h5 className={styles.observacionTitle}>Académico</h5>
                    </div>
                    <div className={styles.observacionContent}>
                      <p>{tutoria.observaciones.academico}</p>
                    </div>
                  </div>
                )}
                
                {tutoria.observaciones?.personal && (
                  <div className={styles.observacionCategoria}>
                    <div className={`${styles.observacionHeader} ${styles.personal}`}>
                      <span className={styles.observacionIcon}>👤</span>
                      <h5 className={styles.observacionTitle}>Personal</h5>
                    </div>
                    <div className={styles.observacionContent}>
                      <p>{tutoria.observaciones.personal}</p>
                    </div>
                  </div>
                )}
                
                {tutoria.observaciones?.profesional && (
                  <div className={styles.observacionCategoria}>
                    <div className={`${styles.observacionHeader} ${styles.profesional}`}>
                      <span className={styles.observacionIcon}>💼</span>
                      <h5 className={styles.observacionTitle}>Profesional</h5>
                    </div>
                    <div className={styles.observacionContent}>
                      <p>{tutoria.observaciones.profesional}</p>
                    </div>
                  </div>
                )}
                
                {tutoria.observaciones?.general && (
                  <div className={styles.observacionCategoria}>
                    <div className={`${styles.observacionHeader} ${styles.general}`}>
                      <span className={styles.observacionIcon}>📋</span>
                      <h5 className={styles.observacionTitle}>Resumen General</h5>
                    </div>
                    <div className={styles.observacionContent}>
                      <p>{tutoria.observaciones.general}</p>
                    </div>
                  </div>
                )}
                
                {!tutoria.observaciones?.academico && 
                 !tutoria.observaciones?.personal && 
                 !tutoria.observaciones?.profesional && 
                 !tutoria.observaciones?.general && (
                  <div className={styles.noObservaciones}>
                    <span className={styles.noObservacionesIcon}>📝</span>
                    <p className={styles.noObservacionesText}>
                      No hay observaciones registradas para esta tutoría.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Derivación (si existe) */}
            {tutoria.requiere_derivacion && tutoria.derivacion && (
              <div className={styles.section}>
                <h4>🔄 Derivación</h4>
                <div className={styles.derivacionInfo}>
                  <div className={styles.derivacionItem}>
                    <strong>Estado:</strong>
                    <span className={styles.derivacionStatus}>Derivado</span>
                  </div>
                  <div className={styles.derivacionItem}>
                    <strong>Especialidad:</strong>
                    <span className={styles.derivacionValue}>
                      {tutoria.derivacion.especialidad}
                    </span>
                  </div>
                  {tutoria.derivacion.motivo && (
                    <div className={styles.derivacionItem}>
                      <strong>Motivo:</strong>
                      <span className={styles.derivacionValue}>
                        {tutoria.derivacion.motivo}
                      </span>
                    </div>
                  )}
                  {tutoria.derivacion.observaciones && (
                    <div className={styles.derivacionItem}>
                      <strong>Observaciones:</strong>
                      <span className={styles.derivacionValue}>
                        {tutoria.derivacion.observaciones}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de Registro */}
            <div className={styles.section}>
              <h4>📅 Información de Registro</h4>
              <div className={styles.registroGrid}>
                <div className={styles.registroItem}>
                  <strong>Registrado el:</strong>
                  <span className={styles.registroDate}>
                    {formatDate(tutoria.fechas?.registro)}
                  </span>
                </div>
                {tutoria.fechas?.actualizacion && (
                  <div className={styles.registroItem}>
                    <strong>Última actualización:</strong>
                    <span className={styles.registroDate}>
                      {formatDate(tutoria.fechas.actualizacion)}
                    </span>
                  </div>
                )}
                <div className={styles.registroItem}>
                  <strong>Accesibilidad:</strong>
                  <span className={styles.registroAccess}>Solo lectura</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            <span className={styles.footerText}>
              Registro histórico - No modificable
            </span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetalleTutoriaModal;