import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCheckCircle, FaHome, FaSignOutAlt, FaInfoCircle, FaChevronDown, FaUsers, FaArrowLeft } from "react-icons/fa";
import { getActiveSemester, getSemesters, getTutors, getUnassignedStudents, assignStudents } from "../../services/assignmentService";
import styles from "@/styles/pages/admin/AsignacionTutorados.module.css";

export default function AsignacionTutorados({ embedded = false }) {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [allSemesters, setAllSemesters] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState("");
    const [semester, setSemester] = useState(null); // The one currently being viewed

    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [message, setMessage] = useState(null);

    useEffect(() => {
        const rolesStr = localStorage.getItem("userRoles");
        if (rolesStr) {
            const roles = JSON.parse(rolesStr);
            if (roles.administrador) {
                setIsAdmin(true);
                loadInitialData();
            }
        } else {
            // If embedded, we assume parent checked auth, but good to be safe.
            if (!embedded) {
                const timer = setTimeout(() => navigate("/login"), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [navigate, embedded]);

    async function loadInitialData() {
        try {
            setLoading(true);
            const activeSem = await getActiveSemester();
            const sems = await getSemesters();

            setAllSemesters(sems);

            if (activeSem) {
                setSemester(activeSem);
                setSelectedSemesterId(activeSem.id);
                loadStudents(activeSem.id);
            } else if (sems.length > 0) {
                setSemester(sems[0]);
                setSelectedSemesterId(sems[0].id);
                loadStudents(sems[0].id);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando datos: " + err.message });
        } finally {
            setLoading(false);
        }
    }

    async function loadStudents(semesterId) {
        try {
            const stud = await getUnassignedStudents(semesterId);
            setStudents(stud);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (selectedSemesterId) {
            const found = allSemesters.find(s => s.id === selectedSemesterId);
            if (found) setSemester(found);
            loadStudents(selectedSemesterId);
            // Reset selection when semester changes
            setSelectedStudents([]);
            setSelectedTutor(null);
        }
    }, [selectedSemesterId, allSemesters]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!isAdmin) {
                setTutors([]);
                return;
            }
            // If in Step 1, we don't need tutors list usually, but in Step 2 we do.
            // If searchTerm is empty and we are in Step 2, let's load all tutors.
            if (!searchTerm && step === 1) {
                setTutors([]);
                return;
            }

            try {
                const res = await getTutors(searchTerm || "");
                setTutors(res);
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isAdmin]);

    const handleSelectTutor = (tutor) => {
        setSelectedTutor(tutor);
        setSearchTerm("");
        setMessage(null);
    };

    const handleSelectStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter((s) => s !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map((s) => s.id));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userRoles");
        navigate("/login");
    };


    // Load tutors on component mount
    useEffect(() => {
        if (isAdmin) {
            getTutors("").then(setTutors).catch(console.error);
        }
    }, [isAdmin]);



    const handleAssignFinal = async () => {
        if (!selectedTutor || !semester) {
            setMessage({ type: "error", text: "Seleccione un tutor para continuar" });
            return;
        }

        if (selectedStudents.length === 0) {
            setMessage({ type: "error", text: "Seleccione al menos un estudiante" });
            return;
        }

        if (!confirm(`¿Confirmar asignación de ${selectedStudents.length} estudiantes a ${selectedTutor.first_name} ${selectedTutor.last_name}?`)) {
            return;
        }

        try {
            setLoading(true);
            await assignStudents(selectedTutor.id, selectedStudents, semester.id);

            setMessage({
                type: "success",
                text: `Se asignaron ${selectedStudents.length} estudiantes correctamente.`
            });

            // Reset selections
            loadStudents(semester.id);
            setSelectedStudents([]);
            setSelectedTutor(null);
            setSearchTerm("");

        } catch (err) {
            setMessage({ type: "error", text: "Error en asignación: " + err.message });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isAdmin) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>Cargando módulo...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>Acceso Denegado</h2>
                    <p style={{ color: '#64748b', fontWeight: 500 }}>No tienes permisos de administrador para acceder a este módulo.</p>
                    <button onClick={() => navigate("/admin")} style={{ marginTop: '24px', padding: '10px 24px', backgroundColor: '#1f2937', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={embedded ? "" : styles.pageContainer}>
            {/* Header / Navbar - Only if NOT embedded */}
            {!embedded && (
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.headerSubtitle}>Módulo Administrador</span>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>Administrador</p>
                            <span className={styles.userBadge}>Panel de Control</span>
                        </div>

                        <button onClick={() => navigate("/admin")} className={styles.navButton}>
                            <FaHome /> Inicio
                        </button>

                        <button onClick={handleLogout} className={styles.navButton}>
                            <FaSignOutAlt style={{ transform: 'rotate(180deg)' }} /> Salir
                        </button>
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Section Title */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Asignación de Tutorados</h2>
                    <p className={styles.sectionDescription}>
                        Gestione la asignación de estudiantes a tutores de forma masiva para el semestre actual.
                    </p>
                </div>

                <div className={styles.twoColumns}>
                    {/* COLUMN 1: STUDENT SELECTION */}
                    <div className={styles.tableCard}>
                        <div style={{ marginBottom: '20px' }}>
                            <h3 className={styles.cardTitle}>1. Seleccionar Estudiantes</h3>
                            <p className={styles.cardDescription}>Estudiantes sin tutor en {semester?.name || "..."}</p>

                            <div style={{ marginTop: '12px' }}>
                                <select
                                    value={selectedSemesterId}
                                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                                    className={styles.searchInput}
                                    style={{ paddingLeft: '12px' }}
                                >
                                    {allSemesters.map(s => (
                                        <option key={s.id} value={s.id}>
                                            Semestre {s.name} {s.is_active ? "(Actual)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.scrollContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={students.length > 0 && selectedStudents.length === students.length}
                                                className={styles.checkbox}
                                            />
                                        </th>
                                        <th>Código / Nombre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s) => (
                                        <tr
                                            key={s.id}
                                            className={selectedStudents.includes(s.id) ? styles.selectedRow : ""}
                                            onClick={() => handleSelectStudent(s.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(s.id)}
                                                    readOnly
                                                    className={styles.checkbox}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: '#1a237e' }}>{s.code}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.first_name} {s.last_name}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan="2" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                No hay estudiantes pendientes
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                            {selectedStudents.length} estudiantes seleccionados
                        </div>
                    </div>

                    {/* COLUMN 2: TUTOR SELECTION & ACTION */}
                    <div>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>2. Seleccionar Tutor</h3>
                            <p className={styles.cardDescription}>Busque y seleccione el tutor responsable</p>

                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}><FaSearch /></div>
                                <input
                                    type="text"
                                    placeholder="Nombre o código del tutor..."
                                    className={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className={styles.scrollContainer} style={{ marginTop: '16px', maxHeight: '300px' }}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '40px' }}></th>
                                            <th>Tutor</th>
                                            <th style={{ textAlign: 'right' }}>Asignados</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tutors.map((t) => (
                                            <tr
                                                key={t.id}
                                                className={selectedTutor?.id === t.id ? styles.selectedRow : ""}
                                                onClick={() => handleSelectTutor(t)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="radio"
                                                        name="tutor_select"
                                                        checked={selectedTutor?.id === t.id}
                                                        readOnly
                                                        className={styles.checkbox}
                                                        style={{ borderRadius: '50%' }}
                                                    />
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 700, color: '#1a237e' }}>{t.first_name} {t.last_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600 }}>Cód. {t.code}</div>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1a237e' }}>
                                                    {t.student_count || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedTutor && (
                                <div className={styles.selectedTutorPanel} style={{ marginTop: '20px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '4px' }}>Tutor Destino:</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                                        {selectedTutor.first_name} {selectedTutor.last_name}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '32px' }}>
                                <button
                                    onClick={handleAssignFinal}
                                    disabled={!selectedTutor || selectedStudents.length === 0 || loading}
                                    className={styles.primaryButton}
                                    style={{ width: '100%', height: '50px' }}
                                >
                                    {loading ? "Procesando..." : `Confirmar Asignación`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Overlay */}
                {message && (
                    <div className={styles.toast}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#16a34a' : '#dc2626',
                            display: 'flex'
                        }}>
                            {message.type === 'success' ? <FaCheckCircle size={20} /> : <FaInfoCircle size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>
                                {message.type === 'success' ? '¡Operación Exitosa!' : 'Atención'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{message.text}</div>
                        </div>
                        <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '20px' }}>×</button>
                    </div>
                )}
            </main>
        </div>
    );
}
