import React, { useState, useEffect } from 'react';
import { registrarSesion, getMisTutorados } from '../services/tutorService';
import { getActiveSemester } from '../services/assignmentService';
import styles from '../styles/pages/TutorInterface.module.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const RegistrarSesion = () => {
    const [tutorados, setTutorados] = useState([]);
    const [loadingTutorados, setLoadingTutorados] = useState(true);
    const [semesterName, setSemesterName] = useState('');

    const [formData, setFormData] = useState({
        codigo_estudiante: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        ambiente: 'Virtual',
        modalidad: 'Individual',
        obs_academico: '',
        obs_personal: '',
        obs_profesional: '',
        resumen_general: '',
        requiere_derivacion: false
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const semesterInfo = await getActiveSemester();
                setSemesterName(semesterInfo.name);
                const data = await getMisTutorados(semesterInfo.name);
                setTutorados(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, codigo_estudiante: data[0].code }));
                }
            } catch (err) {
                console.error('Error initializing form:', err);
            } finally {
                setLoadingTutorados(false);
            }
        };
        init();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await registrarSesion({ ...formData, semestre: semesterName });
            setStatus({ type: 'success', message: '¡Sesión registrada correctamente!' });
            // Reset observation fields
            setFormData(prev => ({
                ...prev,
                obs_academico: '',
                obs_personal: '',
                obs_profesional: '',
                resumen_general: '',
                requiere_derivacion: false
            }));
        } catch (err) {
            console.error('Error submitting session:', err);
            setStatus({ type: 'error', message: 'Error al registrar la sesión.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingTutorados) return <div className={styles.emptyState}>Cargando datos...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Registrar Nueva Sesión de Tutoría</h2>
            </div>

            {status.message && (
                <div style={{
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: status.type === 'success' ? '#059669' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {status.message}
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Estudiante</label>
                    <select
                        className={styles.select}
                        name="codigo_estudiante"
                        value={formData.codigo_estudiante}
                        onChange={handleChange}
                        required
                    >
                        {tutorados.map(est => (
                            <option key={est.id} value={est.code}>
                                [{est.code}] {est.first_name} {est.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Fecha</label>
                    <input
                        className={styles.input}
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Hora</label>
                    <input
                        className={styles.input}
                        type="time"
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Modalidad</label>
                    <select
                        className={styles.select}
                        name="modalidad"
                        value={formData.modalidad}
                        onChange={handleChange}
                    >
                        <option value="Individual">Individual</option>
                        <option value="Grupal">Grupal</option>
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Ambiente / Lugar</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="ambiente"
                        value={formData.ambiente}
                        onChange={handleChange}
                        placeholder="Ej: Virtual, Cubículo 4"
                    />
                </div>

                <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                    <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="requiere_derivacion"
                            checked={formData.requiere_derivacion}
                            onChange={handleChange}
                        />
                        ¿Requiere derivación?
                    </label>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Observaciones Académicas</label>
                    <textarea
                        className={styles.textarea}
                        name="obs_academico"
                        value={formData.obs_academico}
                        onChange={handleChange}
                        placeholder="Desempeño académico, notas, cursos..."
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Observaciones Personales</label>
                    <textarea
                        className={styles.textarea}
                        name="obs_personal"
                        value={formData.obs_personal}
                        onChange={handleChange}
                        placeholder="Situación familiar, emocional, salud..."
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Observaciones Profesionales</label>
                    <textarea
                        className={styles.textarea}
                        name="obs_profesional"
                        value={formData.obs_profesional}
                        onChange={handleChange}
                        placeholder="Proyección profesional, intereses, ética..."
                    />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Resumen General</label>
                    <textarea
                        className={styles.textarea}
                        name="resumen_general"
                        value={formData.resumen_general}
                        onChange={handleChange}
                        placeholder="Conclusiones de la sesión..."
                    />
                </div>

                <div className={styles.fullWidth}>
                    <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Registrar Sesión'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarSesion;
