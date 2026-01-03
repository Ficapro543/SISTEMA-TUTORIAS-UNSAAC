import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch, FaCheckCircle, FaInfoCircle,
    FaUsers, FaArrowRight, FaExchangeAlt, FaExclamationTriangle
} from "react-icons/fa";
import {
    getActiveSemester, getSemesters, getTutors,
    getStudentsByTutor, transferStudents, transferAllStudents
} from "@/services/assignmentService";
import styles from "@/styles/pages/admin/AsignacionTutorados.module.css";

export default function CambioTutorados() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeSemester, setActiveSemester] = useState(null);
    const [tutores, setTutores] = useState([]);
    const [tutorOrigen, setTutorOrigen] = useState(null);
    const [tutorDestino, setTutorDestino] = useState(null);
    const [searchOrigen, setSearchOrigen] = useState("");
    const [searchDestino, setSearchDestino] = useState("");
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isMassiveMode, setIsMassiveMode] = useState(false);

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

            // Obtener el último semestre activo (ordenados por ID descendente)
            const lastActiveSem = activeSem || (sems.length > 0 ? sems[0] : null);
            
            if (lastActiveSem) {
                setActiveSemester(lastActiveSem);
                const tutorsList = await getTutors("", lastActiveSem.id);
                setTutores(tutorsList);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Error cargando datos: " + err.message });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (tutorOrigen && activeSemester) {
            loadOriginStudents();
        } else {
            setEstudiantes([]);
        }
    }, [tutorOrigen, activeSemester]);



    useEffect(() => {
        // Si modo masivo está activo, seleccionar todos automáticamente
        if (isMassiveMode && estudiantes.length > 0) {
            setSelectedStudentIds(estudiantes.map(s => s.id));
        } else if (!isMassiveMode) {
            setSelectedStudentIds([]);
        }
    }, [isMassiveMode, estudiantes]);

    async function loadOriginStudents() {
        try {
            const data = await getStudentsByTutor(tutorOrigen.id, activeSemester.id);
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

    const handleTransfer = () => {
        if (!tutorOrigen || !tutorDestino || selectedStudentIds.length === 0) {
            setMessage({ type: "error", text: "Seleccione tutores y al menos un estudiante." });
            return;
        }
        setShowConfirmModal(true);
    };

    const confirmTransfer = async () => {
        try {
            setIsProcessing(true);
            setShowConfirmModal(false);
            
            if (isMassiveMode) {
                // Modo masivo: transferir todos
                await transferAllStudents({
                    originTutorId: tutorOrigen.id,
                    destinationTutorId: tutorDestino.id,
                    semesterId: activeSemester.id
                });
                setMessage({ type: "success", text: `Transferencia masiva completada: ${selectedStudentIds.length} estudiantes.` });
            } else {
                // Modo individual: transferir seleccionados
                await transferStudents({
                    originTutorId: tutorOrigen.id,
                    destinationTutorId: tutorDestino.id,
                    studentIds: selectedStudentIds,
                    semesterId: activeSemester.id
                });
                setMessage({ type: "success", text: "Transferencia completada correctamente." });
            }

            loadOriginStudents();
            const updatedTutors = await getTutors("", activeSemester.id);
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

            <div className={styles.card} style={{ marginBottom: '24px', backgroundColor: '#f8fafc', border: '2px solid #3b82f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 className={styles.cardTitle} style={{ marginBottom: '4px' }}>Semestre Académico</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Trabajando con el semestre activo</p>
                    </div>
                    <div style={{ 
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1e40af',
                        backgroundColor: '#dbeafe',
                        border: '2px solid #3b82f6',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FaInfoCircle />
                        {activeSemester ? activeSemester.name : 'Cargando...'}
                    </div>
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
                    <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className={styles.cardTitle}>Estudiantes de {tutorOrigen.first_name}</h3>
                            <p className={styles.cardDescription}>
                                {isMassiveMode ? '⚠️ Modo masivo: Se transferirán TODOS los estudiantes' : 'Seleccione los estudiantes a transferir'}
                            </p>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            padding: '12px 16px',
                            backgroundColor: isMassiveMode ? '#fef3c7' : '#f8fafc',
                            borderRadius: '8px',
                            border: isMassiveMode ? '2px solid #f59e0b' : '1px solid #e2e8f0'
                        }}>
                            <label style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                color: isMassiveMode ? '#92400e' : '#475569'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={isMassiveMode}
                                    onChange={(e) => setIsMassiveMode(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <FaExchangeAlt style={{ color: isMassiveMode ? '#dc2626' : '#64748b' }} />
                                Transferir TODOS
                            </label>
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={estudiantes.length > 0 && selectedStudentIds.length === estudiantes.length} 
                                            onChange={handleSelectAll}
                                            disabled={isMassiveMode}
                                        />
                                    </th>
                                    <th>Código</th>
                                    <th>Nombre Completo</th>
                                    <th>Tutorías registradas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map(s => (
                                    <tr 
                                        key={s.id} 
                                        onClick={() => !isMassiveMode && toggleStudent(s.id)} 
                                        style={{ 
                                            cursor: isMassiveMode ? 'not-allowed' : 'pointer', 
                                            backgroundColor: selectedStudentIds.includes(s.id) ? (isMassiveMode ? '#fef3c7' : '#f0f9ff') : 'transparent',
                                            opacity: isMassiveMode ? 0.8 : 1
                                        }}
                                    >
                                        <td><input type="checkbox" checked={selectedStudentIds.includes(s.id)} readOnly disabled={isMassiveMode} /></td>
                                        <td>{s.code}</td>
                                        <td>{s.first_name} {s.last_name}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ 
                                                backgroundColor: '#f1f5f9', 
                                                padding: '4px 12px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#475569'
                                            }}>
                                                {s.tutorias_count || 0}
                                            </span>
                                        </td>
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
                    backgroundColor: isMassiveMode ? '#fef3c7' : '#eff6ff', 
                    border: `2px solid ${isMassiveMode ? '#f59e0b' : '#3b82f6'}`,
                    borderRadius: '12px',
                    padding: '20px'
                }}>
                    {isMassiveMode && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            border: '2px solid #dc2626',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaExclamationTriangle color="#dc2626" size={20} />
                            <span style={{ fontWeight: '600', color: '#991b1b' }}>
                                Operación Masiva: Se transferirán TODOS los estudiantes del tutor origen
                            </span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ margin: 0, color: isMassiveMode ? '#92400e' : '#1e40af', fontSize: '1.1rem', fontWeight: '700' }}>
                                {isMassiveMode ? <FaExclamationTriangle style={{ marginRight: '8px' }} /> : <FaCheckCircle style={{ marginRight: '8px' }} />}
                                Resumen {isMassiveMode && '(Masivo)'}
                            </h4>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#475569' }}>
                                Transferir <strong style={{ fontSize: isMassiveMode ? '1.2rem' : '1rem', color: isMassiveMode ? '#dc2626' : 'inherit' }}>{selectedStudentIds.length}</strong> estudiantes de{' '}
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
                                backgroundColor: selectedStudentIds.length === 0 || isProcessing ? '#cbd5e1' : (isMassiveMode ? '#dc2626' : '#3b82f6'),
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: selectedStudentIds.length === 0 || isProcessing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isMassiveMode ? <FaExclamationTriangle /> : <FaExchangeAlt />} 
                            {isProcessing ? "Procesando..." : (isMassiveMode ? "Transferir Todos" : "Confirmar")}
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

            {showConfirmModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            marginBottom: '24px',
                            paddingBottom: '16px',
                            borderBottom: `2px solid ${isMassiveMode ? '#fee2e2' : '#e2e8f0'}`
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: isMassiveMode || selectedStudentIds.length > 5 ? '#fef3c7' : '#dbeafe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaExchangeAlt size={24} color={isMassiveMode || selectedStudentIds.length > 5 ? '#d97706' : '#3b82f6'} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: isMassiveMode ? '#dc2626' : '#1e293b' }}>
                                    Confirmar Transferencia{isMassiveMode && ' Masiva'}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                                    {isMassiveMode ? 'Esta es una operación masiva' : 'Revise los detalles antes de continuar'}
                                </p>
                            </div>
                        </div>

                        {(isMassiveMode || selectedStudentIds.length > 5) && (
                            <div style={{
                                backgroundColor: '#fef3c7',
                                border: '2px solid #fbbf24',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FaInfoCircle size={20} color="#d97706" />
                                <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
                                    {isMassiveMode 
                                        ? `Operación masiva: Se transferirán TODOS los ${selectedStudentIds.length} estudiantes`
                                        : `Operación masiva: está transfiriendo ${selectedStudentIds.length} estudiantes`
                                    }
                                </span>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tutor Origen</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                                    {tutorOrigen.first_name} {tutorOrigen.last_name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                                    Código: {tutorOrigen.code}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                <FaArrowRight size={24} color="#94a3b8" />
                            </div>

                            <div style={{
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '2px solid #22c55e'
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#15803d', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tutor Destino</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                                    {tutorDestino.first_name} {tutorDestino.last_name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>
                                    Código: {tutorDestino.code}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
                                <FaUsers style={{ marginRight: '8px' }} />
                                Estudiantes seleccionados ({selectedStudentIds.length})
                            </div>
                            <div style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto',
                                backgroundColor: '#ffffff',
                                borderRadius: '6px',
                                padding: '8px'
                            }}>
                                {estudiantes
                                    .filter(s => selectedStudentIds.includes(s.id))
                                    .map(s => (
                                        <div key={s.id} style={{
                                            padding: '8px 12px',
                                            borderBottom: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                                                    {s.first_name} {s.last_name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {s.code}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#64748b',
                                                backgroundColor: '#f1f5f9',
                                                padding: '4px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {s.tutorias_count || 0} tutorías
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            fontSize: '0.875rem',
                            color: '#1e40af'
                        }}>
                            <FaInfoCircle style={{ marginRight: '8px' }} />
                            El historial de tutorías registradas se mantendrá intacto
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmTransfer}
                                style={{
                                    padding: '12px 32px',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FaExchangeAlt />
                                Confirmar transferencia
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
