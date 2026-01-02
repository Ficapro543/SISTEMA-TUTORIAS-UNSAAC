import React, { useState } from 'react';
import styles from '../../styles/pages/VerifSeguimientoEstudiante.module.css';
import api from '../../utils/api';

const VerifSeguimientoEstudiante = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [candidates, setCandidates] = useState([]); // Lista de resultados de búsqueda
    const [selectedStudent, setSelectedStudent] = useState(null); // Estudiante seleccionado
    const [history, setHistory] = useState([]); // Historial del seleccionado

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Banner de error principal
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);
        setCandidates([]);
        setSelectedStudent(null);
        setHistory([]);

        try {
            const url = `/verificador/estudiantes/buscar?q=${encodeURIComponent(searchTerm)}`;
            console.log("BUSCAR URL", url);

            const res = await api.get(url);
            console.log("BUSCAR RESPONSE", res.data);

            if (res.data && res.data.length > 0) {
                setCandidates(res.data);
            } else {
                setCandidates([]);
            }
        } catch (err) {
            console.error("Error en búsqueda:", err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Sesión expirada. Por favor inicie sesión nuevamente.");
                } else if (err.response.status === 404) {
                    setError("Servicio no disponible.");
                } else {
                    setError("Ocurrió un error al buscar estudiantes.");
                }
            } else {
                setError("Error de conexión con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        setLoading(true);
        setError(null);
        setHistory([]);

        const code = student.codigo_estudiante || student.codigo; // Adaptar según respuesta back

        try {
            const historyUrl = `/verificador/estudiantes/${code}/historial`;
            console.log("HISTORIAL URL", historyUrl);

            const res = await api.get(historyUrl);
            console.log("HISTORIAL RESPONSE", res.data);

            setHistory(res.data);

        } catch (err) {
            console.error("Error cargando historial:", err);
            setError("No se pudo cargar el historial del estudiante.");
        } finally {
            setLoading(false);
        }
    };

    const getBadgeClass = (status) => {
        if (!status) return '';
        const s = status.toLowerCase();
        if (s === 'asistió' || s === 'realizada') return styles.badgeAsistio;
        if (s === 'faltó' || s === 'cancelada') return styles.badgeFalto;
        return styles.badgeProgramada;
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
                        disabled={loading && hasSearched} // Allow typing if just loading history
                    />
                    <button type="submit" className={styles.searchButton} disabled={loading && !selectedStudent}>
                        {loading ? 'Cargando...' : 'Buscar estudiante'}
                    </button>
                </form>
            </div>

            {error && (
                <div style={{ padding: '1rem', color: '#721c24', backgroundColor: '#f8d7da', marginBottom: '1rem', borderRadius: '5px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {/* SELECTION LIST: if we have candidates but no final selection yet */}
            {candidates.length > 0 && !selectedStudent && (
                <div className={styles.resultsList}>
                    <h3 className={styles.sectionTitle}>Resultados de búsqueda ({candidates.length})</h3>
                    <ul className={styles.candidateList} style={{ listStyle: 'none', padding: 0 }}>
                        {candidates.map((stu, i) => (
                            <li key={i} className={styles.candidateItem} style={{
                                padding: '1rem',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#fff'
                            }} onClick={() => handleSelectStudent(stu)}>
                                <div>
                                    <strong>{stu.codigo_estudiante}</strong> - {stu.nombre_estudiante} {stu.apellido_estudiante}
                                </div>
                                <button className={styles.selectButton} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                                    Ver Historial
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* EMPTY STATE for search */}
            {hasSearched && candidates.length === 0 && !loading && !error && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <p className={styles.emptyText}>
                        No se encontró ningún estudiante con ese criterio.
                    </p>
                </div>
            )}

            {/* STUDENT DETAILS & HISTORY */}
            {selectedStudent && (
                <div className={styles.resultsContainer}>
                    <div className={styles.backButton} onClick={() => setSelectedStudent(null)} style={{ cursor: 'pointer', marginBottom: '1rem', color: '#0056b3' }}>
                        &larr; Volver a resultados
                    </div>

                    {/* Student Info Card */}
                    <div className={styles.studentCard}>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Estudiante</span>
                            <span className={styles.infoValue}>
                                {selectedStudent.nombre_estudiante} {selectedStudent.apellido_estudiante}
                            </span>
                        </div>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Código</span>
                            <span className={styles.infoValue}>
                                {selectedStudent.codigo_estudiante}
                            </span>
                        </div>
                        <div className={styles.studentInfoGroup}>
                            <span className={styles.infoLabel}>Escuela Profesional</span>
                            <span className={styles.infoValue}>Sin Asignar</span>
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
                                    {loading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando historial...</td></tr>
                                    ) : history.length > 0 ? (
                                        history.map((item, index) => (
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
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem' }}>
                                                El estudiante no tiene historial de tutorías registrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {!hasSearched && !loading && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <p className={styles.emptyText}>
                        Realiza una búsqueda para ver la información del estudiante.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VerifSeguimientoEstudiante;
