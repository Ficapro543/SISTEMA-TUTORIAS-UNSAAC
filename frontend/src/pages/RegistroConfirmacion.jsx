import React, {useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/components/RegistroConfirmacion.module.css"

function RegistroConfirmacion() {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener datos del estado de navegacion
    const email = location.state?.email || "tu correo electrónico";

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.confirmationPage}>
            <div className={styles.confirmationContainer}>

                {/* Icono de confirmación */}
                <div className={styles.successHeader}>
                    <div className={styles.checkIcon}>
                        <img src="tutorIcon.svg" alt="Check"/>
                    </div>
                    <h1>¡Solicitud Enviada!</h1>
                    <p className={styles.subtitles}>Tu registro fue recibido exitosamente</p>
                </div>

                {/* Verificación Pendiente */}
                <div className={styles.infoCard}>
                    <div className={styles.cardIcon}>
                        <img src="tutorIcon.svg" alt="Información"/>
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Verificación pendiente</h3>
                        <p>Recibirás un correo a {email} cuando tu solicitud sea aprobada por un administrador. Este proceso puede tomar entre 24 y 48 horas.</p>
                    </div>
                </div>

                {/* Revisa tu correo */}
                <div className={`${styles.infoCard} ${styles.emailCard}`}>
                    <div className={styles.cardIcon}>
                        <img src="tutorIcon.svg" alt="Correo"/>
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Revisa tu correo</h3>
                        <p>Te enviaremos un correo con un enlace de activación una vez que tu solicitud sea aprobada.</p>
                    </div>
                </div>

                {/* Botón para volver al login */}
                <button
                    className={styles.backToLoginBtn}
                    onClick={handleBackToLogin}>
                        Volver a Iniciar Sesión
                </button>
            </div>
        </div>
    );
}

export default RegistroConfirmacion;