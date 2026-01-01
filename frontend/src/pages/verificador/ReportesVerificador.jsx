import React from 'react';
import styles from '../../styles/pages/TutorInterface.module.css';

const ReportesVerificador = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titleSection}>
                <h2>Reportes del Tutor</h2>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.emptyState}>
                    Visualización y validación de reportes mensuales y finales entregados por los tutores.
                </div>
            </div>
        </div>
    );
};

export default ReportesVerificador;
