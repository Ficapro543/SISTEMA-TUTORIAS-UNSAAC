import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCog, FaBook, FaFolderOpen, FaArrowRight,
    FaCalendarAlt, FaClock, FaUserCircle, FaHashtag, FaEnvelope, FaCheckCircle,
    FaUserCheck, FaProjectDiagram, FaFileAlt, FaCaretDown, FaCaretUp, FaSignOutAlt,
    FaExchangeAlt, FaShieldAlt, FaSearch, FaChalkboardTeacher
} from "react-icons/fa";
import styles from "../styles/pages/Dashboard.module.css";
// Admin Views
import AprobarRegistro from "./admin/NuevoValidarUsuarios";
import AsignacionTutorados from "./admin/AsignacionTutorados";
import CambioTutorados from "./admin/CambioTutorados";
import TutoriasHistoricas from "./admin/TutoriasHistoricas";
import Cronogramas from "./Cronogramas";

// Tutor Views
import NuevoTutorPanel from "./tutor/NuevoTutorPanel";

// Verifier Views
import VerifEstudiantesAtendidos from "../pages/verificador/VerifEstudiantesAtendidos";
import VerifConsultaTutorias from "../pages/verificador/VerifConsultaTutorias";
import VerifSeguimientoEstudiante from "../pages/verificador/VerifSeguimientoEstudiante";
import VerifSeguimientoTutor from "../pages/verificador/VerifSeguimientoTutor";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Navigation States
    const [activeTab, setActiveTab] = useState('inicio'); // 'inicio', 'admin', 'tutor', 'verificador'
    const [activeAdminTab, setActiveAdminTab] = useState('validar'); // 'validar', 'asignaciones', 'cambio', 'cronogramas', 'reportes','seguridad'
    const [activeTutorTab, setActiveTutorTab] = useState('tutorados'); // 'tutorados', 'sesiones', 'actividades'
    const [activeVerifierTab, setActiveVerifierTab] = useState('estudiantes'); // 'estudiantes', 'consulta', 'seguimiento_est', 'seguimiento_tut'

    const [showUserMenu, setShowUserMenu] = useState(false);

    // Mock data for user roles if not found in local storage (for dev)
    // In production, these should come strictly from localStorage

    useEffect(() => {
        // Load user data
        const storedUser = localStorage.getItem("user");
        const storedRoles = localStorage.getItem("userRoles");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedRoles) {
            const parsedRoles = JSON.parse(storedRoles);
            setRoles(Object.keys(parsedRoles).filter(key => parsedRoles[key]));
        } else {
            // Fallback for visual testing if no roles set (remove in production)
            // setRoles(['administrador', 'tutor']);
        }

        // Clock timer
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest(`.${styles.userInfo}`)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    // Format Date: "Martes, 30 De Diciembre De 2025"
    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options)
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Format Time: "10:12 a. m."
    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleAdminSubTabClick = (subTabName) => {
        setActiveAdminTab(subTabName);
    };

    const handleTutorSubTabClick = (subTabName) => {
        setActiveTutorTab(subTabName);
    };

    const handleVerifierSubTabClick = (subTabName) => {
        setActiveVerifierTab(subTabName);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("userRoles");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Helper to determine role display string
    const getRoleDisplay = () => {
        if (activeTab === 'inicio') return 'Usuario';
        if (activeTab === 'admin') return 'Administrador';
        if (activeTab === 'tutor') return 'Tutor';
        if (activeTab === 'verificador') return 'Verificador';
        return 'Usuario';
    }

    if (!user) {
        return <div style={{ padding: '20px' }}>Cargando perfil...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header with Logos and Title */}
            <header className={styles.mainHeader}>
                <img src="/logo_izquierdo.png" alt="Logo UNSAAC" className={styles.logoLeft} />
                <h1 className={styles.mainTitle}>SISTEMA DE TUTORÍAS UNSAAC</h1>
                <img src="/logo_derecho.png" alt="Logo Derecho" className={styles.logoRight} />
            </header>

            {/* Top Info Bar: Date/Time + User Profile */}
            <div className={styles.infoBar}>
                <div className={styles.dateInfo}>
                    <div className={styles.dateItem}>
                        <FaCalendarAlt color="#d97706" />
                        <span>{formatDate(currentTime)}</span>
                    </div>
                    <div className={styles.dateItem}>
                        <FaClock color="#d97706" />
                        <span>{formatTime(currentTime)}</span>
                    </div>
                </div>

                <div
                    className={styles.userInfo}
                    onClick={() => setShowUserMenu(prev => !prev)}
                >
                    <div className={styles.avatarCircle}>
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>
                            {user.first_name} {user.last_name}
                        </span>
                        <span className={styles.userCode}>
                            Cód. {user.code || "---"}
                        </span>
                    </div>
                    {showUserMenu ? <FaCaretUp color="#64748b" /> : <FaCaretDown color="#64748b" />}

                    {/* DROPDOWN MENU */}
                    {showUserMenu && (
                        <div className={styles.userMenuDropdown} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.dropdownHeader}>
                                <div className={styles.dropdownAvatar}>
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </div>
                                <div className={styles.dropdownUserInfo}>
                                    <span className={styles.dropdownName}>{user.first_name} {user.last_name}</span>
                                    <span className={styles.dropdownCode}>Código: {user.code || "---"}</span>
                                    <span className={styles.dropdownEmail}>{user.email}</span>
                                </div>
                            </div>
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownItem}>
                                    <FaCog color="#64748b" />
                                    <span>Configurar Información Personal</span>
                                </div>
                                <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                    <FaSignOutAlt style={{ transform: 'rotate(180deg)' }} />
                                    <span>Cerrar Sesión</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className={styles.navTabs}>
                <div
                    className={`${styles.tab} ${activeTab === 'inicio' ? styles.tabActive : ''}`}
                    onClick={() => handleTabClick('inicio')}
                >
                    <span>🏠 INICIO</span>
                </div>
                {roles.includes('administrador') && (
                    <div
                        className={`${styles.tab} ${activeTab === 'admin' ? styles.tabActive : ''}`}
                        onClick={() => handleTabClick('admin')}
                    >
                        <span>🛡️ ADMINISTRADOR</span>
                    </div>
                )}
                {roles.includes('tutor') && (
                    <div
                        className={`${styles.tab} ${activeTab === 'tutor' ? styles.tabActive : ''}`}
                        onClick={() => handleTabClick('tutor')}
                    >
                        <span>📖 TUTOR</span>
                    </div>
                )}
                {roles.includes('verificador') && (
                    <div
                        className={`${styles.tab} ${activeTab === 'verificador' ? styles.tabActive : ''}`}
                        onClick={() => handleTabClick('verificador')}
                    >
                        <span>📋 VERIFICADOR</span>
                    </div>
                )}
            </nav>

            {/* Welcome Banner */}
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeText}>
                    <h1>¡Bienvenido!</h1>
                    <h2>{user.first_name} {user.last_name}</h2>
                    <p className={styles.subtitle}>Accede a las herramientas del sistema de tutorías</p>
                </div>

                {/* Profile Card (Right side of banner) */}
                <div className={styles.profileCard}>
                    <div className={styles.cardRow}>
                        <div className={styles.iconContainer}>
                            <FaHashtag />
                        </div>
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Código</span>
                            <span className={styles.value}>{user.code || "No asignado"}</span>
                        </div>
                    </div>

                    <div className={styles.cardRow}>
                        <div className={styles.iconContainer}>
                            <FaEnvelope />
                        </div>
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Correo</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                    </div>

                    <div className={styles.cardRow}>
                        <div className={`${styles.iconContainer} ${styles.iconYellow}`}>
                            <FaCheckCircle />
                        </div>
                        <div className={styles.infoGroup}>
                            <span className={styles.label}>Rol Actual</span>
                            <span className={`${styles.value} ${styles.highlightValue}`}>
                                {getRoleDisplay()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Secondary Navigation */}
            {activeTab === 'admin' && (
                <div className={styles.secondaryNav}>
                    <div className={styles.subTabsContainer}>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'validar' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('validar')}
                        >
                            <FaUserCheck className={styles.subTabIcon} />
                            <span>Validar Usuarios</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'asignaciones' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('asignaciones')}
                        >
                            <FaProjectDiagram className={styles.subTabIcon} />
                            <span>Asignaciones</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'cambio' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('cambio')}
                        >
                            <FaExchangeAlt className={styles.subTabIcon} />
                            <span>Cambio de Tutor</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'cronogramas' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('cronogramas')}
                        >
                            <FaCalendarAlt className={styles.subTabIcon} />
                            <span>Cronogramas</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'reportes' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('reportes')}
                        >
                            <FaFileAlt className={styles.subTabIcon} />
                            <span>Reportes</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeAdminTab === 'seguridad' ? styles.subTabActive : ''}`}
                            onClick={() => handleAdminSubTabClick('seguridad')}
                        >
                            <FaShieldAlt className={styles.subTabIcon} />
                            <span>Seguridad</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Verificador Secondary Navigation */}
            {activeTab === 'verificador' && (
                <div className={styles.secondaryNav}>
                    <div className={styles.subTabsContainer}>
                        <div
                            className={`${styles.subTab} ${activeVerifierTab === 'estudiantes' ? styles.subTabActive : ''}`}
                            onClick={() => handleVerifierSubTabClick('estudiantes')}
                        >
                            <FaUserCheck className={styles.subTabIcon} />
                            <span>Estudiantes Atendidos</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeVerifierTab === 'consulta' ? styles.subTabActive : ''}`}
                            onClick={() => handleVerifierSubTabClick('consulta')}
                        >
                            <FaSearch className={styles.subTabIcon} />
                            <span>Consulta Tutorías</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeVerifierTab === 'seguimiento_est' ? styles.subTabActive : ''}`}
                            onClick={() => handleVerifierSubTabClick('seguimiento_est')}
                        >
                            <FaUserCircle className={styles.subTabIcon} />
                            <span>Seguimiento Estudiante</span>
                        </div>
                        <div
                            className={`${styles.subTab} ${activeVerifierTab === 'seguimiento_tut' ? styles.subTabActive : ''}`}
                            onClick={() => handleVerifierSubTabClick('seguimiento_tut')}
                        >
                            <FaChalkboardTeacher className={styles.subTabIcon} />
                            <span>Seguimiento Tutor</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}

            {/* INICIO Content: Quick Access Cards */}
            {activeTab === 'inicio' && (
                <div className={styles.quickAccessSection}>
                    <h3 className={styles.sectionTitle}>Acceso Rápido</h3>

                    <div className={styles.cardsGrid}>
                        {roles.includes('administrador') && (
                            <div className={styles.accessCard}>
                                <div className={styles.cardIcon}>
                                    <FaCog />
                                </div>
                                <h4 className={styles.cardTitle}>Panel Administración</h4>
                                <p className={styles.cardDesc}>
                                    Gestiona usuarios, asignaciones, cronogramas y genera reportes del sistema de tutorías.
                                </p>
                                <button className={styles.actionBtn} onClick={() => setActiveTab('admin')}>
                                    Ir a Administración <FaArrowRight size={12} />
                                </button>
                            </div>
                        )}
                        {/* More cards for Tutor/Verificador... can be added similarly */}
                        {roles.includes('tutor') && (
                            <div className={styles.accessCard}>
                                <div className={`${styles.cardIcon} ${styles.blueIcon}`}>
                                    <FaBook />
                                </div>
                                <h4 className={styles.cardTitle}>Panel Tutorías</h4>
                                <p className={styles.cardDesc}>
                                    Registra sesiones de tutoría, da seguimiento a tus tutorados y gestiona tus actividades.
                                </p>
                                <button className={styles.actionBtn} onClick={() => setActiveTab('tutor')}>
                                    Ir a Tutorías <FaArrowRight size={12} />
                                </button>
                            </div>
                        )}
                        {roles.includes('verificador') && (
                            <div className={styles.accessCard}>
                                <div className={`${styles.cardIcon} ${styles.yellowIcon}`}>
                                    <FaFolderOpen />
                                </div>
                                <h4 className={styles.cardTitle}>Panel Evaluación</h4>
                                <p className={styles.cardDesc}>
                                    Verifica y evalúa las sesiones de tutoría realizadas por los tutores asignados.
                                </p>
                                <button className={styles.actionBtn} onClick={() => setActiveTab('verificador')}>
                                    Ir a Evaluación <FaArrowRight size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ADMIN Content */}
            {activeTab === 'admin' && (
                <div className={styles.contentArea}>
                    {/* Render content based on activeAdminTab */}
                    <div className={styles.contentCard}>
                        {activeAdminTab === 'validar' && (
                            <AprobarRegistro embedded={true} />
                        )}

                        {activeAdminTab === 'asignaciones' && (
                            <AsignacionTutorados embedded={true} />
                        )}

                        {activeAdminTab === 'cambio' && (
                            <CambioTutorados />
                        )}

                        {activeAdminTab === 'cronogramas' && (
                            <Cronogramas embedded = {true}/>
                        )}

                        {activeAdminTab === 'reportes' && (
                            <TutoriasHistoricas embedded={true} />
                        )}

                        {activeAdminTab === 'seguridad' && (
                            <>
                                <h3 className={styles.contentTitle}>Seguridad</h3>
                                <div className={styles.contentPlaceholder}>
                                    <p>Sistema de Recuperación y Backup (Próximamente).</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TUTOR Content */}
            {activeTab === 'tutor' && (
                <div className={styles.contentArea}>
                    <div className={styles.contentCard}>
                        <NuevoTutorPanel />
                    </div>
                </div>
            )}

            {/* VERIFICADOR Content */}
            {activeTab === 'verificador' && (
                <div className={styles.contentArea}>
                    <div className={styles.contentCard}>
                        {activeVerifierTab === 'estudiantes' && (
                            <VerifEstudiantesAtendidos />
                        )}
                        {activeVerifierTab === 'consulta' && (
                            <VerifConsultaTutorias />
                        )}
                        {activeVerifierTab === 'seguimiento_est' && (
                            <VerifSeguimientoEstudiante />
                        )}
                        {activeVerifierTab === 'seguimiento_tut' && (
                            <VerifSeguimientoTutor />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
