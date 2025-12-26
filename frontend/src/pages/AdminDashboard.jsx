import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaColumns, FaProjectDiagram, FaFileAlt, FaChartLine,
    FaUsers, FaCalendarAlt, FaChalkboardTeacher, FaCommentDots,
    FaSearch, FaBell, FaQuestionCircle, FaCog, FaSignOutAlt,
    FaClipboardList, FaArrowLeft, FaCheck, FaTimes, FaInbox
} from "react-icons/fa";
import { getDashboardStats } from "../services/assignmentService";
import { getPendingRequests, getRequestDetail, approveRequest, rejectRequest } from "../services/adminService";
import styles from "../styles/components/AdminDashboard.module.css";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [view, setView] = useState("dashboard"); // dashboard, requests, request-detail
    const [stats, setStats] = useState({
        tutorings: 0,
        students: 0,
        tutors: 0,
        pending: 0
    });
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [tempRoles, setTempRoles] = useState([]); // Moved out of render function
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const rolesStr = localStorage.getItem("userRoles");
        if (!rolesStr) {
            navigate("/login");
            return;
        }
        const roles = JSON.parse(rolesStr);
        if (!roles.administrador) {
            navigate("/mainpage");
            return;
        }

        fetchStats();
    }, [navigate]);

    useEffect(() => {
        if (view === "requests") {
            fetchRequests();
        }
    }, [view]);

    async function fetchStats() {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchRequests() {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching pending requests...");
            const data = await getPendingRequests();
            console.log("Requests received:", data);
            setRequests(data);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("No se pudieron cargar las solicitudes. " + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleViewDetail(id) {
        try {
            const data = await getRequestDetail(id);
            setSelectedRequest(data);
            setTempRoles(data.roles || []); // Initialize tempRoles here
            setView("request-detail");
        } catch (err) {
            console.error("Error fetching request detail:", err);
        }
    }

    async function handleApprove(id, roles) {
        if (!window.confirm("¿Seguro que deseas aprobar este usuario?")) return;
        try {
            await approveRequest(id, roles);
            alert("Usuario aprobado con éxito. Se ha enviado un correo de activación.");
            setView("requests");
        } catch (err) {
            alert("Error al aprobar: " + err.message);
        }
    }

    async function handleReject(id) {
        if (!window.confirm("¿Seguro que deseas rechazar esta solicitud? Esto la eliminará permanentemente.")) return;
        try {
            await rejectRequest(id);
            alert("Solicitud rechazada.");
            setView("requests");
        } catch (err) {
            alert("Error al rechazar: " + err.message);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("userRoles");
        navigate("/login");
    };

    const renderDashboard = () => (
        <>
            {/* Welcome Banner */}
            <div className={styles.welcomeBanner}>
                <h1 className={styles.bannerTitle}>¡Bienvenido!</h1>
                <p className={styles.bannerText}>Estas en la plataforma de tutorias de la unsaac</p>
                <div className={styles.bannerDecoration}></div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper}>
                        <FaFileAlt />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Tutorias realizadas</span>
                        <span className={styles.statValue}>{loading ? "..." : stats.tutorings}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: '#fff5f5', color: '#f87171' }}>
                        <FaCalendarAlt />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Pendientes por atender</span>
                        <span className={styles.statValue}>{loading ? "..." : stats.pending}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#4ade80' }}>
                        <FaUsers />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Estudiantes totales</span>
                        <span className={styles.statValue}>{loading ? "..." : stats.students}</span>
                    </div>
                </div>

                <div className={styles.statCard} style={{ cursor: 'pointer', border: '1px solid #dbeafe' }} onClick={() => navigate("/asignaciones")}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        <FaProjectDiagram />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Asignación de Tutores</span>
                        <span className={styles.statValue} style={{ fontSize: '1.25rem' }}>Ir al módulo</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ backgroundColor: '#fefce8', color: '#facc15' }}>
                        <FaChalkboardTeacher />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Docentes Activos</span>
                        <span className={styles.statValue}>{loading ? "..." : stats.tutors}</span>
                    </div>
                </div>
            </div>
        </>
    );

    const renderRequests = () => (
        <div className={styles.contentView}>
            <div className={styles.viewHeader}>
                <div className={styles.viewTitleGroup}>
                    <FaClipboardList className={styles.viewIcon} />
                    <h2 className={styles.viewTitle}>Lista de solicitudes</h2>
                </div>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontWeight: 'bold' }}>
                    {error}
                </div>
            )}

            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.emptyState}>Cargando solicitudes...</div>
                ) : requests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaInbox className={styles.emptyIcon} />
                        <p>No hay solicitudes de registro pendientes en este momento.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nombres y apellidos</th>
                                    <th>Correo</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(req => (
                                    <tr key={req.id}>
                                        <td style={{ fontWeight: '600' }}>{req.first_name} {req.last_name}</td>
                                        <td>{req.email}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                                Pendiente
                                            </span>
                                        </td>
                                        <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className={styles.detailBtn}
                                                onClick={() => handleViewDetail(req.id)}
                                            >
                                                Detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderRequestDetail = () => {
        if (!selectedRequest) return null;

        const toggleRole = (role) => {
            if (tempRoles.includes(role)) {
                setTempRoles(tempRoles.filter(r => r !== role));
            } else {
                setTempRoles([...tempRoles, role]);
            }
        };

        const handleConfirm = () => {
            if (tempRoles.length === 0) {
                if (!window.confirm("No has seleccionado ningún rol. ¿Deseas rechazar la solicitud completa?")) return;
                handleReject(selectedRequest.id);
            } else {
                handleApprove(selectedRequest.id, tempRoles);
            }
        };

        return (
            <div className={styles.contentView}>
                <button className={styles.backBtn} onClick={() => setView("requests")}>
                    <FaArrowLeft /> Volver a Solicitudes
                </button>

                <div className={styles.detailHeader}>
                    <h2 className={styles.userName}>Solicitudes de {selectedRequest.first_name}</h2>
                </div>

                <div className={styles.detailCard}>
                    <div className={styles.userInfoRow}>
                        <span className={styles.infoLabel}>Nombre completo:</span>
                        <span className={styles.infoValue}>{selectedRequest.first_name} {selectedRequest.last_name}</span>
                    </div>
                    <div className={styles.userInfoRow}>
                        <span className={styles.infoLabel}>Correo:</span>
                        <span className={styles.infoValue}>{selectedRequest.email}</span>
                    </div>
                    <div className={styles.userInfoRow} style={{ border: 'none' }}>
                        <span className={styles.infoLabel}>Fecha de solicitud:</span>
                        <span className={styles.infoValue}>{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className={styles.rolesGrid}>
                        {['tutor', 'verificador', 'administrador'].map(dbRole => {
                            const roleLabel = dbRole === 'verificador' ? 'Evaluador' : dbRole.charAt(0).toUpperCase() + dbRole.slice(1);
                            const hasRequested = selectedRequest.roles.includes(dbRole);
                            const isAccepted = tempRoles.includes(dbRole);

                            if (!hasRequested) return null;

                            return (
                                <div key={dbRole} className={styles.roleRow}>
                                    <div className={styles.roleInfo}>
                                        {dbRole === 'tutor' && <FaChalkboardTeacher />}
                                        {dbRole === 'verificador' && <FaCheck />}
                                        {dbRole === 'administrador' && <FaUsers />}
                                        {roleLabel}
                                    </div>
                                    <div className={styles.roleActions}>
                                        <button
                                            className={`${styles.actionBtn} ${isAccepted ? styles.acceptBtn : ''}`}
                                            onClick={() => !isAccepted && toggleRole(dbRole)}
                                            style={{ backgroundColor: isAccepted ? '#bbf7d0' : '#f1f5f9' }}
                                        >
                                            <FaCheck /> Aceptar
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${!isAccepted ? styles.rejectBtn : ''}`}
                                            onClick={() => isAccepted && toggleRole(dbRole)}
                                            style={{ backgroundColor: !isAccepted ? '#fecaca' : '#f1f5f9' }}
                                        >
                                            <FaTimes /> Rechazar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.footerActions}>
                        <button
                            className={styles.confirmBtn}
                            onClick={() => setTempRoles(selectedRequest.roles)}
                            style={{ backgroundColor: '#f1f5f9', color: '#1e293b', marginRight: '10px' }}
                        >
                            Editar
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.acceptBtn}`}
                            onClick={() => setTempRoles(selectedRequest.roles)}
                            style={{ padding: '12px 24px', backgroundColor: '#bbf7d0' }}
                        >
                            <FaCheck /> Aceptar todo
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            onClick={() => setTempRoles([])}
                            style={{ padding: '12px 24px', backgroundColor: '#fecaca' }}
                        >
                            <FaTimes /> Rechazar todo
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                        <button
                            className={styles.confirmBtn}
                            onClick={handleConfirm}
                            style={{ width: '100%', maxWidth: '400px' }}
                        >
                            Confirmar selección
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.dashboardLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}>A</div>
                        <span className={styles.rolesText}>Administrador</span>
                    </div>
                </div>

                <div className={styles.sidebarSection}>
                    <h3 className={styles.sectionTitle}>Navegador</h3>
                    <nav className={styles.navMenu}>
                        <div
                            className={`${styles.navItem} ${view === "dashboard" ? styles.navItemActive : ""}`}
                            onClick={() => setView("dashboard")}
                        >
                            <FaColumns /> Dashboard
                        </div>
                        <div className={styles.navItem} onClick={() => navigate("/asignaciones")}>
                            <FaProjectDiagram /> Asignación Tutores
                        </div>
                        <div className={styles.navItem}>
                            <FaCommentDots /> Notes
                        </div>
                        <div className={styles.navItem}>
                            <FaFileAlt /> Files
                        </div>
                        <div className={styles.navItem}>
                            <FaChartLine /> Chats
                        </div>
                        <div className={styles.navItem}>
                            <FaInbox /> Mail
                        </div>
                        <div
                            className={`${styles.navItem} ${view === "requests" || view === "request-detail" ? styles.navItemActive : ""}`}
                            onClick={() => setView("requests")}
                        >
                            <FaClipboardList /> Solicitudes
                        </div>
                        <div className={styles.navItem}>
                            <FaCalendarAlt /> Calendar
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.mainContainer}>
                {/* Top Header */}
                <header className={styles.topHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.searchWrapper}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Buscar ..."
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <FaBell className={styles.iconButton} />
                        <FaQuestionCircle className={styles.iconButton} />
                        <FaCog className={styles.iconButton} />

                        <div className={styles.profileArea}>
                            <img
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop"
                                alt="Profile"
                                className={styles.profilePic}
                            />
                            <button onClick={handleLogout} className={styles.logoutBtn}>
                                <FaSignOutAlt /> Cerrar sesión
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard / Requests View */}
                <main className={styles.contentView} style={{ padding: '0' }}>
                    {view === "dashboard" && <div style={{ padding: '32px' }}>{renderDashboard()}</div>}
                    {view === "requests" && renderRequests()}
                    {view === "request-detail" && renderRequestDetail()}
                </main>
            </div>
        </div>
    );
}
