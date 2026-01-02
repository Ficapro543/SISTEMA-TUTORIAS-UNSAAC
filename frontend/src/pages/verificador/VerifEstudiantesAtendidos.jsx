import React, { useState } from 'react';
import styles from '../../styles/pages/VerifEstudiantesAtendidos.module.css';

const VerifEstudiantesAtendidos = () => {
    // Mock Data
    const mockData = [
        {
            codigo: '160001',
            nombre: 'Juan Pérez Muñoz',
            fechaAtencion: '2023-11-15',
            tutor: 'Dr. Roberto Carlos',
            estado: 'Atendido'
        },
        {
            codigo: '160002',
            nombre: 'Maria Rodriguez',
            fechaAtencion: '-',
            tutor: 'Dra. Ana Lopez',
            estado: 'Pendiente'
        },
        {
            codigo: '160003',
            nombre: 'Carlos Sanchez',
            fechaAtencion: '2023-11-10',
            tutor: 'Ing. Pedro Castillo',
            estado: 'Atendido'
        },
        {
            codigo: '160004',
            nombre: 'Elena Quispe',
            fechaAtencion: '-',
            tutor: 'Dr. Roberto Carlos',
            estado: 'Pendiente'
        },
        {
            codigo: '160005',
            nombre: 'Jorge Mamani',
            fechaAtencion: '2023-11-20',
            tutor: 'Dra. Ana Lopez',
            estado: 'Atendido'
        }
    ];

    const [filters, setFilters] = useState({
        semestre: '2023-II',
        estado: 'Todos'
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
        if (filters.estado !== 'Todos') {
            data = data.filter(item => item.estado === filters.estado);
        }
        // Here you would also filter by Semester if the mock data had that field
        setFilteredData(data);
    };

    const handleExport = () => {
        console.log("Exportando data...", filteredData);
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
                    <button className={styles.actionButton} onClick={handleExport}>
                        Exportar
                    </button>
                    <button className={styles.actionButton} onClick={handlePrint}>
                        Imprimir
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
                        <label className={styles.label} htmlFor="estado">Estado</label>
                        <select
                            id="estado"
                            name="estado"
                            className={styles.select}
                            value={filters.estado}
                            onChange={handleFilterChange}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Atendido">Atendido</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </div>

                    <button className={styles.searchButton} onClick={handleSearch}>
                        Buscar
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
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
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

export default VerifEstudiantesAtendidos;
