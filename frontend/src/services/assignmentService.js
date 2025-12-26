const API_URL = "http://localhost:3001/api/assignments";

export async function getActiveSemester() {
    const res = await fetch(`${API_URL}/semester/active`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error fetching active semester");
    }
    return res.json();
}

export async function getSemesters() {
    const res = await fetch(`${API_URL}/semesters`);
    if (!res.ok) {
        throw new Error("Error fetching semesters");
    }
    return res.json();
}

export async function getTutors(search = "") {
    const res = await fetch(`${API_URL}/tutors?search=${encodeURIComponent(search)}`);
    if (!res.ok) {
        throw new Error("Error fetching tutors");
    }
    return res.json();
}

export async function getUnassignedStudents(semesterId) {
    const res = await fetch(`${API_URL}/students/unassigned?semesterId=${semesterId}`);
    if (!res.ok) {
        throw new Error("Error fetching unassigned students");
    }
    return res.json();
}

export async function assignStudents(tutorId, studentIds, semesterId, assignmentDate, assignmentTime) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, studentIds, semesterId, assignmentDate, assignmentTime }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error assigning students");
    }
    return res.json();
}

export async function getDashboardStats() {
    const res = await fetch(`${API_URL}/stats`);
    if (!res.ok) {
        throw new Error("Error fetching dashboard statistics");
    }
    return res.json();
}
