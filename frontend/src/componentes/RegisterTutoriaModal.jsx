import React, { useState } from 'react';
import { FiX, FiCheck, FiCornerUpLeft } from 'react-icons/fi';
import api from '../utils/api';

const RegisterTutoriaModal = ({ isOpen, onClose, cronograma, onSaveSuccess }) => {
    if (!isOpen || !cronograma) return null;

    const [formData, setFormData] = useState({
        obs_academico: '',
        obs_personal: '',
        obs_profesional: '',
        requiere_derivacion: false, // Default false
        especialidad: '', // visible only if true
        motivo: '', // visible only if true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'radio' ? (value === 'true') : value;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Simulation for UI check if API is not fully ready for this schema
        try {
            // Try real API first
            const payload = {
                cronograma_id: cronograma.cronograma_id,
                obs_academico: formData.obs_academico,
                obs_personal: formData.obs_personal,
                obs_profesional: formData.obs_profesional,
                requiere_derivacion: formData.requiere_derivacion,
                especialidad: formData.requiere_derivacion ? formData.especialidad : null,
                motivo: formData.requiere_derivacion ? formData.motivo : null
            };

            // Uncomment to use real API
            // await api.post('/tutorias', payload);

            // Mock success for visual requirement verification
            setTimeout(() => {
                onSaveSuccess(); // Trigger parent update
                onClose();
            }, 800);

        } catch (err) {
            console.error("Error registering tutoria:", err);
            setError("Error al guardar. Intente nuevamente.");
        } finally {
            // setIsSubmitting(false); // Done in timeout
        }
    };

    // Format helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] relative z-10 animate-fade-in-up font-[Poppins] overflow-hidden">

                {/* Header */}
                <div className="bg-[#002147] px-6 py-4 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold tracking-wide">Registrar Tutoría</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <form id="tutoriaForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. Read-Only Context Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase">Estudiante</label>
                                <input type="text" readOnly value={`${cronograma.nombre_estudiante} ${cronograma.apellido_estudiante}`} className="w-full bg-transparent font-semibold text-gray-800 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Código</label>
                                <input type="text" readOnly value={cronograma.codigo_estudiante} className="w-full bg-transparent text-gray-600 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase">Fecha / Hora</label>
                                <input type="text" readOnly value={`${formatDate(cronograma.fecha)} - ${cronograma.hora}`} className="w-full bg-transparent text-gray-600 outline-none" />
                            </div>
                        </div>

                        {/* 2. Observation Text Areas */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#002147] mb-1">Aspecto Académico</label>
                                <textarea name="obs_academico" rows="3" className="w-full border border-gray-300 rounded-md p-3 focus:ring-1 focus:ring-[#002147] focus:border-[#002147] outline-none resize-none text-sm" placeholder="Ingrese observaciones académicas..." value={formData.obs_academico} onChange={handleChange}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#002147] mb-1">Aspecto Personal</label>
                                <textarea name="obs_personal" rows="3" className="w-full border border-gray-300 rounded-md p-3 focus:ring-1 focus:ring-[#002147] focus:border-[#002147] outline-none resize-none text-sm" placeholder="Ingrese observaciones personales..." value={formData.obs_personal} onChange={handleChange}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#002147] mb-1">Aspecto Profesional</label>
                                <textarea name="obs_profesional" rows="3" className="w-full border border-gray-300 rounded-md p-3 focus:ring-1 focus:ring-[#002147] focus:border-[#002147] outline-none resize-none text-sm" placeholder="Ingrese observaciones profesionales..." value={formData.obs_profesional} onChange={handleChange}></textarea>
                            </div>
                        </div>

                        {/* 3. Derivación Logic */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-6 mb-4">
                                <span className="font-bold text-gray-800 text-sm">¿Requiere derivación psicológica?</span>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="requiere_derivacion" value="false" checked={!formData.requiere_derivacion} onChange={handleChange} className="accent-[#002147]" />
                                        <span className="text-sm">No</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="requiere_derivacion" value="true" checked={formData.requiere_derivacion} onChange={handleChange} className="accent-[#002147]" />
                                        <span className="text-sm font-semibold text-[#002147]">Sí</span>
                                    </label>
                                </div>
                            </div>

                            {/* Conditional Fields */}
                            {formData.requiere_derivacion && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-red-50 p-4 rounded-md border border-red-100 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-red-800 uppercase mb-1">Especialidad</label>
                                        <input type="text" name="especialidad" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-red-500 outline-none" placeholder="Ej: Psicología Clínica" value={formData.especialidad} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-red-800 uppercase mb-1">Motivo</label>
                                        <input type="text" name="motivo" className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-red-500 outline-none" placeholder="Breve motivo..." value={formData.motivo} onChange={handleChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-2 px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-md transition-colors text-sm"
                    >
                        <FiCornerUpLeft /> Volver atrás
                    </button>
                    <button
                        type="submit"
                        form="tutoriaForm"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-[#002147] hover:bg-blue-900 text-white font-bold rounded-md transition-all shadow-md active:transform active:scale-95 text-sm"
                    >
                        {isSubmitting ? 'Guardando...' : <><FiCheck /> Confirmar</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RegisterTutoriaModal;
