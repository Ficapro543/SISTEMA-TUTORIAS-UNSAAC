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
