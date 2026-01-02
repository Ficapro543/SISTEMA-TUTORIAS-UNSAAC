import React, { useState } from 'react';
import styles from '../../styles/pages/VerifEstudiantesAtendidos.module.css';
import api from '../../utils/api';

const VerifEstudiantesAtendidos = () => {
    // Inicializar filtros
    const [filters, setFilters] = useState({
        semestre: '2023-II',
        estado: 'Todos'
    });

    // 1) Inicializa filas como [] (vacío) - Solicitud explícita para verificar backend
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Normalizar estado para visualización consistente
    const normalizeEstado = (estadoRaw) => {
        if (!estadoRaw) return '-';
        const lower = String(estadoRaw).toLowerCase();
        if (lower === 'realizada' || lower === 'atendido') return 'Atendido';
        if (lower === 'programada' || lower === 'pendiente') return 'Pendiente';
        return estadoRaw;
    };

    // Mapping de datos del backend a la estructura de la tabla
    const normalizeData = (backendData) => {
        return backendData.map(item => ({
            codigo: item.codigo || item.codigo_estudiante || '-',
            nombre: item.nombre || item.estudiante || item.nombre_estudiante || '-',
            fechaAtencion: item.fecha_atencion || item.fecha || '-',
            tutor: item.tutor || item.tutor_responsable || '-',
            estado: normalizeEstado(item.estado)
        }));
    };

    const fetchData = async () => {
        // 1) Log solicitado antes de llamar API
        console.log("CLICK Buscar / FetchData ejecutado");

        setLoading(true);
        setError(null);
        // No limpiamos data aquí para evitar parpadeo feo, o si prefieres limpiar: setData([]); 

        try {
            // FIX HU-VER-01: Backend espera opcional para todos
            const params = {
                semestre: filters.semestre
            };

            // Solo agregar estado si NO es "Todos"
            if (filters.estado && filters.estado !== 'Todos') {
                params.estado = filters.estado;
            }

            const url = '/verificador/estudiantes';
            console.log("GET verificador/estudiantes URL:", url, "Params:", params);

            const response = await api.get(url, { params });

            // 1) Log solicitado después de respuesta
            console.log("RESPUESTA API:", response.data);

            if (Array.isArray(response.data)) {
                // 2) Asegura que SOLO se llenen filas luego del fetchData
                const normalized = normalizeData(response.data);
                setData(normalized);
            } else {
                console.warn("La respuesta del backend no es un array:", response.data);
                setData([]);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError("No autorizado. Por favor inicie sesión como Verificador.");
                } else {
                    setError(`Error del servidor: ${err.response.status} - ${err.response.data?.message || err.message}`);
                }
            } else if (err.request) {
                setError("No se pudo conectar con el servidor.");
            } else {
                setError("Error desconocido al realizar la petición.");
            }
            setData([]); // Limpiar tabla en caso de error
        } finally {
            setLoading(false);
        }
    };

    // 3) Desactiva temporalmente el auto-fetch al montar
    // useEffect(() => {
    //     fetchData();
    // }, []); 

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
        console.log("Exportando data...", data);
        alert("Función de exportar aún no implementada");
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Revisión de Sesiones de Tutoría</h1>
                    <p className={styles.subtitle}>Control de estudiantes atendidos y pendientes por semestre</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionButton} onClick={handleExport} disabled={loading}>
                        Exportar
                    </button>
                    <button className={styles.actionButton} onClick={handlePrint} disabled={loading}>
                        Imprimir
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #fecaca'
                }}>
                    <strong>Error:</strong> {error}
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
                        <label className={styles.label} htmlFor="estado">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            className={styles.select}
                            value={filters.estado}
                            onChange={handleFilterChange}
                            disabled={loading}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Atendido">Atendido</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </div>

                    <button
                        className={styles.searchButton}
                        onClick={handleSearch}
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Cargando...' : 'Buscar'}
                    </button>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre del Estudiante</th>
                                <th>Fecha de Atención</th>
                                <th>Tutor Responsable</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.codigo}</td>
                                        <td>{item.nombre}</td>
                                        <td>{item.fechaAtencion}</td>
                                        <td>{item.tutor}</td>
                                        <td>
                                            <span
                                                className={`
                                                    ${styles.badge} 
                                                    ${item.estado === 'Atendido' ? styles.badgeAtendido : styles.badgePendiente}
                                                `}
                                            >
                                                {item.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray)' }}>
                                        {!error && (data.length === 0 ? "Presione 'Buscar' para ver los registros" : "No hay registros para los filtros seleccionados")}
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

export default VerifEstudiantesAtendidos;
