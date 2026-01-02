import api from "../utils/api";

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

// New methods for TutorPanel
export const getCronogramas = async (semestre) => {
    const response = await api.get(`/tutor/cronogramas?semestre=${semestre}`);
    return response.data;
};

export const getTutoriaDetails = async (cronogramaId) => {
    const response = await api.get(`/tutor/tutoria/${cronogramaId}`);
    return response.data;
};

export const crearTutoria = async (cronogramaId, datos) => {
    const response = await api.post('/tutor/tutoria', {
        cronograma_id: cronogramaId,
        ...datos
    });
    return response.data;
};

export const actualizarTutoria = async (tutoriaId, datos) => {
    const response = await api.put(`/tutor/tutoria/${tutoriaId}`, datos);
    return response.data;
};
