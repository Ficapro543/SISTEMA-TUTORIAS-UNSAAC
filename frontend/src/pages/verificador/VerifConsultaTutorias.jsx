import React, { useState } from 'react';
import styles from '../../styles/pages/VerifConsultaTutorias.module.css';

const VerifConsultaTutorias = () => {
    // Mock Data
    const mockData = [
        {
            estudiante: 'Juan Pérez Muñoz',
            tutor: 'Dr. Roberto Carlos',
            tipo: 'Académica',
            fecha: '2023-11-15',
            estado: 'Realizada'
        },
        {
            estudiante: 'Maria Rodriguez',
            tutor: 'Dra. Ana Lopez',
            tipo: 'Personal',
            fecha: '2023-11-20',
            estado: 'Programada'
        },
        {
            estudiante: 'Carlos Sanchez',
            tutor: 'Ing. Pedro Castillo',
            tipo: 'Profesional',
            fecha: '2023-11-10',
            estado: 'Realizada'
        },
        {
            estudiante: 'Elena Quispe',
            tutor: 'Dr. Roberto Carlos',
            tipo: 'Académica',
            fecha: '2023-11-05',
            estado: 'Cancelada'
        },
        {
            estudiante: 'Jorge Mamani',
            tutor: 'Dra. Ana Lopez',
            tipo: 'Personal',
            fecha: '2023-11-25',
            estado: 'Programada'
        }
    ];

    const [filters, setFilters] = useState({
        semestre: '2023-II',
        tipo: 'Todos',
        tutor: 'Todos'
    });

    const [filteredData, setFilteredData] = useState(mockData);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        let data = [...mockData];

        if (filters.tipo !== 'Todos') {
            data = data.filter(item => item.tipo === filters.tipo);
        }

        if (filters.tutor !== 'Todos') {
            data = data.filter(item => item.tutor === filters.tutor);
        }

        // Mock filtering by semester could be added here if data had semester field

        setFilteredData(data);
    };

    const handleExport = () => {
        console.log("Exportando data...", filteredData);
        alert("Función de exportar en desarrollo");
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
                    <button className={styles.actionButton} onClick={handleExport}>
                        Exportar
                    </button>
                </div>
            </div>

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
                        >
                            <option value="2023-II">2023-II</option>
                            <option value="2023-I">2023-I</option>
                            <option value="2022-II">2022-II</option>
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
                        >
                            <option value="Todos">Todos</option>
                            <option value="Académica">Académica</option>
                            <option value="Personal">Personal</option>
                            <option value="Profesional">Profesional</option>
                        </select>
                    </div>

                    <div className={styles.selectGroup}>
                        <label className={styles.label} htmlFor="tutor">Tutor</label>
                        <select
                            id="tutor"
                            name="tutor"
                            className={styles.select}
                            value={filters.tutor}
                            onChange={handleFilterChange}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Dr. Roberto Carlos">Dr. Roberto Carlos</option>
                            <option value="Dra. Ana Lopez">Dra. Ana Lopez</option>
                            <option value="Ing. Pedro Castillo">Ing. Pedro Castillo</option>
                        </select>
                    </div>

                    <button className={styles.searchButton} onClick={handleSearch}>
                        Consultar
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
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
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
