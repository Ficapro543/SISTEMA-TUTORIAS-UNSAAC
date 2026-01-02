import React, { useState } from 'react';
import styles from '../../styles/pages/VerifSeguimientoEstudiante.module.css';

const VerifSeguimientoEstudiante = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Mock Data for a specific student
    const mockStudent = {
        nombre: 'Juan Pérez Muñoz',
        codigo: '160001',
        escuela: 'Ingeniería Informática',
        email: '160001@unsaac.edu.pe',
        tutorActual: 'Dr. Roberto Carlos'
    };

    const mockHistory = [
        {
            fecha: '2023-11-20',
            tipo: 'Académica',
            tutor: 'Dr. Roberto Carlos',
            estado: 'Asistió',
            observaciones: 'El estudiante presenta mejora en sus notas.'
        },
        {
            fecha: '2023-10-15',
            tipo: 'Profesional',
            tutor: 'Dr. Roberto Carlos',
            estado: 'Asistió',
            observaciones: 'Consulta sobre prácticas pre-profesionales.'
        },
        {
            fecha: '2023-09-10',
            tipo: 'Personal',
            tutor: 'Dra. Ana Lopez',
            estado: 'Faltó',
            observaciones: 'No se presentó a la cita.'
        },
        {
            fecha: '2023-08-25',
            tipo: 'Académica',
            tutor: 'Dra. Ana Lopez',
            estado: 'Asistió',
            observaciones: 'Inicio de semestre regular.'
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setHasSearched(true);
        if (searchTerm.trim() !== '') {
            // Simulate finding data
            setSearchResult({
                info: mockStudent,
                history: mockHistory
            });
        } else {
            setSearchResult(null);
        }
    };

    const getBadgeClass = (status) => {
        switch (status) {
            case 'Asistió': return styles.badgeAsistio;
            case 'Faltó': return styles.badgeFalto;
            default: return styles.badgeProgramada;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Seguimiento Individual del Estudiante</h1>
                <p className={styles.subtitle}>Visualiza la constancia y progreso del estudiante en el programa de tutorías</p>
            </div>

            <div className={styles.searchSection}>
                <form className={styles.searchForm} onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Ingrese código o nombre del estudiante..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className={styles.searchButton}>
                        Buscar estudiante
                    </button>
                </form>
            </div>

            {hasSearched && searchResult ? (
                <div className={styles.resultsContainer}>
                    {/* Student Info Card */}
                    <div className={styles.studentCard}>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Estudiante</span>
                            <span className={styles.infoValue}>{searchResult.info.nombre}</span>
                        </div>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Código</span>
                            <span className={styles.infoValue}>{searchResult.info.codigo}</span>
                        </div>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Escuela Profesional</span>
                            <span className={styles.infoValue}>{searchResult.info.escuela}</span>
                        </div>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Tutor Actual</span>
                            <span className={styles.infoValue}>{searchResult.info.tutorActual}</span>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className={styles.tableContainer}>
                        <h3 className={styles.sectionTitle}>Historial de Tutorías</h3>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Tutor</th>
                                        <th>Estado</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResult.history.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.fecha}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.tutor}</td>
                                            <td>
                                                <span className={`${styles.badge} ${getBadgeClass(item.estado)}`}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td>{item.observaciones}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <p className={styles.emptyText}>
                        {hasSearched
                            ? "No se encontró ningún estudiante con ese criterio."
                            : "Realiza una búsqueda para ver la información del estudiante."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default VerifSeguimientoEstudiante;
