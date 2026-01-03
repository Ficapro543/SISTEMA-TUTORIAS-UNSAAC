import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/pages/general/LandingPage.module.css';
import { LogIn } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className={styles.landingPage}>
            {/* Header with Logos */}
            <header className={styles.header}>
                <img src="/logo_izquierdo.png" alt="Logo UNSAAC" className={styles.logo} />
                <img src="/logo_derecho.png" alt="Logo Sistemas" className={styles.logo} />
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <h1 className={styles.mainTitle}>
                        Sistema de Tutorías
                    </h1>
                    <h2 className={styles.universityName}>EPIIS - UNSAAC</h2>
                    <p className={styles.subtitle}>Escuela Profesional de Ingeniería de Sistemas</p>

                    <p className={styles.description}>
                        Plataforma integral para la gestión, seguimiento y evaluación del programa de
                        tutorías universitarias. Facilitando la comunicación entre tutores, estudiantes y
                        coordinadores académicos.
                    </p>

                    {/* Feature Cards */}
                    <div className={styles.featureCards}>
                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}>
                                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Administración</h3>
                            <p className={styles.featureDesc}>Gestión de usuarios, asignaciones y cronogramas</p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}>
                                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Tutorías</h3>
                            <p className={styles.featureDesc}>Registro y seguimiento de sesiones de tutoría</p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.iconWrapper}>
                                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className={styles.featureTitle}>Verificación</h3>
                            <p className={styles.featureDesc}>Evaluación y reportes del programa de tutorías</p>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button className={styles.loginButton} onClick={handleLogin}>
                        <LogIn className={styles.buttonIcon} />
                        Iniciar Sesión
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                Universidad Nacional de San Antonio Abad del Cusco
            </footer>
        </div>
    );
}
