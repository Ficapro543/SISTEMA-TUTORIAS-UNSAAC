const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Obtener todos los cronogramas
 * @param {string} search - Término de búsqueda por nombre de tutor
 */
export async function getCronogramas(search = '') {
    const token = localStorage.getItem('accessToken');
    const url = search
        ? `${API_URL}/api/cronogramas?search=${encodeURIComponent(search)}`
        : `${API_URL}/api/cronogramas`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener cronogramas');
    }

    return response.json();
}

/**
 * Crear un nuevo cronograma
 */
export async function createCronograma(data) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/cronogramas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear cronograma');
    }

    return response.json();
}

/**
 * Obtener un cronograma por ID
 */
export async function getCronogramaById(id) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/cronogramas/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener cronograma');
    }

    return response.json();
}

/**
 * Actualizar un cronograma
 */
export async function updateCronograma(id, data) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/cronogramas/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar cronograma');
    }

    return response.json();
}

/**
 * Eliminar un cronograma
 */
export async function deleteCronograma(id) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/cronogramas/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar cronograma');
    }

    return response.json();
}
