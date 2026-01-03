import React, { useState, useEffect } from 'react';
import styles from '../../styles/pages/VerifConsultaTutorias.module.css';
import api from '../../utils/api';
import { printElementById } from '../../utils/print';
// REUSE: Importamos el modal existente de Admin
import DetalleTutoriaModal from '../../componentes/DetalleTutoriaModal';

const VerifConsultaTutorias = () => {
    // Filtros: Semestre + Tipo (No Tutor)
    const [filters, setFilters] = useState({
        semestre: '',
        tipo: 'Todos'
    });

    const [semestresList, setSemestresList] = useState([]);
    const [tiposList, setTiposList] = useState([]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal state
    const [selectedTutoria, setSelectedTutoria] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    // const [modalLoading, setModalLoading] = useState(false); // Modal shows immediate if data ready, but we fetch before open

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const res = await api.get('/verificador/filtros/consulta-tutorias');
                if (res.data) {
                    setSemestresList(res.data.semestres || []);
                    setTiposList(res.data.tipos || []);
                    if (res.data.semestres && res.data.semestres.length > 0) {
                        setFilters(prev => ({ ...prev, semestre: res.data.semestres[0] }));
                    }
                }
            } catch (err) {
                console.error("Error al cargar filtros:", err);
            }
        };
        fetchFiltros();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setData([]);

        try {
            const params = {};
            if (filters.semestre && filters.semestre !== 'Todos') params.semestre = filters.semestre;
            if (filters.tipo && filters.tipo !== 'Todos') params.tipo = filters.tipo;

            console.log("GET /verificador/tutorias Params:", params);
            const response = await api.get('/verificador/tutorias', { params });
            console.log("Respuesta backend:", response.data);

            if (Array.isArray(response.data)) {
                setData(response.data);
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
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const handlePrint = () => {
        // Imprime solo la tabla (contenedor principal)
        printElementById('print-area-consulta-tutorias', 'Consulta de Tutorías');
    };

    // LOGIC: Ver Detalles
    const handleVerDetalles = async (cronogramaId) => {
        console.log("Intentando ver detalles para CronogramaID:", cronogramaId);

        if (!cronogramaId) {
            alert("Error: No se encontró ID de cronograma.");
            return;
        }

        try {
            // Usamos Query Param ?cronogramaId=
            const url = `/verificador/tutorias/detalle`;
            console.log(`Fetching ${url}?cronogramaId=${cronogramaId}`);

            const res = await api.get(url, { params: { cronogramaId } });
            console.log("Detalle Response:", res.data);

            // La data del backend YA VIENE con la estructura exacta que espera DetalleTutoriaModal
            // (verificado en verificadorController.js getTutoriaDetalle)
            setSelectedTutoria(res.data);
            setModalOpen(true);

        } catch (err) {
            console.error("Error cargando detalles:", err);
            const msg = err.response?.data?.message || "No se pudieron cargar los detalles.";
            alert(`Error: ${msg}`);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTutoria(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Consulta de Tutorías</h1>
                    <p className={styles.subtitle}>Consulta general de actividades de tutoría</p>
                </div>
                <div className={styles.actions}>
                    {/* Imprimir OK. Exportar ELIMINADO. */}
                    <button className={styles.actionButton} onClick={handlePrint} disabled={loading}>
                        Imprimir
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
                            <option value="Todos">Todos</option>
                            {semestresList.map((sem, idx) => (
                                <option key={idx} value={sem}>{sem}</option>
                            ))}
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
                            {tiposList.map((t, idx) => (
                                <option key={idx} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Tutor ELIMINADO */}

                    <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                        {loading ? 'Consultando...' : 'Consultar'}
                    </button>
                </div>
            </div>

            <div id="print-area-consulta-tutorias" className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Tutor</th>
                                <th>Fecha</th>
                                <th>Acciones</th> {/* Reemplaza Estado */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.estudiante}</td>
                                        <td>{item.tutor}</td>
                                        <td>{item.fecha}</td>
                                        <td>
                                            <button
                                                className={styles.detailButton}
                                                style={{
                                                    background: 'none', border: 'none', color: '#0056b3',
                                                    cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold'
                                                }}
                                                // CRITICAL: enviamos cronograma_id
                                                onClick={() => handleVerDetalles(item.cronograma_id)}
                                            >
                                                Ver detalles →
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No se encontraron registros
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Reusado */}
            {modalOpen && selectedTutoria && (
                <DetalleTutoriaModal
                    tutoria={selectedTutoria}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default VerifConsultaTutorias;
