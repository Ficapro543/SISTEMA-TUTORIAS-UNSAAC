import styles from "@/styles/pages/general/Layout.module.css";

export default function Layout({ children }) {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <img src="/logo_izquierdo.png" alt="Logo Izquierdo" className={styles.logo} />
                <h1 className={styles.title}>SISTEMA DE TUTORÍAS UNSAAC</h1>
                <img src="/logo_derecho.png" alt="Logo Derecho" className={styles.logo} />
            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                © 2025 Universidad Nacional de San Antonio Abad del Cusco — Todos los
                derechos reservados.
            </footer>
        </div>
    );
}