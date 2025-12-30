import React, { useEffect, useState } from 'react';
import { getActividades } from '../services/tutorService';
import { getActiveSemester } from '../services/assignmentService';
import styles from '../styles/pages/TutorInterface.module.css';

const ActividadesList = () => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActividades = async () => {
            try {
                const semesterInfo = await getActiveSemester();
                const data = await getActividades(semesterInfo.name);
                setActividades(data);
            } catch (err) {
                console.error('Error fetching actividades:', err);
                setError('No se pudieron cargar las actividades.');
            } finally {
                setLoading(false);
            }
        };

        fetchActividades();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'realizada': return { color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' };
            case 'programada': return { color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' };
            case 'cancelada': return { color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' };
            default: return {};
        }
    };

    if (loading) return <div className={styles.emptyState}>Cargando actividades...</div>;
    if (error) return <div className={styles.emptyState}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Mis Actividades y Cronogramas</h2>
            </div>

            <div className={styles.tableContainer}>
                {actividades.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Estudiante</th>
                                <th>Ambiente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actividades.map((act) => (
                                <tr key={act.id}>
                                    <td>{act.fecha}</td>
                                    <td>{act.hora}</td>
                                    <td>{act.nombre_estudiante} {act.apellido_estudiante}</td>
                                    <td>{act.ambiente}</td>
                                    <td>
                                        <span style={getStatusStyle(act.estado)}>{act.estado}</span>
                                    </td>
                                    <td>
                                        {act.estado === 'programada' && (
                                            <button className={styles.actionBtn}>Registrar Reporte</button>
                                        )}
                                        {act.estado === 'realizada' && (
                                            <button className={styles.actionBtn}>Ver PDF</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>No tienes actividades registradas.</div>
                )}
            </div>
        </div>
    );
};

export default ActividadesList;
