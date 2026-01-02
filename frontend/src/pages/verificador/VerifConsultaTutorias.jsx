import React, { useState, useEffect } from 'react';
import styles from '../../styles/pages/VerifConsultaTutorias.module.css';
import api from '../../utils/api';

const VerifConsultaTutorias = () => {
    const [filters, setFilters] = useState({
        semestre: '2023-II',
        tipo: 'Todos',
        tutor_id: 'Todos' // Usamos ID para el filtro
    });

    const [tutorsList, setTutorsList] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar lista de tutores al inicio
    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const res = await api.get('/verificador/tutores');
                setTutorsList(res.data || []);
            } catch (err) {
                console.error("Error al cargar tutores:", err);
            }
        };
        fetchTutors();
    }, []);

    // Normalizar estado
    const normalizeEstado = (estadoRaw) => {
        if (!estadoRaw) return '-';
        const lower = String(estadoRaw).toLowerCase();
        if (lower === 'realizada') return 'Realizada';
        if (lower === 'programada') return 'Programada';
        if (lower === 'cancelada') return 'Cancelada';
        return estadoRaw; // "Asistió", "Faltó", etc.
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setData([]);

        try {
            const params = {
                semestre: filters.semestre
            };

            if (filters.tipo !== 'Todos') {
                params.tipo = filters.tipo;
            }
            if (filters.tutor_id !== 'Todos') {
                params.tutor_id = filters.tutor_id;
            }

            console.log("GET /verificador/tutorias Params:", params);
            const response = await api.get('/verificador/tutorias', { params });
            console.log("Respuesta backend:", response.data);

            if (Array.isArray(response.data)) {
                setData(response.data.map(item => ({
                    ...item,
                    estado: normalizeEstado(item.estado)
                })));
            } else {
                setData([]);
            }

        } catch (err) {
            console.error("Error fetching tutorias:", err);
            setError("Error al consultar las tutorías.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const handleExport = () => {
        alert("Función de exportar aún no implementada");
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Realizada': return styles.statusRealizada;
            case 'Programada': return styles.statusProgramada;
            case 'Cancelada': return styles.statusCancelada;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Consulta de Tutorías</h1>
                    <p className={styles.subtitle}>Consulta por semestre, tipo y tutor</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionButton} onClick={handleExport} disabled={loading}>
                        Exportar
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', color: '#721c24', backgroundColor: '#f8d7da', marginBottom: '1rem', borderRadius: '5px' }}>
                    {error}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.filters}>
                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="semestre">Semestre</label>
                        <select
                            id="semestre"
                            name="semestre"
                            className={styles.select}
                            value={filters.semestre}
                            onChange={handleFilterChange}
                            disabled={loading}
                        >
                            <option value="2023-II">2023-II</option>
                            <option value="2023-I">2023-I</option>
                            <option value="2022-II">2022-II</option>
                            <option value="2025-1">2025-1</option>
                        </select>
                    </div>

                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="tipo">Tipo</label>
                        <select
                            id="tipo"
                            name="tipo"
                            className={styles.select}
                            value={filters.tipo}
                            onChange={handleFilterChange}
                            disabled={loading}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Académica">Académica</option>
                            <option value="Personal">Personal</option>
                            <option value="Profesional">Profesional</option>
                        </select>
                    </div>

                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="tutor_id">Tutor</label>
                        <select
                            id="tutor_id"
                            name="tutor_id"
                            className={styles.select}
                            value={filters.tutor_id}
                            onChange={handleFilterChange}
                            disabled={loading}
                        >
                            <option value="Todos">Todos</option>
                            {tutorsList.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                        {loading ? 'Consultando...' : 'Consultar'}
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Tutor</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.estudiante}</td>
                                        <td>{item.tutor}</td>
                                        <td>{item.tipo}</td>
                                        <td>{item.fecha}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusClass(item.estado)}`}>
                                                {item.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No se encontraron registros
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VerifConsultaTutorias;
