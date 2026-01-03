import React, {useState, useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "@/styles/pages/general/RegistroConfirmacion.module.css"

function RegistroConfirmacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Verificar si viene de Registro
    useEffect(()=>{
        if(!location.state?.email){
            setIsRedirecting(true);

            //Esperar 3 segundos
            const timer = setTimeout(()=>{
                navigate("/registro",{replace: true});
            }, 3000);

            //Limpiar el timer si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [location.state, navigate]);

    // Si no hay estado, mostrar loading 
    if(!location.state?.email){
        return(
            <div className={styles.confirmationPage}>
                <div className={styles.confirmationContainer}>
                    <div className={styles.redirectingMessage}>
                        <div className={styles.loadingSpinner}></div>
                        <h3>Redirigiendo...</h3>
                        <p>No se encontraron datos de registro. Regresando al formulario...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Obtener datos del estado de navegacion
    const {email, nombres} = location.state;

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.confirmationPage}>
            <div className={styles.confirmationContainer}>

                {/* Icono de confirmación */}
                <div className={styles.successHeader}>
                    <div className={styles.checkIcon}>
                        <img src="check-icon.svg" alt="Check"/>
                    </div>
                    <h1>¡Solicitud Enviada!</h1>
                    <p className={styles.subtitle}>Tu registro fue recibido exitosamente</p>
                </div>

                {/* Verificación Pendiente */}
                <div className={styles.infoCard}>
                    <div className={styles.cardIcon}>
                        <img src="info-icon.svg" alt="Información"/>
                    </div>
                    <div className={styles.cardContent}>
                        <h3>Verificación pendiente</h3>
                        <p>Recibirás un correo a <strong>{email}</strong> cuando tu solicitud sea aprobada por un administrador.<strong> Este proceso puede tomar entre 24 y 48 horas.</strong></p>
                    </div>
                </div>

                {/* Revisa tu correo */}
                <div className={`${styles.infoCard} ${styles.emailCard}`}>
                    <div className={styles.cardIcon}>
                        <img src="email-icon.svg" alt="Correo"/>
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