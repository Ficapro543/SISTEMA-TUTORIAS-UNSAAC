import { useState } from "react";
import styles from "../styles/components/SemestreSelector.module.css";

function SemestreSelector({ semestres, onChange }) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    
    if (value) {
      const semestre = semestres.find((s) => s.nombre === value);
      onChange(semestre);
    } else {
      onChange(null);
    }
  };

  // Función para formatear el nombre del semestre
  const formatSemesterName = (semestre) => {
    const nombre = semestre.nombre;
    
    // Formato académico estándar
    if (nombre.match(/^\d{4}-\d$/)) {
      const [year, period] = nombre.split('-');
      const periodNames = {
        '1': 'I',
        '2': 'II',
        '3': 'Verano'
      };
      return `${year} - Semestre ${periodNames[period] || period}`;
    }
    
    return nombre;
  };

  // Información adicional del semestre
  const getSemesterInfo = (semestre) => {
    const info = [];
    
    if (semestre.fecha_inicio && semestre.fecha_fin) {
      const startDate = new Date(semestre.fecha_inicio);
      const endDate = new Date(semestre.fecha_fin);
      
      const formatDate = (date) => 
        date.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }).replace(/ de /g, '/');
      
      info.push(`${formatDate(startDate)} - ${formatDate(endDate)}`);
    }
    
    return info.join(' • ');
  };

  return (
    <div className={styles.semesterSelector}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>Selección de Semestre</h3>
          <p className={styles.subtitle}>
            Consulte tutorías históricas por período académico
          </p>
        </div>
        
        {selectedValue && (
          <div className={styles.selectedInfo}>
            <div className={styles.selectedContent}>
              <span className={styles.selectedLabel}>Semestre seleccionado</span>
              <span className={styles.selectedValue}>
                {formatSemesterName(semestres.find(s => s.nombre === selectedValue))}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.selectorContainer}>
        <div className={styles.selectWrapper}>
          <label htmlFor="semestre-select" className={styles.selectLabel}>
            Semestre académico
          </label>
          <div className={styles.selectGroup}>
            <select
              id="semestre-select"
              value={selectedValue}
              onChange={handleChange}
              className={`${styles.select} ${selectedValue ? styles.hasSelection : ''}`}
              aria-describedby="semestre-description"
            >
              <option value="" disabled>
                Seleccione un período académico
              </option>
              {semestres.map((semestre) => (
                <option 
                  key={semestre.nombre} 
                  value={semestre.nombre}
                >
                  {formatSemesterName(semestre)}
                  {semestre.fecha_inicio && (
                    ` • ${new Date(semestre.fecha_inicio).getFullYear()}`
                  )}
                </option>
              ))}
            </select>
          </div>
          <p id="semestre-description" className={styles.selectDescription}>
            Los semestres listados contienen tutorías realizadas y están cerrados a modificaciones
          </p>
        </div>

        {selectedValue && (
          <div className={styles.semesterDetails}>
            <div className={styles.detailsHeader}>
              <h4 className={styles.detailsTitle}>Detalles del período</h4>
            </div>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nombre completo:</span>
                <span className={styles.detailValue}>
                  {semestres.find(s => s.nombre === selectedValue)?.nombre}
                </span>
              </div>
              
              {getSemesterInfo(semestres.find(s => s.nombre === selectedValue)) && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Período:</span>
                  <span className={styles.detailValue}>
                    {getSemesterInfo(semestres.find(s => s.nombre === selectedValue))}
                  </span>
                </div>
              )}
              
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Estado:</span>
                <span className={`${styles.statusBadge} ${
                  semestres.find(s => s.nombre === selectedValue)?.cerrado 
                    ? styles.statusClosed 
                    : styles.statusOpen
                }`}>
                  {semestres.find(s => s.nombre === selectedValue)?.cerrado 
                    ? 'Período concluido' 
                    : 'En progreso'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {semestres.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <h4 className={styles.emptyTitle}>No hay períodos disponibles</h4>
            <p className={styles.emptyText}>
              Los semestres aparecerán en esta lista una vez que se hayan registrado tutorías 
              y los períodos hayan sido cerrados administrativamente.
            </p>
          </div>
        </div>
      )}

      {semestres.length > 0 && !selectedValue && (
        <div className={styles.instructions}>
          <p className={styles.instructionText}>
            Para visualizar las tutorías históricas, seleccione un semestre de la lista.
          </p>
        </div>
      )}
    </div>
  );
}

export default SemestreSelector;