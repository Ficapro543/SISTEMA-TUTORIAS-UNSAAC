import React from 'react';
import styles from '../styles/pages/TutorInterface.module.css';

const FichaTutoria = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Ficha de Tutoría</h2>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.emptyState}>
                    Consulta detallada de la ficha de tutoría acumulada del estudiante.
                </div>
            </div>
        </div>
    );
};

export default FichaTutoria;
