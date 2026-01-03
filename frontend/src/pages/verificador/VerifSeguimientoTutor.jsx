import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/verificador/VerifSeguimientoTutor.module.css';
import api from '@/utils/api';

const VerifSeguimientoTutor = () => {
    // Estado para filtros
    const [filters, setFilters] = useState({
        semestre: '2023-II',
        tutor: '' // Será el ID del tutor
    });

    // Estados de datos
    const [tutorsList, setTutorsList] = useState([]);
    const [kpiData, setKpiData] = useState({
        total: 0,
        realizadas: 0,
        pendientes: 0
    });
    const [detailData, setDetailData] = useState([]);

    // Estados de UI
    const [loading, setLoading] = useState(false); // Carga de datos de seguimiento
    const [tutorsLoading, setTutorsLoading] = useState(false); // Carga de lista de tutores
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // 1. Cargar lista de tutores al montar
    useEffect(() => {
        const fetchTutors = async () => {
            setTutorsLoading(true);
            try {
                const res = await api.get('/verificador/tutores');
                setTutorsList(res.data || []);
            } catch (err) {
                console.error("Error cargando tutores:", err);
                setError("No se pudo cargar la lista de tutores.");
            } finally {
                setTutorsLoading(false);
            }
        };
        fetchTutors();
    }, []);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearch = async () => {
        if (!filters.tutor) {
            alert('Por favor seleccione un tutor.');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);
        setKpiData({ total: 0, realizadas: 0, pendientes: 0 });
        setDetailData([]);

        try {
            console.log("Consultando seguimiento tutor:", filters.tutor, filters.semestre);
            const res = await api.get(`/verificador/tutores/${filters.tutor}/seguimiento`, {
                params: { semestre: filters.semestre }
            });

            console.log("Data seguimiento:", res.data);

            if (res.data) {
                if (res.data.kpi) {
                    setKpiData({
                        total: res.data.kpi.total || 0,
                        realizadas: res.data.kpi.realizadas || 0,
                        pendientes: res.data.kpi.pendientes || 0
                    });
                }

                if (Array.isArray(res.data.detalle)) {
                    // Mapeo si es necesario, aunque backend ya manda estructura limpia
                    setDetailData(res.data.detalle);
                }
            }
        } catch (err) {
            console.error("Error cargando seguimiento:", err);
            setError("Ocurrió un error al cargar el seguimiento del tutor.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return '';
        const s = status.toLowerCase();
        if (s === 'realizada') return styles.statusRealizada;
        if (s === 'programada') return styles.statusProgramada;
        if (s === 'cancelada') return styles.statusCancelada;
        return '';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Seguimiento por Tutor</h1>
                <p className={styles.subtitle}>Supervisa el desempeño y cumplimiento de las tutorías por docente</p>
            </div>

            {error && (
                <div style={{ padding: '1rem', color: '#721c24', backgroundColor: '#f8d7da', marginBottom: '1rem', borderRadius: '5px' }}>
                    {error}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="semestre" className={styles.label}>Semestre</label>
                        <select
                            id="semestre"
                            name="semestre"
                            value={filters.semestre}
                            onChange={handleChange}
                            className={styles.select}
                            disabled={loading}
                        >
                            <option value="2023-II">2023-II</option>
                            <option value="2023-I">2023-I</option>
                            <option value="2025-1">2025-1</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="tutor" className={styles.label}>Tutor</label>
                        <select
                            id="tutor"
                            name="tutor"
                            value={filters.tutor}
                            onChange={handleChange}
                            className={styles.select}
                            disabled={loading || tutorsLoading}
                        >
                            <option value="">-- Seleccione Tutor --</option>
                            {tutorsLoading ? (
                                <option>Cargando tutores...</option>
                            ) : (
                                tutorsList.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <button className={styles.searchButton} onClick={handleSearch} disabled={loading || !filters.tutor}>
                        {loading ? 'Cargando...' : 'Ver Seguimiento'}
                    </button>
                </div>
            </div>

            {hasSearched && (
                <>
                    {/* KPI Cards */}
                    <div className={styles.kpiContainer}>
                        <div className={styles.kpiCard}>
                            <h3 className={styles.kpiTitle}>Total Tutorías</h3>
                            <p className={styles.kpiValue}>{kpiData.total}</p>
                        </div>
                        <div className={styles.kpiCard}>
                            <h3 className={styles.kpiTitle}>Realizadas</h3>
                            <p className={`${styles.kpiValue} ${styles.textSuccess}`}>{kpiData.realizadas}</p>
                        </div>
                        <div className={styles.kpiCard}>
                            <h3 className={styles.kpiTitle}>Pendientes</h3>
                            <p className={`${styles.kpiValue} ${styles.textWarning}`}>{kpiData.pendientes}</p>
                        </div>
                    </div>

                    {/* Detail Table */}
                    <div className={styles.tableSection}>
                        <h3 className={styles.tableTitle}>Detalle de Sesiones</h3>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Cargando detalle...</td></tr>
                                    ) : detailData.length > 0 ? (
                                        detailData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.estudiante}</td>
                                                <td>{item.fecha}</td>
                                                <td>{item.tipo}</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${getStatusClass(item.estado)}`}>
                                                        {item.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                                No hay registros para este tutor en el semestre seleccionado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!hasSearched && (
                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#666' }}>
                    Seleccione un tutor y haga clic en "Ver Seguimiento" para consultar.
                </div>
            )}
        </div>
    );
};

export default VerifSeguimientoTutor;
