import api from "../utils/api";

export async function getActiveSemester() {
    const res = await api.get("/assignments/semester/active");
    return res.data;
}

export async function getSemesters() {
    const res = await api.get("/assignments/semesters");
    return res.data;
}

export async function getTutors(search = "", semesterId = null) {
    let url = `/assignments/tutors?search=${encodeURIComponent(search)}`;
    if (semesterId) {
        url += `&semesterId=${semesterId}`;
    }
    const res = await api.get(url);
    return res.data;
}

export async function getUnassignedStudents(semesterId) {
    const res = await api.get(`/assignments/students/unassigned?semesterId=${semesterId}`);
    return res.data;
}

export async function assignStudents(tutorId, studentIds, semesterId, assignmentDate, assignmentTime) {
    const res = await api.post("/assignments", { tutorId, studentIds, semesterId, assignmentDate, assignmentTime });
    return res.data;
}

export async function getDashboardStats() {
    const res = await api.get("/assignments/stats");
    return res.data;
}

export async function getStudentsByTutor(tutorId, semesterId) {
    const res = await api.get(`/assignments/tutor/${tutorId}/students?semesterId=${semesterId}`);
    return res.data;
}

export async function transferStudents(data) {
    const res = await api.put("/assignments/transfer", data);
    return res.data;
}

export async function transferAllStudents(data) {
    const res = await api.put("/assignments/transfer-all", data);
    return res.data;
}
