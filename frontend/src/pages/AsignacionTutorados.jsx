import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCheckCircle, FaHome, FaSignOutAlt, FaInfoCircle, FaChevronDown, FaUsers, FaArrowLeft } from "react-icons/fa";
import { getActiveSemester, getSemesters, getTutors, getUnassignedStudents, assignStudents } from "../services/assignmentService";
import styles from "../styles/components/AsignacionTutorados.module.css";

export default function AsignacionTutorados() {
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
    const [step, setStep] = useState(1); // 1: Students, 2: Tutor + Date/Time
    const [assignmentDate, setAssignmentDate] = useState("");
    const [assignmentTime, setAssignmentTime] = useState("");

    useEffect(() => {
        const rolesStr = localStorage.getItem("userRoles");
        if (rolesStr) {
            const roles = JSON.parse(rolesStr);
            if (roles.administrador) {
                setIsAdmin(true);
                loadInitialData();
            }
        } else {
            const timer = setTimeout(() => navigate("/login"), 1000);
            return () => clearTimeout(timer);
        }
    }, [navigate]);

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
    }, [searchTerm, isAdmin, step]);

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


    const handleAssignNext = async () => {
        if (selectedStudents.length === 0) {
            setMessage({ type: "error", text: "Seleccione al menos un estudiante" });
            return;
        }

        try {
            setLoading(true);
            const res = await getTutors(""); // Load all available tutors initially
            setTutors(res);
            setStep(2);
            setMessage(null);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando tutores" });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setSelectedTutor(null);
        setAssignmentDate("");
        setAssignmentTime("");
    };

    const handleAssignFinal = async () => {
        if (!selectedTutor || !assignmentDate || !assignmentTime || !semester) {
            setMessage({ type: "error", text: "Complete todos los campos del tutor y horario" });
            return;
        }

        if (!confirm(`¿Confirmar asignación de ${selectedStudents.length} estudiantes a ${selectedTutor.first_name} ${selectedTutor.last_name}?`)) {
            return;
        }

        try {
            setLoading(true);
            await assignStudents(selectedTutor.id, selectedStudents, semester.id, assignmentDate, assignmentTime);

            setMessage({
                type: "success",
                text: `Se asignaron ${selectedStudents.length} estudiantes correctamente.`
            });

            // Reset and go back to step 1
            loadStudents(semester.id);
            setSelectedStudents([]);
            setSelectedTutor(null);
            setSearchTerm("");
            setAssignmentDate("");
            setAssignmentTime("");
            setStep(1);

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
        <div className={styles.pageContainer}>
            {/* Header / Navbar */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerSubtitle} style={{ fontSize: '14px', margin: 0 }}>Módulo Administrador</span>
                </div>

                <div className={styles.headerRight}>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Administrador</p>
                        <span className={styles.userBadge}>Panel de Control</span>
                    </div>

                    <button onClick={() => navigate("/admin")} className={styles.navButton}>
                        <FaHome style={{ color: '#94a3b8' }} />
                        Inicio
                    </button>

                    <button onClick={handleLogout} className={styles.navButton}>
                        <FaSignOutAlt style={{ transform: 'rotate(180deg)', color: '#94a3b8' }} />
                        Salir
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>

                {/* Section Title */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {step === 1 ? "Paso 1: Selección de Estudiantes" : "Paso 2: Asignación de Tutor y Horario"}
                    </h2>
                    <p className={styles.sectionDescription}>
                        {step === 1
                            ? "Seleccione los estudiantes sin tutor para el semestre actual"
                            : `Asignando ${selectedStudents.length} estudiantes seleccionados`}
                    </p>
                </div>

                {step === 1 ? (
                    <>
                        {/* Card: Semestre */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Semestre</h3>
                            <p className={styles.cardDescription}>Seleccione el semestre para la asignación</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ position: 'relative', width: '320px' }}>
                                    <select
                                        value={selectedSemesterId}
                                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 16px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            fontWeight: '700',
                                            color: '#374151',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            outline: 'none'
                                        }}
                                    >
                                        {allSemesters.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {s.is_active ? "(Actual)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <FaChevronDown style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        pointerEvents: 'none'
                                    }} />
                                </div>
                                {semester?.is_active && (
                                    <div className={styles.semesterBadge}>
                                        <FaCheckCircle />
                                        <span>Semestre activo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card: Estudiantes Table */}
                        <div className={styles.tableCard}>
                            <div className={styles.tableHeader}>
                                <h3 className={styles.cardTitle}>Estudiantes sin Tutor Asignado</h3>
                                <p className={styles.cardDescription} style={{ marginBottom: 0 }}>
                                    Marque los estudiantes que desea asignar ({students.length} disponibles)
                                </p>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '64px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={students.length > 0 && selectedStudents.length === students.length}
                                                    className={styles.checkbox}
                                                />
                                            </th>
                                            <th>Código</th>
                                            <th>Nombre Completo</th>
                                            <th>Semestre Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((s) => (
                                            <tr
                                                key={s.id}
                                                className={selectedStudents.includes(s.id) ? styles.selectedRow : ""}
                                                onClick={() => handleSelectStudent(s.id)}
                                                style={{ cursor: 'pointer', borderBottom: '1px solid #f8fafc' }}
                                            >
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.includes(s.id)}
                                                        readOnly
                                                        className={styles.checkbox}
                                                    />
                                                </td>
                                                <td style={{ color: '#2563eb', fontWeight: '600' }}>{s.code}</td>
                                                <td style={{ color: '#374151', fontWeight: '500' }}>{s.first_name} {s.last_name}</td>
                                                <td style={{ color: '#6b7280' }}>{s.cycle || "N/A"}</td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                                                    No hay estudiantes disponibles
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.footerActions}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>
                                    {selectedStudents.length} estudiante(s) seleccionado(s)
                                </p>
                                <button
                                    onClick={handleAssignNext}
                                    disabled={selectedStudents.length === 0}
                                    className={styles.primaryButton}
                                    style={{ padding: '12px 32px' }}
                                >
                                    Siguiente Paso
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Selected Tutor Panel (Always visible if selected) */}
                        <div className={styles.card} style={{ border: '2px solid #3b82f6', backgroundColor: '#eff6ff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 className={styles.cardTitle} style={{ margin: 0 }}>Paso 2: Seleccionar Tutor</h3>
                                <button onClick={handleBack} className={styles.secondaryButton} style={{ fontSize: '11px' }}>
                                    <FaArrowLeft /> Volver al Paso 1
                                </button>
                            </div>

                            <p className={styles.cardDescription}>Seleccione el tutor para realizar la asignación de {selectedStudents.length} estudiantes.</p>

                            <div className={styles.inputWrapper} style={{ marginBottom: '20px' }}>
                                <div className={styles.inputIcon}><FaSearch /></div>
                                <input
                                    type="text"
                                    placeholder="Filtrar tutores por nombre o código..."
                                    className={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className={styles.tableContainer} style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Selección</th>
                                            <th>Código</th>
                                            <th>Nombre Completo</th>
                                            <th>Tutorados</th>
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
                                                        onChange={() => { }} // Controlled via row click
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td style={{ color: '#2563eb', fontWeight: 700 }}>{t.code}</td>
                                                <td style={{ fontWeight: 600 }}>{t.first_name} {t.last_name}</td>
                                                <td style={{ color: '#2563eb' }}>{t.student_count || 0}</td>
                                            </tr>
                                        ))}
                                        {tutors.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                                                    {loading ? "Cargando..." : "No se encontraron tutores"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {selectedTutor && (
                                <div className={styles.selectedTutorPanel} style={{ marginTop: '20px', borderLeft: '4px solid #2563eb', backgroundColor: '#f0f7ff' }}>
                                    <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px' }}>Tutor Seleccionado:</h4>
                                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{selectedTutor.first_name} {selectedTutor.last_name} ({selectedTutor.code})</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Programación de Asignación</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>FECHA</label>
                                    <input
                                        type="date"
                                        className={styles.searchInput}
                                        value={assignmentDate}
                                        onChange={(e) => setAssignmentDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>HORA</label>
                                    <input
                                        type="time"
                                        className={styles.searchInput}
                                        value={assignmentTime}
                                        onChange={(e) => setAssignmentTime(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <button
                                onClick={handleAssignFinal}
                                disabled={!selectedTutor || !assignmentDate || !assignmentTime || loading}
                                className={styles.primaryButton}
                                style={{ width: '100%', maxWidth: '400px', height: '56px', fontSize: '16px' }}
                            >
                                {loading ? "Procesando..." : `Confirmar Asignación de ${selectedStudents.length} Estudiantes`}
                            </button>
                        </div>
                    </>
                )}

                {/* Message Overlay */}
                {message && (
                    <div className={styles.toast}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#16a34a' : '#dc2626'
                        }}>
                            {message.type === 'success' ? <FaCheckCircle style={{ fontSize: '24px' }} /> : <FaInfoCircle style={{ fontSize: '24px' }} />}
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937', margin: 0 }}>{message.type === 'success' ? '¡Éxito!' : 'Oops...'}</h4>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px', margin: 0 }}>{message.text}</p>
                        </div>
                        <button onClick={() => setMessage(null)} style={{ marginLeft: '16px', color: '#d1d5db', background: 'none', border: 'none', fontSize: '24px', fontWeight: 300, cursor: 'pointer' }}>×</button>
                    </div>
                )}
            </main>
        </div>
    );
}

