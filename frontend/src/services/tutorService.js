import api from "../utils/api";

// --- Métodos existentes (preservados) ---
export const getMisTutorados = async (semestre) => {
    const response = await api.get(`/tutor/tutorados?semestre=${semestre}`);
    return response.data;
};

export const getActividades = async (semestre) => {
    const response = await api.get(`/tutor/actividades?semestre=${semestre}`);
    return response.data;
};

export const registrarSesion = async (datos) => {
    const response = await api.post(`/tutor/registrar-sesion`, datos);
    return response.data;
};

// --- Nuevos Métodos para el Panel de Tutorías ---

/**
 * Obtener listado de tutorías (cronogramas + estado)
 */
export const getTutorias = async (tutorId) => {
    const response = await api.get(`/tutorias/tutor/${tutorId}`);
    return response.data;
};

/**
 * Registrar una nueva tutoría (Completa cronograma + inserta tutoría)
 */
export const registrarTutoria = async (data) => {
    const response = await api.post(`/tutorias/registrar`, data);
    return response.data;
};

/**
 * Actualizar una tutoría existente
 */
export const actualizarTutoria = async (id, data) => {
    const response = await api.put(`/tutorias/actualizar/${id}`, data);
    return response.data;
};

/**
 * Obtener historial de un estudiante
 */
export const getHistorialEstudiante = async (codigoEstudiante) => {
    const response = await api.get(`/tutorias/historial/${codigoEstudiante}`);
    return response.data;
};
