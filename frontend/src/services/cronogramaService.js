import api from '@/utils/api';

/**
 * Obtener todos los cronogramas
 * @param {Object} filters - Filtros de búsqueda { semestre }
 */
export async function getCronogramas(filters = {}) {
    const params = new URLSearchParams();

    if (filters.semestre) params.append('semestre', filters.semestre);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/cronogramas?${params.toString()}`);
    return response.data;
}

/**
 * Crear un nuevo cronograma
 */
export async function createCronograma(data) {
    const response = await api.post('/cronogramas', data);
    return response.data;
}

/**
 * Obtener un cronograma por ID
 */
export async function getCronogramaById(id) {
    const response = await api.get(`/cronogramas/${id}`);
    return response.data;
}

/**
 * Actualizar un cronograma
 */
export async function updateCronograma(id, data) {
    const response = await api.put(`/cronogramas/${id}`, data);
    return response.data;
}

/**
 * Eliminar un cronograma
 */
export async function deleteCronograma(id) {
    const response = await api.delete(`/cronogramas/${id}`);
    return response.data;
}
