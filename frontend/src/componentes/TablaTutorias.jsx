import { useState } from "react";
import styles from "../styles/components/TablaTutorias.module.css";

function TablaTutorias({ tutorias, onVerDetalle, modo = "semestre" }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Función para ordenar la tabla
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener datos ordenados
  const getSortedData = () => {
    if (!sortConfig.key) return tutorias;

    return [...tutorias].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // Formatear fecha para visualización
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ de /g, '/');
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

  // Obtener texto abreviado para tipo
  const getTipoAbreviado = (tipo) => {
    switch(tipo?.toUpperCase()) {
      case 'ACADEMICA': return 'Académica';
      case 'PERSONAL': return 'Personal';
      case 'PROFESIONAL': return 'Profesional';
      default: return 'General';
    }
  };

  const sortedTutorias = getSortedData();

  if (tutorias.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <p className={styles.emptyText}>No se encontraron tutorías registradas</p>
        <p className={styles.emptySubtext}>
          No hay registros de tutorías para el semestre seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.tableInfo}>
          <h4 className={styles.tableTitle}>
            {modo === "semestre" ? "Tutorías del Semestre" : "Historial del Estudiante"}
          </h4>
          <span className={styles.tableCount}>
            {tutorias.length} {tutorias.length === 1 ? 'registro' : 'registros'} encontrados
          </span>
        </div>
      </div>

      <div className={styles.tableScrollWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {modo === "estudiante" && (
                <th
                  className={`${styles.sortable} ${sortConfig.key === 'semestre' ? styles.sorted : ''}`}
                  onClick={() => requestSort('semestre')}
                >
                  Semestre
                  {sortConfig.key === 'semestre' && (
                    <span className={styles.sortIndicator}>
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              )}

              {modo === "semestre" && (
                <th
                  className={`${styles.sortable} ${sortConfig.key === 'estudiante' ? styles.sorted : ''}`}
                  onClick={() => requestSort('estudiante')}
                >
                  Estudiante
                  {sortConfig.key === 'estudiante' && (
                    <span className={styles.sortIndicator}>
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              )}
              
              <th
                  className={`${styles.sortable} ${sortConfig.key === 'tutor' ? styles.sorted : ''}`}
                  onClick={() => requestSort('tutor')}
                >
                  Tutor
                  {sortConfig.key === 'tutor' && (
                    <span className={styles.sortIndicator}>
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
              </th>
              <th>Tipo</th>
              <th 
                className={`${styles.sortable} ${sortConfig.key === 'fecha' ? styles.sorted : ''}`}
                onClick={() => requestSort('fecha')}
              >
                Fecha
                {sortConfig.key === 'fecha' && (
                  <span className={styles.sortIndicator}>
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className={styles.actionsHeader}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedTutorias.map((tutoria) => (
              <tr key={tutoria.id} className={styles.tableRow}>
                {modo === "estudiante" && (
                  <td className={styles.semestreCell}>
                    <div className={styles.semestreName}>{tutoria.semestre}</div>
                  </td>
                )}
                {modo === "semestre" &&(
                  <td className={styles.studentCell}>
                    <div className={styles.studentName}>{tutoria.estudiante}</div>
                      {tutoria.codigo_estudiante && (
                        <div className={styles.studentCode}>{tutoria.codigo_estudiante}</div>
                      )}
                  </td>
                )}
                <td className={styles.tutorCell}>{tutoria.tutor}</td>
                <td>
                  <span className={`${styles.tipoBadge} ${getTipoClass(tutoria.tipo)}`}>
                    {getTipoAbreviado(tutoria.tipo)}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {formatDate(tutoria.fecha)}
                </td>
                <td className={styles.actionsCell}>
                  <button
                    className={styles.viewButton}
                    onClick={() => onVerDetalle(tutoria)}
                    title="Ver detalles completos"
                    aria-label={`Ver detalles de tutoría de ${tutoria.estudiante}`}
                  >
                    <span className={styles.buttonText}>Ver detalles</span>
                    <span className={styles.buttonIcon}>→</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.tableFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.pageInfo}>
            Mostrando {sortedTutorias.length} de {tutorias.length} registros
          </span>
          <span className={styles.lastUpdate}>
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TablaTutorias;