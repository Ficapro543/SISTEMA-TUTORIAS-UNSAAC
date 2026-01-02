import React, { useEffect, useState } from 'react';
import { FaEdit, FaPrint, FaPlus } from 'react-icons/fa';
import { getCronogramas } from '../../services/tutorService';
import { getActiveSemester } from '../../services/assignmentService';
import RegistrarTutoriaModal from '../../componentes/RegistrarTutoriaModal';
import styles from '../../styles/pages/TutorPanel.module.css';

const TutorPanel = () => {
    const [cronogramas, setCronogramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCronograma, setSelectedCronograma] = useState(null);
    const [modalMode, setModalMode] = useState('register'); // 'register' | 'edit'

    useEffect(() => {
        // Get user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchCronogramas = async () => {
            try {
                const semesterInfo = await getActiveSemester();
                const data = await getCronogramas(semesterInfo.name);
                setCronogramas(data);
            } catch (err) {
                console.error('Error fetching cronogramas:', err);
                setError('No se pudieron cargar las tutorías programadas.');
            } finally {
                setLoading(false);
            }
        };

        fetchCronogramas();
    }, []);

    // Format date as DD/MM/YY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    // Format time range (hora + 15 minutes)
    const formatTimeRange = (horaString) => {
        if (!horaString) return '';

        // Parse time (format: "10:00:00")
        const [hours, minutes] = horaString.split(':').map(Number);

        // Calculate end time (add 15 minutes)
        let endHours = hours;
        let endMinutes = minutes + 15;
        if (endMinutes >= 60) {
            endHours += 1;
            endMinutes -= 60;
        }

        // Format times
        const formatTime = (h, m) => {
            const period = h >= 12 ? 'p. m.' : 'a. m.';
            const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
        };

        return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;
    };

    const handleRegistrar = (cronograma) => {
        setSelectedCronograma(cronograma);
        setModalMode('register');
        setModalOpen(true);
    };

    const handleEditar = (cronograma) => {
        setSelectedCronograma(cronograma);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleImprimir = (cronograma) => {
        // TODO: Implement print functionality
        console.log('Imprimir constancia para:', cronograma);
        alert('Funcionalidad de impresión en desarrollo');
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedCronograma(null);
    };

    const handleModalSuccess = async () => {
        // Refresh cronogramas list
        try {
            const semesterInfo = await getActiveSemester();
            const data = await getCronogramas(semesterInfo.name);
            setCronogramas(data);
        } catch (err) {
            console.error('Error refreshing cronogramas:', err);
        }
        handleModalClose();
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Cargando tutorías programadas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⚠️</div>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.panelHeader}>
                <h1 className={styles.panelTitle}>PANEL DE TUTOR</h1>
                <p className={styles.welcomeText}>
                    ¡Bienvenido {user ? `${user.first_name} ${user.last_name}` : 'usuario'}!
                </p>
                <p className={styles.subtitle}>
                    En este panel puede observar sus tutorías asignadas:
                </p>
            </div>

            {/* Table */}
            {cronogramas.length > 0 ? (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Aula</th>
                                <th>Estudiante</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cronogramas.map((cronograma) => (
                                <tr key={cronograma.cronograma_id}>
                                    <td>{formatDate(cronograma.fecha)}</td>
                                    <td>{formatTimeRange(cronograma.hora)}</td>
                                    <td>{cronograma.ambiente}</td>
                                    <td>
                                        {cronograma.estudiante_nombre} {cronograma.estudiante_apellido}
                                    </td>
                                    <td>
                                        <div className={styles.actionsCell}>
                                            {cronograma.tutoria_registrada ? (
                                                <>
                                                    <button
                                                        className={styles.btnEditar}
                                                        onClick={() => handleEditar(cronograma)}
                                                        title="Editar tutoría"
                                                    >
                                                        <FaEdit /> Editar Tutoría
                                                    </button>
                                                    <button
                                                        className={styles.btnImprimir}
                                                        onClick={() => handleImprimir(cronograma)}
                                                        title="Imprimir constancia"
                                                    >
                                                        <FaPrint /> Imprimir Constancia
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className={styles.btnRegistrar}
                                                    onClick={() => handleRegistrar(cronograma)}
                                                    title="Registrar tutoría"
                                                >
                                                    <FaPlus /> Registrar Tutoría
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📅</div>
                    <p>No hay tutorías programadas para este semestre.</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <RegistrarTutoriaModal
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    cronograma={selectedCronograma}
                    mode={modalMode}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};

export default TutorPanel;
