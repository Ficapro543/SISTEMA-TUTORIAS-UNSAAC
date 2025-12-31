import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch, FaCheckCircle, FaInfoCircle,
    FaUsers, FaArrowRight, FaExchangeAlt
} from "react-icons/fa";
import {
    getActiveSemester, getSemesters, getTutors,
    getStudentsByTutor, transferStudents
} from "../../services/assignmentService";
import styles from "../../styles/components/AsignacionTutorados.module.css";

export default function CambioTutorados() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allSemesters, setAllSemesters] = useState([]);
    const [selectedSemesterId, setSelectedSemesterId] = useState("");
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
                setSelectedSemesterId(activeSem.id);
            } else if (sems.length > 0) {
                setSelectedSemesterId(sems[0].id);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando datos: " + err.message });
        } finally {
            setLoading(false);
        }
    }

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

        if (!window.confirm(`¿Confirmar transferencia de ${selectedStudentIds.length} estudiantes de ${tutorOrigen.first_name} a ${tutorDestino.first_name}?`)) {
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
            loadOriginStudents();
            const updatedTutors = await getTutors("");
            setTutores(updatedTutors);
            setTutorOrigen(updatedTutors.find(t => t.id === tutorOrigen.id));
            setTutorDestino(updatedTutors.find(t => t.id === tutorDestino.id));

        } catch (err) {
            setMessage({ type: "error", text: "Error en la transferencia: " + err.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle} style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                    <FaExchangeAlt style={{ marginRight: '12px', color: '#3b82f6' }} />
                    Transferencia de Tutorados
                </h2>
                <p className={styles.sectionDescription} style={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Reasigne estudiantes entre tutores para el semestre seleccionado.
                </p>
            </div>

            <div className={styles.card} style={{ marginBottom: '24px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className={styles.cardTitle} style={{ marginBottom: '4px' }}>Semestre Académico</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Seleccione el semestre</p>
                    </div>
                    <select
                        value={selectedSemesterId}
                        onChange={(e) => setSelectedSemesterId(e.target.value)}
                        className={styles.searchInput}
                        style={{ 
                            width: '320px', 
                            padding: '12px 16px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px'
                        }}
                    >
                        {allSemesters.map(s => (
                            <option key={s.id} value={s.id}>{s.name} {s.is_active ? "✓ Actual" : ""}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'start' }}>
                <div className={styles.card} style={{ border: tutorOrigen ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: '#dbeafe', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: '#1e40af'
                        }}>1</div>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Tutor Origen</h3>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar tutor..."
                            value={searchOrigen}
                            onChange={(e) => setSearchOrigen(e.target.value)}
                            className={styles.searchInput}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        {filteredTutoresOrigen.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                                <FaUsers size={32} style={{ opacity: 0.3 }} />
                                <p>No hay tutores</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <tbody>
                                    {filteredTutoresOrigen.map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => setTutorOrigen(t)}
                                            style={{ 
                                                cursor: 'pointer', 
                                                backgroundColor: tutorOrigen?.id === t.id ? '#dbeafe' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px' }}>
                                                {t.first_name} {t.last_name}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.code}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '12px' }}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>
                                                    {t.student_count} est.
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
                    <FaArrowRight size={32} color={tutorOrigen && tutorDestino ? '#3b82f6' : '#cbd5e1'} />
                </div>

                <div className={styles.card} style={{ border: tutorDestino ? '2px solid #10b981' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: '#d1fae5', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: '#065f46'
                        }}>2</div>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>Tutor Destino</h3>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar tutor..."
                            value={searchDestino}
                            onChange={(e) => setSearchDestino(e.target.value)}
                            className={styles.searchInput}
                            style={{ width: '100%', paddingLeft: '40px' }}
                        />
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        {filteredTutoresDestino.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                                <FaUsers size={32} style={{ opacity: 0.3 }} />
                                <p>No hay tutores</p>
                            </div>
                        ) : (
                            <table className={styles.table}>
                                <tbody>
                                    {filteredTutoresDestino.map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => setTutorDestino(t)}
                                            style={{ 
                                                cursor: 'pointer', 
                                                backgroundColor: tutorDestino?.id === t.id ? '#d1fae5' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '12px' }}>
                                                {t.first_name} {t.last_name}
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.code}</div>
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '12px' }}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.875rem' }}>
                                                    {t.student_count} est.
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

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
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map(s => (
                                    <tr key={s.id} onClick={() => toggleStudent(s.id)} style={{ cursor: 'pointer', backgroundColor: selectedStudentIds.includes(s.id) ? '#f0f9ff' : 'transparent' }}>
                                        <td><input type="checkbox" checked={selectedStudentIds.includes(s.id)} readOnly /></td>
                                        <td>{s.code}</td>
                                        <td>{s.first_name} {s.last_name}</td>
                                        <td>{s.cycle || "N/A"}</td>
                                    </tr>
                                ))}
                                {estudiantes.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay estudiantes</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(tutorOrigen && tutorDestino) && (
                <div style={{ 
                    marginTop: '24px', 
                    backgroundColor: '#eff6ff', 
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem', fontWeight: '700' }}>
                                <FaCheckCircle style={{ marginRight: '8px' }} />
                                Resumen
                            </h4>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#475569' }}>
                                Transferir <strong>{selectedStudentIds.length}</strong> estudiantes de{' '}
                                <strong>{tutorOrigen.first_name} {tutorOrigen.last_name}</strong> a{' '}
                                <strong>{tutorDestino.first_name} {tutorDestino.last_name}</strong>
                            </p>
                        </div>
                        <button
                            onClick={handleTransfer}
                            disabled={selectedStudentIds.length === 0 || isProcessing}
                            style={{
                                padding: '14px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: selectedStudentIds.length === 0 || isProcessing ? '#cbd5e1' : '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: selectedStudentIds.length === 0 || isProcessing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FaExchangeAlt /> {isProcessing ? "Procesando..." : "Confirmar"}
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '20px', 
                    right: '20px', 
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
                    color: message.type === 'success' ? '#166534' : '#991b1b', 
                    border: `2px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    zIndex: 1000
                }}>
                    {message.type === 'success' ? <FaCheckCircle size={20} /> : <FaInfoCircle size={20} />}
                    <span style={{ fontWeight: '500' }}>{message.text}</span>
                    <button 
                        onClick={() => setMessage(null)} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'currentColor', 
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >×</button>
                </div>
            )}
        </div>
    );
}
