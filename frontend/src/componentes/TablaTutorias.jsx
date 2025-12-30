import { useState, useEffect } from "react";
import styles from "../styles/components/TablaTutorias.module.css";

function TablaTutorias({ tutorias, onVerDetalle, modo = "semestre", estudiantesCount = null }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;
  
  // Resetear página cuando cambian los datos o el ordenamiento
  useEffect(() => {
    setCurrentPage(1);
  }, [tutorias, sortConfig.key, sortConfig.direction]);

  // Función para ordenar la tabla
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Función para obtener datos ordenados y paginados
  const getProcessedData = () => {
    // Primero ordenar
    let sortedData = tutorias;
    if (sortConfig.key) {
      sortedData = [...tutorias].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Manejar diferentes tipos de datos
        if (sortConfig.key === 'fecha') {
          // Convertir fechas para comparación correcta
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          // Para strings, convertir a minúsculas para comparación insensible a mayúsculas
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    // Luego paginar
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return {
      paginatedData: sortedData.slice(startIndex, endIndex),
      totalItems: sortedData.length,
      totalPages: Math.ceil(sortedData.length / ITEMS_PER_PAGE)
    };
  };

  // Formatear fecha para visualización
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ de /g, '/');
  };

  // Funciones de paginación
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    const { totalPages } = getProcessedData();
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Función para generar números de página inteligentes
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Número de páginas a mostrar alrededor de la página actual

    // Siempre mostrar la primera página
    if (1 < currentPage - delta) {
      pages.push(1);
      if (2 < currentPage - delta) {
        pages.push('...');
      }
    }

    // Mostrar páginas alrededor de la página actual
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }

    // Siempre mostrar la última página
    if (totalPages > currentPage + delta) {
      if (totalPages - 1 > currentPage + delta) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const { paginatedData, totalItems, totalPages } = getProcessedData();

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
            {modo === "semestre" ? "Tutorías del Semestre" : 
             estudiantesCount ? `Historial de Estudiantes (${estudiantesCount} encontrados)` : 
             "Historial del Estudiante"}
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

              {modo === "estudiante" && (
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
            {paginatedData.map((tutoria) => (
              <tr key={tutoria.id} className={styles.tableRow}>
                {modo === "estudiante" && (
                  <td className={styles.semestreCell}>
                    <div className={styles.semestreName}>{tutoria.semestre}</div>
                  </td>
                )}
                {modo === "estudiante" &&(
                  <td className={styles.studentCell}>
                    <div className={styles.studentName}>{tutoria.estudiante}</div>
                      {tutoria.codigo_estudiante && (
                        <div className={styles.studentCode}>{tutoria.codigo_estudiante}</div>
                      )}
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
            Mostrando {paginatedData.length} de {totalItems} registros (Página {currentPage} de {totalPages})
          </span>
          <span className={styles.lastUpdate}>
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </span>
        </div>

        {totalPages > 1 && (
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              ← Anterior
            </button>

            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                <span key={index}>
                  {page === '...' ? (
                    <span className={styles.pageEllipsis}>...</span>
                  ) : (
                    <button
                      className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )}
                </span>
              ))}
            </div>

            <button
              className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TablaTutorias;