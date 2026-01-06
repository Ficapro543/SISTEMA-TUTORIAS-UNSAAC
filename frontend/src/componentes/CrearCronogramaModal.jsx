import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { X } from 'lucide-react';
import { getTutors, getSemesters } from '@/services/assignmentService';
import styles from '@/styles/components/CrearCronogramaModal.module.css';

export default function CrearCronogramaModal({ isOpen, onClose, onSubmit, initialData = null, isEditing = false }) {
    const [formData, setFormData] = useState({
        tutor_user_id: '',
        codigo_estudiante: '',
        fecha: '',
        hora: '',
        ambiente: '',
        semestre: ''
    });

    const [tutores, setTutores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [semestres, setSemestres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            if (isEditing && initialData) {
                // Populate form with initial data
                setFormData({
                    tutor_user_id: initialData.tutor_id || '',
                    codigo_estudiante: initialData.codigo_estudiante || '', // Need to ensure we have this
                    fecha: initialData.raw_fecha ? initialData.raw_fecha.split('T')[0] : '',
                    hora: initialData.raw_hora || '',
                    ambiente: initialData.aula || '',
                    semestre: initialData.semestre || ''
                });
            } else {
                // Reset for creation
                setFormData({
                    tutor_user_id: '',
                    codigo_estudiante: '',
                    fecha: '',
                    hora: '',
                    ambiente: '',
                    semestre: ''
                });
            }
        }
    }, [isOpen, isEditing, initialData]);

    useEffect(() => {
        if (formData.tutor_user_id && formData.semestre) {
            loadEstudiantes();
        }
    }, [formData.tutor_user_id, formData.semestre]);

    async function loadInitialData() {
        try {
            const [tutoresData, semestresData] = await Promise.all([
                getTutors(),
                getSemesters()
            ]);
            setTutores(tutoresData);
            setSemestres(semestresData);

            // Establecer el semestre más reciente por defecto SOLO si no estamos editando
            if (!isEditing && semestresData.length > 0) {
                setFormData(prev => ({ ...prev, semestre: semestresData[0].id }));
            }
        } catch (err) {
            setError('Error al cargar datos iniciales');
            console.error(err);
        }
    }

    async function loadEstudiantes() {
        try {
            const response = await api.get(
                `/assignments/tutor/${formData.tutor_user_id}/students?semesterId=${formData.semestre}`
            );

            // Access response.data directly
            setEstudiantes(response.data);
        } catch (err) {
            console.error('Error al cargar estudiantes:', err);
            setError(`Error al cargar estudiantes: ${err.message || 'Error de conexión'}`);
            setEstudiantes([]);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!formData.tutor_user_id || !formData.codigo_estudiante || !formData.fecha ||
            !formData.hora || !formData.ambiente || !formData.semestre) {
            setError('Todos los campos son requeridos');
            return;
        }

        // Validar que la fecha no sea en el pasado
        const selectedDate = new Date(formData.fecha);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('La fecha no puede ser en el pasado');
            return;
        }

        setLoading(true);

        try {
            await onSubmit(formData);

            // Resetear formulario
            setFormData({
                tutor_user_id: '',
                codigo_estudiante: '',
                fecha: '',
                hora: '',
                ambiente: '',
                semestre: semestres.length > 0 ? semestres[0].id : ''
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear cronograma');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{isEditing ? 'Editar Cronograma' : 'Crear Nuevo Cronograma'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isEditing && (
                        <div className={styles.formGroup}>
                            <label htmlFor="semestre" className={styles.label}>
                                Semestre <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="semestre"
                                name="semestre"
                                value={formData.semestre}
                                onChange={handleChange}
                                className={styles.select}
                                required
                                disabled={isEditing}
                            >
                                <option value="">Seleccione un semestre</option>
                                {semestres.map(sem => (
                                    <option key={sem.id} value={sem.id}>
                                        {sem.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!isEditing && (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="tutor_user_id" className={styles.label}>
                                    Tutor <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="tutor_user_id"
                                    name="tutor_user_id"
                                    value={formData.tutor_user_id}
                                    onChange={handleChange}
                                    className={styles.select}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Seleccione un tutor</option>
                                    {tutores.map(tutor => (
                                        <option key={tutor.id} value={tutor.id}>
                                            {tutor.first_name} {tutor.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="codigo_estudiante" className={styles.label}>
                                    Estudiante <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="codigo_estudiante"
                                    name="codigo_estudiante"
                                    value={formData.codigo_estudiante}
                                    onChange={handleChange}
                                    className={styles.select}
                                    required
                                    disabled={(!formData.tutor_user_id || !formData.semestre) || isEditing}
                                >
                                    <option value="">
                                        {!formData.tutor_user_id || !formData.semestre
                                            ? 'Primero seleccione tutor y semestre'
                                            : 'Seleccione un estudiante'}
                                    </option>
                                    {estudiantes.map(est => (
                                        <option key={est.code} value={est.code}>
                                            {est.code} - {est.first_name} {est.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fecha" className={styles.label}>
                                Fecha <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="hora" className={styles.label}>
                                Hora Inicio <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="time"
                                id="hora"
                                name="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                className={styles.input}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="ambiente" className={styles.label}>
                            Ambiente/Aula <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            id="ambiente"
                            name="ambiente"
                            value={formData.ambiente}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ej: Aula 201, Cubículo 3B"
                            required
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Volver atrás
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Confirmar' : 'Crear Cronograma')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
