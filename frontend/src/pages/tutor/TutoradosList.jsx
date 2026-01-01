import React, { useEffect, useState } from 'react';
import { getMisTutorados } from '../../services/tutorService';
import { getActiveSemester } from '../../services/assignmentService';
import styles from '../../styles/pages/TutorInterface.module.css';

const TutoradosList = () => {
    const [tutorados, setTutorados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTutorados = async () => {
            try {
                const semesterInfo = await getActiveSemester();
                const data = await getMisTutorados(semesterInfo.name);
                setTutorados(data);
            } catch (err) {
                console.error('Error fetching tutorados:', err);
                setError('No se pudieron cargar los tutorados.');
            } finally {
                setLoading(false);
            }
        };

        fetchTutorados();
    }, []);

    if (loading) return <div className={styles.emptyState}>Cargando tutorados...</div>;
    if (error) return <div className={styles.emptyState}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Mis Estudiantes Tutorados</h2>
            </div>

            <div className={styles.tableContainer}>
                {tutorados.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tutorados.map((est) => (
                                <tr key={est.id}>
                                    <td>{est.code}</td>
                                    <td>{est.first_name}</td>
                                    <td>{est.last_name}</td>
                                    <td>
                                        <button className={styles.actionBtn}>Ver Ficha</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>No tienes estudiantes asignados para este semestre.</div>
                )}
            </div>
        </div>
    );
};

export default TutoradosList;
