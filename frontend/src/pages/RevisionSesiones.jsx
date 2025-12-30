import React from 'react';
import styles from '../styles/pages/TutorInterface.module.css';

const RevisionSesiones = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Revisión de Sesiones de Tutoría</h2>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.emptyState}>
                    Aquí se mostrará la lista de sesiones pendientes de revisión por parte del verificador.
                </div>
            </div>
        </div>
    );
};

export default RevisionSesiones;
