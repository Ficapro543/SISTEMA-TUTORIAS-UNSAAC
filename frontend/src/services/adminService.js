const API_URL = "http://localhost:3001/api/admin";

export async function getPendingRequests() {
    const res = await fetch(`${API_URL}/solicitudes`);
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Error fetching pending requests");
    }
    return res.json();
}

export async function getRequestDetail(id) {
    const res = await fetch(`${API_URL}/solicitudes/${id}`);
    if (!res.ok) throw new Error("Error fetching request detail");
    return res.json();
}

export async function approveRequest(pendingUserId, roles) {
    const res = await fetch(`${API_URL}/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingUserId, roles }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error approving request");
    }
    return res.json();
}

export async function rejectRequest(pendingUserId) {
    const res = await fetch(`${API_URL}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingUserId }),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error rejecting request");
    }
    return res.json();
}
