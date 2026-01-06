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
 * Soporta envío de archivos mediante FormData
 */
export const registrarTutoria = async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await api.post(`/tutorias/registrar`, data, config);
    return response.data;
};

/**
 * Actualizar una tutoría existente
 * Soporta envío de archivos mediante FormData
 */
export const actualizarTutoria = async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

    const response = await api.put(`/tutorias/actualizar/${id}`, data, config);
    return response.data;
};

/**
 * Obtener historial de un estudiante
 */
export const getHistorialEstudiante = async (codigoEstudiante) => {
    const response = await api.get(`/tutorias/historial/${codigoEstudiante}`);
    return response.data;
};

export const verArchivo = async (tutoriaId) => {
    const response = await api.get(`/tutorias/archivo/${tutoriaId}`, {
        responseType: 'blob'
    });
    return response.data;
};
