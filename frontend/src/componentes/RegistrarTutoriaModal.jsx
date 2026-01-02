import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { crearTutoria, actualizarTutoria, getTutoriaDetails } from '../services/tutorService';
import styles from './RegistrarTutoriaModal.module.css';

const RegistrarTutoriaModal = ({ isOpen, onClose, cronograma, mode, onSuccess }) => {
    const [formData, setFormData] = useState({
        obs_academico: '',
        obs_personal: '',
        obs_profesional: '',
        resumen_general: '',
        requiere_derivacion: false,
        modalidad: 'Individual'
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Load existing tutoria data when in edit mode
    useEffect(() => {
        if (mode === 'edit' && cronograma && cronograma.tutoria_id) {
            setIsLoadingData(true);
            getTutoriaDetails(cronograma.cronograma_id)
                .then(data => {
                    setFormData({
                        obs_academico: data.obs_academico || '',
                        obs_personal: data.obs_personal || '',
                        obs_profesional: data.obs_profesional || '',
                        resumen_general: data.resumen_general || '',
                        requiere_derivacion: data.requiere_derivacion || false,
                        modalidad: data.modalidad || 'Individual'
                    });
                })
                .catch(err => {
                    console.error('Error loading tutoria data:', err);
                    setStatus({ type: 'error', message: 'Error al cargar los datos de la tutoría.' });
                })
                .finally(() => {
                    setIsLoadingData(false);
                });
        }
    }, [mode, cronograma]);

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
            if (mode === 'register') {
                await crearTutoria(cronograma.cronograma_id, formData);
                setStatus({ type: 'success', message: '¡Tutoría registrada correctamente!' });
            } else {
                await actualizarTutoria(cronograma.tutoria_id, formData);
                setStatus({ type: 'success', message: '¡Tutoría actualizada correctamente!' });
            }

            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Error submitting tutoria:', err);
            const errorMsg = err.response?.data?.message ||
                (mode === 'register' ? 'Error al registrar la tutoría.' : 'Error al actualizar la tutoría.');
            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'p. m.' : 'a. m.';
        const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {mode === 'register' ? 'Registrar Tutoría' : 'Editar Tutoría'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {/* Session Info */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Estudiante</span>
                                <span className={styles.infoValue}>
                                    {cronograma.estudiante_nombre} {cronograma.estudiante_apellido}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Código</span>
                                <span className={styles.infoValue}>{cronograma.codigo_estudiante}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Fecha</span>
                                <span className={styles.infoValue}>{formatDate(cronograma.fecha)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Hora</span>
                                <span className={styles.infoValue}>{formatTime(cronograma.hora)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Aula</span>
                                <span className={styles.infoValue}>{cronograma.ambiente}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`${styles.statusMessage} ${styles[status.type]}`}>
                            {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                            {status.message}
                        </div>
                    )}

                    {/* Form */}
                    {isLoadingData ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                            Cargando datos...
                        </div>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* Modalidad */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Modalidad</label>
                                <select
                                    className={styles.select}
                                    name="modalidad"
                                    value={formData.modalidad}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Individual">Individual</option>
                                    <option value="Grupal">Grupal</option>
                                </select>
                            </div>

                            {/* Observaciones Académicas */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Observaciones Académicas</label>
                                <textarea
                                    className={styles.textarea}
                                    name="obs_academico"
                                    value={formData.obs_academico}
                                    onChange={handleChange}
                                    placeholder="Desempeño académico, notas, cursos..."
                                />
                            </div>

                            {/* Observaciones Personales */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Observaciones Personales</label>
                                <textarea
                                    className={styles.textarea}
                                    name="obs_personal"
                                    value={formData.obs_personal}
                                    onChange={handleChange}
                                    placeholder="Situación familiar, emocional, salud..."
                                />
                            </div>

                            {/* Observaciones Profesionales */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Observaciones Profesionales</label>
                                <textarea
                                    className={styles.textarea}
                                    name="obs_profesional"
                                    value={formData.obs_profesional}
                                    onChange={handleChange}
                                    placeholder="Proyección profesional, intereses, ética..."
                                />
                            </div>

                            {/* Resumen General */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Resumen General</label>
                                <textarea
                                    className={styles.textarea}
                                    name="resumen_general"
                                    value={formData.resumen_general}
                                    onChange={handleChange}
                                    placeholder="Conclusiones de la sesión..."
                                />
                            </div>

                            {/* Requiere Derivación */}
                            <div className={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    id="requiere_derivacion"
                                    name="requiere_derivacion"
                                    checked={formData.requiere_derivacion}
                                    onChange={handleChange}
                                />
                                <label className={styles.checkboxLabel} htmlFor="requiere_derivacion">
                                    ¿Requiere derivación a especialista?
                                </label>
                            </div>

                            {/* Actions */}
                            <div className={styles.actions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : (mode === 'register' ? 'Registrar' : 'Actualizar')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrarTutoriaModal;
