// services/adminService.js
import api from '../utils/api';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/admin` || "http://localhost:3001/api/admin";

// Obtener solicitudes pendientes
export async function getPendingRequests() {
    try {
        const response = await api.get(`${API_URL}/solicitudes`);
        console.log('Pending requests fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
    }
}

// Obtener detalles de una solicitud específica
export async function getRequestDetail(id) {
    try {
        const response = await api.get(`${API_URL}/solicitud/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching request detail:', error);
        throw error;
    }
}

// Aprobar/rechazar roles específicos
export async function updateRoleDecision(pendingUserId, role, decision) {
    try {
        const response = await api.put(
            `${API_URL}/solicitud/${pendingUserId}/rol/${role}`,
            { decision: decision ? 'aprobado' : 'rechazado' }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating role decision:', error);
        throw error;
    }
}

// Aprobar usuario completamente
export async function approveUser(pendingUserId, rolesDecisions) {
    try {
        // Primero actualizamos cada rol individualmente
        const updatePromises = Object.entries(rolesDecisions).map(
            ([role, approved]) => 
                updateRoleDecision(pendingUserId, role, approved)
        );
        
        await Promise.all(updatePromises);
        
        // Luego aprobamos al usuario
        const response = await api.post(`${API_URL}/aprobar`, {
            pendingUserId,
            roles: Object.keys(rolesDecisions).filter(role => rolesDecisions[role] === true)
        });
        
        return response.data;
    } catch (error) {
        console.error('Error approving user:', error);
        throw error;
    }
}

// Rechazar usuario completamente
export async function rejectUser(pendingUserId) {
    try {
        const response = await api.post(`${API_URL}/rechazar`, { pendingUserId });
        return response.data;
    } catch (error) {
        console.error('Error rejecting user:', error);
        throw error;
    }
}