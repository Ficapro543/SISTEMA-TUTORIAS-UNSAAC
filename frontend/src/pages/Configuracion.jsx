import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Trash2, Save, AlertTriangle } from "lucide-react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import styles from "@/styles/pages/Configuracion.module.css";
import dashboardStyles from "@/styles/pages/Dashboard.module.css";
import api from "@/utils/api";
import NuevaContraseña from "./general/NuevaContraseña"; // Import the component

const Configuracion = () => {
    const navigate = useNavigate();

    // State for user data
    const [user, setUser] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // State for name/surname form
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");

    // State for delete confirmation
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load user data on mount (Local + Fetch Fresh)
    useEffect(() => {
        // 1. Initial load from LocalStorage for speed
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser) {
            setUser(storedUser);
            setNombre(storedUser.first_name || "");
            setApellido(storedUser.last_name || "");
        }

        // 2. Fetch fresh data from Backend
        const fetchFreshProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                const freshUser = response.data.user;

                // Validate if data is different before updating to avoid re-renders if not needed?
                // React handles simple state diffs, but let's just set it.
                setUser(freshUser);
                setNombre(freshUser.first_name || "");
                setApellido(freshUser.last_name || "");

                // Sync LocalStorage
                localStorage.setItem("user", JSON.stringify(freshUser));
            } catch (error) {
                console.error("Failed to fetch fresh profile:", error);
            }
        };

        fetchFreshProfile();

        // Clock timer
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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


    const handleUpdateName = async () => {
        if (!nombre.trim() || !apellido.trim()) {
            alert("El nombre y apellido no pueden estar vacíos");
            return;
        }

        try {
            const response = await api.put('/auth/update-profile', { nombre, apellido });
            alert(response.data.message);

            // Update local storage explicitly with response from PUT
            const updatedUser = response.data.user;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            // setNombre/setApellido not needed as they are already set by inputs

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error al actualizar perfil");
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "ELIMINAR") {
            alert("Debes escribir ELIMINAR para confirmar");
            return;
        }

        try {
            await api.delete('/auth/delete-account');
            alert("Tu cuenta ha sido eliminada permanentemente");

            // Logout and redirect
            localStorage.clear();
            navigate("/login");

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error al eliminar cuenta");
            setShowDeleteDialog(false);
        }
    };

    if (!user) return <div>Cargando...</div>;

    return (
        <div className={styles.container}>
            {/* Header Reused from Dashboard */}
            <header className={dashboardStyles.mainHeader}>
                <div className={dashboardStyles.headerContainer}>
                    <div className={dashboardStyles.headerContent}>
                        <img
                            src="/logo_izquierdo.png"
                            alt="Logo UNSAAC"
                            className={dashboardStyles.logoLeft}
                        />

                        <div className={dashboardStyles.titleContainer}>
                            <h1 className={dashboardStyles.mainTitle}>SISTEMA DE TUTORÍAS</h1>
                            <p className={dashboardStyles.subtitleHeader}>UNSAAC</p>
                        </div>

                        <img
                            src="/logo_derecho.png"
                            alt="Logo Derecho"
                            className={dashboardStyles.logoRight}
                        />
                    </div>
                </div>
            </header>

            {/* Info Bar Reuse */}
            <div className={dashboardStyles.infoBar}>
                <div className={dashboardStyles.dateInfo}>
                    <div className={dashboardStyles.dateItem}>
                        <FaCalendarAlt color="#d97706" />
                        <span>{formatDate(currentTime)}</span>
                    </div>
                    <div className={dashboardStyles.dateItem}>
                        <FaClock color="#d97706" />
                        <span>{formatTime(currentTime)}</span>
                    </div>
                </div>

                {/* Simple Back Button in InfoBar instead of User Dropdown for context */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className={styles.backLink}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'transparent', color: '#1a237e', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} />
                    Volver al Dashboard
                </button>
            </div>


            <main className={styles.mainContent}>
                <div className={styles.pageHeader}>
                    <h1>Configuración Personal</h1>
                    <p>Gestiona tu información personal y seguridad de cuenta</p>
                </div>

                {/* Card 1: Cambiar Nombre/Apellido */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={`${styles.iconWrapper} ${styles.primaryIconWrapper}`}>
                            <User className={styles.primaryIcon} size={20} />
                        </div>
                        <div className={styles.headerTitle}>
                            <h2>Información Personal</h2>
                            <p>Actualiza tu nombre y apellido</p>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.gridCols2}>
                            <div className={styles.formGroup}>
                                <label htmlFor="nombre">Nombre(s)</label>
                                <input
                                    id="nombre"
                                    className={styles.input}
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="apellido">Apellido(s)</label>
                                <input
                                    id="apellido"
                                    className={styles.input}
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    placeholder="Ingresa tu apellido"
                                />
                            </div>
                        </div>
                        <div className={styles.footerRight}>
                            <button onClick={handleUpdateName} className={`${styles.button} ${styles.buttonPrimary}`}>
                                <Save size={16} />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card 2: Actualizar Contraseña - Using Embedded Component */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper + " " + styles.accentIconWrapper}>
                            <Lock className={styles.accentIcon} size={20} />
                        </div>
                        <div className={styles.headerTitle}>
                            <h2>Seguridad</h2>
                            <p>Actualiza tu contraseña de acceso</p>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {/* Embedded Password Component */}
                        <NuevaContraseña embedded={true} />
                    </div>
                </div>

                {/* Card 3: Eliminar Cuenta */}
                <div className={`${styles.card} ${styles.dangerCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper + " " + styles.destructiveIconWrapper}>
                            <Trash2 className={styles.destructiveIcon} size={20} />
                        </div>
                        <div className={styles.headerTitle}>
                            <h2 className={styles.dangerTitle}>Zona de Peligro</h2>
                            <p>Eliminar tu cuenta permanentemente</p>
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.warningBox}>
                            <AlertTriangle className={styles.destructiveIcon} size={20} />
                            <div className={styles.warningText}>
                                <p><strong>Advertencia</strong></p>
                                <p>Esta acción es irreversible. Se eliminarán todos tus datos, historial de tutorías, y configuraciones asociadas.</p>
                            </div>
                        </div>

                        <div className={styles.footerRight}>
                            <button
                                onClick={() => setShowDeleteDialog(true)}
                                className={`${styles.button} ${styles.buttonDestructive}`}
                            >
                                <Trash2 size={16} />
                                Eliminar Cuenta
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteDialog && (
                <div className={styles.overlay}>
                    <div className={styles.dialogContent}>
                        <div className={styles.dialogHeader}>
                            <div className={styles.dialogTitle + " " + styles.dangerTitle}>
                                <AlertTriangle size={24} />
                                ¿Estás seguro de eliminar tu cuenta?
                            </div>
                            <div className={styles.dialogDesc}>
                                <p>Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos del sistema.</p>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label style={{ color: '#0f172a' }}>
                                Escribe <span style={{ fontWeight: 'bold', color: '#ef4444' }}>ELIMINAR</span> para confirmar:
                            </label>
                            <input
                                className={styles.input}
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="ELIMINAR"
                                style={{ borderColor: '#ef4444' }}
                            />
                        </div>

                        <div className={styles.dialogFooter}>
                            <button
                                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmation(""); }}
                                className={`${styles.button} ${styles.buttonSecondary}`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className={`${styles.button} ${styles.buttonDestructive}`}
                            >
                                Eliminar Cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configuracion;
