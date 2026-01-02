import React, { useState } from 'react';
import styles from '../../styles/pages/VerifSeguimientoTutor.module.css';

const VerifSeguimientoTutor = () => {
    const [filters, setFilters] = useState({
        tutor: '',
        semestre: ''
    });

    const [showResults, setShowResults] = useState(false);

    // Mock KPI Data
    const kpiData = {
        total: 24,
        realizadas: 18,
        pendientes: 6
    };

    // Mock Table Data
    const mockTutorData = [
        {
            estudiante: 'Juan Pérez Muñoz',
            fecha: '2023-11-15',
            tipo: 'Académica',
            estado: 'Realizada'
        },
        {
            estudiante: 'Maria Rodriguez',
            fecha: '2023-11-20',
            tipo: 'Personal',
            estado: 'Pendiente'
        },
        {
            estudiante: 'Carlos Sanchez',
            fecha: '2023-11-10',
            tipo: 'Profesional',
            estado: 'Realizada'
        },
        {
            estudiante: 'Elena Quispe',
            fecha: '2023-11-25',
            tipo: 'Académica',
            estado: 'Pendiente'
        },
        {
            estudiante: 'Jorge Mamani',
            fecha: '2023-11-05',
            tipo: 'Académica',
            estado: 'Cancelada'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        if (filters.tutor && filters.semestre) {
            setShowResults(true);
        } else {
            alert("Por favor seleccione un tutor y un semestre");
        }
    };

    const getBadgeClass = (status) => {
        switch (status) {
            case 'Realizada': return styles.badgeRealizada;
            case 'Pendiente': return styles.badgePendiente;
            case 'Cancelada': return styles.badgeCancelada;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Seguimiento por Tutor</h1>
                <p className={styles.subtitle}>Evalúa el desempeño y carga tutorial de cada tutor por semestre</p>
            </div>

            <div className={styles.controls}>
                <div className={styles.filters}>
                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="tutor">Tutor Responsable</label>
                        <select
                            id="tutor"
                            name="tutor"
                            className={styles.select}
                            value={filters.tutor}
                            onChange={handleInputChange}
                        >
                            <option value="">Seleccione un tutor...</option>
                            <option value="dr_roberto">Dr. Roberto Carlos</option>
                            <option value="dra_ana">Dra. Ana Lopez</option>
                            <option value="ing_pedro">Ing. Pedro Castillo</option>
                        </select>
                    </div>

                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="semestre">Semestre</label>
                        <select
                            id="semestre"
                            name="semestre"
                            className={styles.select}
                            value={filters.semestre}
                            onChange={handleInputChange}
                        >
                            <option value="">Seleccione...</option>
                            <option value="2023-II">2023-II</option>
                            <option value="2023-I">2023-I</option>
                            <option value="2022-II">2022-II</option>
                        </select>
                    </div>

                    <button className={styles.searchButton} onClick={handleSearch}>
                        Ver seguimiento
                    </button>
                </div>
            </div>

            {showResults ? (
                <>
                    {/* KPI Cards */}
                    <div className={styles.kpiGrid}>
                        <div className={`${styles.kpiCard} ${styles.kpiTotal}`}>
                            <span className={styles.kpiLabel}>Total Tutorías</span>
                            <span className={styles.kpiValue}>{kpiData.total}</span>
                        </div>
                        <div className={`${styles.kpiCard} ${styles.kpiRealizadas}`}>
                            <span className={styles.kpiLabel}>Realizadas</span>
                            <span className={styles.kpiValue}>{kpiData.realizadas}</span>
                        </div>
                        <div className={`${styles.kpiCard} ${styles.kpiPendientes}`}>
                            <span className={styles.kpiLabel}>Pendientes</span>
                            <span className={styles.kpiValue}>{kpiData.pendientes}</span>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className={styles.tableContainer}>
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
                                    {mockTutorData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.estudiante}</td>
                                            <td>{item.fecha}</td>
                                            <td>{item.tipo}</td>
                                            <td>
                                                <span className={`${styles.badge} ${getBadgeClass(item.estado)}`}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📊</span>
                    <h3 className={styles.emptyText}>Esperando selección</h3>
                    <p className={styles.emptySubtext}>
                        Seleccione un tutor y un semestre en los filtros superiores para visualizar
                        las estadísticas de desempeño y el detalle de sesiones.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VerifSeguimientoTutor;
