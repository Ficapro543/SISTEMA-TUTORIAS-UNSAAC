import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch, FaCheckCircle, FaHome, FaSignOutAlt, FaInfoCircle,
    FaChevronDown, FaUsers, FaArrowRight, FaExchangeAlt, FaHistory
} from "react-icons/fa";
import {
    getActiveSemester, getSemesters, getTutors,
    getStudentsByTutor, transferStudents
} from "../../services/assignmentService";
import styles from "../../styles/components/AsignacionTutorados.module.css";

export default function CambioTutorados() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [allSemesters, setAllSemesters] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState("");
    const [semester, setSemester] = useState(null);

    const [tutores, setTutores] = useState([]);
    const [tutorOrigen, setTutorOrigen] = useState(null);
    const [tutorDestino, setTutorDestino] = useState(null);

    const [searchOrigen, setSearchOrigen] = useState("");
    const [searchDestino, setSearchDestino] = useState("");

    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const rolesStr = localStorage.getItem("userRoles");
        if (rolesStr) {
            const roles = JSON.parse(rolesStr);
            if (roles.administrador) {
                setIsAdmin(true);
                loadInitialData();
            }
        } else {
            navigate("/login");
        }
    }, [navigate]);

    async function loadInitialData() {
        try {
            setLoading(true);
            const activeSem = await getActiveSemester();
            const sems = await getSemesters();
            const tutorsList = await getTutors("");

            setAllSemesters(sems);
            setTutores(tutorsList);

            if (activeSem) {
                setSemester(activeSem);
                setSelectedSemesterId(activeSem.id);
            } else if (sems.length > 0) {
                setSemester(sems[0]);
                setSelectedSemesterId(sems[0].id);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando datos: " + err.message });
        } finally {
            setLoading(false);
        }
    }

    // Al cambiar tutor origen, cargar sus estudiantes
    useEffect(() => {
        if (tutorOrigen && selectedSemesterId) {
            loadOriginStudents();
        } else {
            setEstudiantes([]);
        }
    }, [tutorOrigen, selectedSemesterId]);

    async function loadOriginStudents() {
        try {
            const data = await getStudentsByTutor(tutorOrigen.id, selectedSemesterId);
            setEstudiantes(data);
            setSelectedStudentIds([]);
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando estudiantes: " + err.message });
        }
    }

    const filteredTutoresOrigen = tutores.filter(t =>
        (t.first_name + " " + t.last_name + " " + t.code).toLowerCase().includes(searchOrigen.toLowerCase())
    );

    const filteredTutoresDestino = tutores.filter(t =>
        t.id !== tutorOrigen?.id &&
        (t.first_name + " " + t.last_name + " " + t.code).toLowerCase().includes(searchDestino.toLowerCase())
    );

    const handleSelectAll = () => {
        if (selectedStudentIds.length === estudiantes.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(estudiantes.map(s => s.id));
        }
    };

    const toggleStudent = (id) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const handleTransfer = async () => {
        if (!tutorOrigen || !tutorDestino || selectedStudentIds.length === 0) {
            setMessage({ type: "error", text: "Seleccione tutores y al menos un estudiante." });
            return;
        }

        if (!confirm(`¿Confirmar transferencia de ${selectedStudentIds.length} estudiantes de ${tutorOrigen.first_name} a ${tutorDestino.first_name}?`)) {
            return;
        }

        try {
            setIsProcessing(true);
            await transferStudents({
                originTutorId: tutorOrigen.id,
                destinationTutorId: tutorDestino.id,
                studentIds: selectedStudentIds,
                semesterId: selectedSemesterId
            });

            setMessage({ type: "success", text: "Transferencia completada correctamente." });

            // Recargar datos
            loadOriginStudents();
            const updatedTutors = await getTutors("");
            setTutores(updatedTutors);

            // Actualizar referencias de tutores seleccionados para ver contadores actualizados
            setTutorOrigen(updatedTutors.find(t => t.id === tutorOrigen.id));
            setTutorDestino(updatedTutors.find(t => t.id === tutorDestino.id));

        } catch (err) {
            setMessage({ type: "error", text: "Error en la transferencia: " + err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.headerSubtitle} style={{ fontSize: '14px', margin: 0 }}>Módulo Administrador</span>
                </div>
                <div className={styles.headerRight}>
                    <button onClick={() => navigate("/admin")} className={styles.navButton}><FaHome /> Inicio</button>
                    <button onClick={() => { localStorage.removeItem("userRoles"); navigate("/login"); }} className={styles.navButton}><FaSignOutAlt /> Salir</button>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Transferencia de Tutorados</h2>
                    <p className={styles.sectionDescription}>Reasigne estudiantes entre tutores para el semestre seleccionado.</p>
                </div>

                {/* Semestre */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Semestre</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <select
                            value={selectedSemesterId}
                            onChange={(e) => setSelectedSemesterId(e.target.value)}
                            className={styles.searchInput}
                            style={{ width: '320px' }}
                        >
                            {allSemesters.map(s => (
                                <option key={s.id} value={s.id}>{s.name} {s.is_active ? "(Actual)" : ""}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Tutor Origen */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>1. Tutor Origen</h3>
                        <div className={styles.inputWrapper}>
                            <FaSearch className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Buscar tutor origen..."
                                value={searchOrigen}
                                onChange={(e) => setSearchOrigen(e.target.value)}
                                className={styles.searchInput}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <table className={styles.table}>
                                <tbody>
                                    {filteredTutoresOrigen.map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => setTutorOrigen(t)}
                                            style={{ cursor: 'pointer', backgroundColor: tutorOrigen?.id === t.id ? '#eff6ff' : 'transparent' }}
                                        >
                                            <td style={{ padding: '8px' }}>{t.first_name} {t.last_name} ({t.code})</td>
                                            <td style={{ textAlign: 'right', padding: '8px', color: '#64748b' }}>{t.student_count} tut.</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tutor Destino */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>2. Tutor Destino</h3>
                        <div className={styles.inputWrapper}>
                            <FaSearch className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Buscar tutor destino..."
                                value={searchDestino}
                                onChange={(e) => setSearchDestino(e.target.value)}
                                className={styles.searchInput}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <table className={styles.table}>
                                <tbody>
                                    {filteredTutoresDestino.map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => setTutorDestino(t)}
                                            style={{ cursor: 'pointer', backgroundColor: tutorDestino?.id === t.id ? '#eff6ff' : 'transparent' }}
                                        >
                                            <td style={{ padding: '8px' }}>{t.first_name} {t.last_name} ({t.code})</td>
                                            <td style={{ textAlign: 'right', padding: '8px', color: '#64748b' }}>{t.student_count} tut.</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Estudiantes del Tutor Origen */}
                {tutorOrigen && (
                    <div className={styles.tableCard} style={{ marginTop: '24px' }}>
                        <div className={styles.tableHeader}>
                            <h3 className={styles.cardTitle}>Estudiantes de {tutorOrigen.first_name}</h3>
                            <p className={styles.cardDescription}>Seleccione los estudiantes a transferir</p>
                        </div>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>
                                            <input type="checkbox" checked={estudiantes.length > 0 && selectedStudentIds.length === estudiantes.length} onChange={handleSelectAll} />
                                        </th>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Ciclo</th>
                                        <th>Tutorías</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantes.map(s => (
                                        <tr key={s.id} onClick={() => toggleStudent(s.id)} style={{ cursor: 'pointer', backgroundColor: selectedStudentIds.includes(s.id) ? '#f0f9ff' : 'transparent' }}>
                                            <td><input type="checkbox" checked={selectedStudentIds.includes(s.id)} readOnly /></td>
                                            <td>{s.code}</td>
                                            <td>{s.first_name} {s.last_name}</td>
                                            <td>{s.cycle || "N/A"}</td>
                                            <td>{s.tutorias_count}</td>
                                        </tr>
                                    ))}
                                    {estudiantes.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No hay estudiantes asignados.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Resumen y Acción */}
                {(tutorOrigen && tutorDestino) && (
                    <div className={styles.card} style={{ marginTop: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#1e293b' }}>Resumen de Transferencia</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                                    Transferir <strong>{selectedStudentIds.length}</strong> estudiantes de <strong>{tutorOrigen.first_name}</strong> a <strong>{tutorDestino.first_name}</strong>.
                                </p>
                            </div>
                            <button
                                onClick={handleTransfer}
                                disabled={selectedStudentIds.length === 0 || isProcessing}
                                className={styles.primaryButton}
                                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaExchangeAlt /> {isProcessing ? "Procesando..." : "Confirmar Transferencia"}
                            </button>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={styles.toast} style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', border: '1px solid currentColor' }}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', color: 'currentColor', marginLeft: '10px', cursor: 'pointer' }}>×</button>
                    </div>
                )}
            </main>
        </div>
    );
}
