import React, { useState, useEffect } from 'react';
import styles from '@/styles/pages/verificador/VerifEstudiantesAtendidos.module.css';
import api from '@/utils/api';
import { printElementById } from '@/utils/print';

const VerifEstudiantesAtendidos = () => {
    // 1) Filtro: FECHA (obligatoria) + Estado (opcional)
    const [filters, setFilters] = useState({
        fecha: '',
        estado: 'Todos'
    });

    const [availableEstados, setAvailableEstados] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estados disponibles al inicio
    useEffect(() => {
        const fetchEstados = async () => {
            try {
                const res = await api.get('/verificador/filtros/estudiantes-atendidos');
                if (res.data && Array.isArray(res.data.estados)) {
                    setAvailableEstados(res.data.estados);
                }
            } catch (err) {
                console.error("Error cargando filtros de estado:", err);
            }
        };
        fetchEstados();
    }, []);

    const normalizeEstado = (estadoRaw) => {
        if (!estadoRaw) return '-';
        return estadoRaw.charAt(0).toUpperCase() + estadoRaw.slice(1).toLowerCase();
    };

    const normalizeData = (backendData) => {
        return backendData.map(item => ({
            codigo: item.codigo,
            nombre: item.estudiante,
            fechaAtencion: item.fecha_atencion,
            tutor: item.tutor,
            estado: normalizeEstado(item.estado)
        }));
    };

    const fetchData = async () => {
        // Validación: Fecha obligatoria
        if (!filters.fecha) {
            setError("Por favor seleccione una fecha.");
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);
        setData([]);

        try {
            // Logic: Fecha mandatory. Estado optional (if Todos => undefined)
            const params = {
                fecha: filters.fecha
            };
            if (filters.estado && filters.estado !== 'Todos') {
                params.estado = filters.estado;
            }

            console.log("GET /verificador/estudiantes Params:", params);
            const response = await api.get('/verificador/estudiantes', { params });
            console.log("Respuesta backend:", response.data);

            if (Array.isArray(response.data)) {
                if (response.data.length === 0) {
                    setError("No se encontraron registros para la fecha seleccionada.");
                }
                setData(normalizeData(response.data));
            } else {
                setData([]);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error al consultar datos. Revise su conexión o intente nuevamente.");
            setData([]);
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
        // Limpiar error al cambiar fecha para mejor UX
        if (name === 'fecha') setError(null);
    };

    const handleSearch = () => {
        fetchData();
    };

    const handlePrint = () => {
        printElementById('print-area-verif-estudiantes', 'Listado de Estudiantes Atendidos');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Revisión de Sesiones de Tutoría</h1>
                    <p className={styles.subtitle}>Listado de estudiantes atendidos por fecha y estado</p>
                </div>
                <div className={styles.actions}>
                    {/* Solo Imprimir - Exportar eliminado */}
                    <button className={styles.actionButton} onClick={handlePrint} disabled={loading}>
                        Imprimir
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem',
                    borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fecaca'
                }}>
                    <strong>{error.includes("Error") ? "Error:" : "Aviso:"}</strong> {error}
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.filters}>
                    {/* Filtro Fecha Única */}
                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="fecha">Fecha</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            className={styles.inputDate}
                            // Inline styles basicos si la clase no existe, para asegurar UX
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                height: '38px'
                            }}
                            value={filters.fecha}
                            onChange={handleFilterChange}
                            disabled={loading}
                        />
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
                            {availableEstados.map((st, idx) => (
                                <option key={idx} value={st}>{st}</option>
                            ))}
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

            {/* Area de Impresión */}
            <div id="print-area-verif-estudiantes" className={styles.tableContainer}>
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
                                            <span className={`${styles.badge} ${styles.badgeNormal}`}>
                                                {item.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                        {filters.fecha ? "No se encontraron registros." : "Seleccione una fecha y presione 'Buscar'"}
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
