import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CalendarPlus, Search, Trash2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { SingleCronogramaPDF, AllCronogramasPDF } from '../componentes/pdf-documents';
import CrearCronogramaModal from '../componentes/CrearCronogramaModal';
import { getCronogramas, createCronograma, deleteCronograma } from '../services/cronogramaService';
import styles from '../styles/pages/Cronogramas.module.css';

export default function Cronogramas({ embedded = false }) {
    const navigate = useNavigate();
    const [cronogramas, setCronogramas] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Verificar autenticación
        const rolesStr = localStorage.getItem('userRoles');
        if (!rolesStr) {
            navigate('/login');
            return;
        }
        const roles = JSON.parse(rolesStr);
        if (!roles.administrador) {
            navigate('/mainpage');
            return;
        }

        loadCronogramas();
    }, [navigate]);

    async function loadCronogramas(search = '') {
        try {
            setLoading(true);
            setError('');
            const data = await getCronogramas(search);
            setCronogramas(data);
        } catch (err) {
            console.error('Error al cargar cronogramas:', err);
            setError('Error al cargar cronogramas');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        loadCronogramas(value);
    };

    // Filtrar cronogramas por tutor
    const filteredCronogramas = cronogramas;
    const visibleCronogramas = filteredCronogramas.slice(0, visibleCount);
    const hasMore = visibleCount < filteredCronogramas.length;

    // Función para imprimir un cronograma individual
    const handlePrintSingle = async (cronograma) => {
        try {
            setIsPrinting(true);
            const blob = await pdf(<SingleCronogramaPDF cronograma={cronograma} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cronograma-${cronograma.fecha}-${cronograma.id}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar PDF');
        } finally {
            setIsPrinting(false);
        }
    };

    // Función para imprimir todos los cronogramas
    const handlePrintAll = async () => {
        try {
            setIsPrinting(true);
            const blob = await pdf(<AllCronogramasPDF cronogramas={cronogramas} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `cronogramas-completos-${new Date().getTime()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar PDF');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleShowMore = () => {
        setVisibleCount((prev) => Math.min(prev + 5, filteredCronogramas.length));
    };

    const handleCreateCronograma = async (data) => {
        try {
            await createCronograma(data);
            await loadCronogramas(searchTerm);
            alert('Cronograma creado exitosamente');
        } catch (err) {
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este cronograma?')) {
            try {
                await deleteCronograma(id);
                await loadCronogramas(searchTerm);
                // alert('Cronograma eliminado'); // Opcional: mostrar notificación
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Hubo un error al eliminar el cronograma');
            }
        }
    };
    if (embedded) {
        return (

            <>
                {/* Title Section */}
                <div className={styles.titleSection}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.pageTitle}>Cronograma de tutorías</h2>
                    </div>
                    <div className={styles.actionGroup}>
                        <div className={styles.searchWrapper}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por tutor..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button
                            className={styles.createBtn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <CalendarPlus size={20} />
                            Crear nuevo cronograma
                        </button>
                    </div>
                </div>

                {/* Cronogramas Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.tableTitle}>Lista de Cronogramas</h3>
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>Cargando cronogramas...</div>
                    ) : error ? (
                        <div className={styles.errorState}>{error}</div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className={styles.tableHeaderRow}>
                                <div className={styles.tableHeaderCell}>Fecha</div>
                                <div className={styles.tableHeaderCell}>Horario</div>
                                <div className={styles.tableHeaderCell}>Aula</div>
                                <div className={styles.tableHeaderCell}>Tutor</div>
                                <div className={styles.tableHeaderCell}>Estudiante</div>
                                <div className={styles.tableHeaderCell}></div>
                                <div className={styles.tableHeaderCell}></div>
                            </div>

                            {/* Table Body */}
                            <div className={styles.tableBody}>
                                {visibleCronogramas.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        No se encontraron cronogramas
                                        {searchTerm && ` para "${searchTerm}"`}
                                    </div>
                                ) : (
                                    visibleCronogramas.map((cronograma) => (
                                        <div key={cronograma.id} className={styles.tableRow}>
                                            <div className={styles.tableCell}>{cronograma.fecha}</div>
                                            <div className={styles.tableCell}>{cronograma.horario}</div>
                                            <div className={styles.tableCell}>{cronograma.aula}</div>
                                            <div className={styles.tableCell}>{cronograma.tutor}</div>
                                            <div className={styles.tableCell}>
                                                <span className={styles.badge}>
                                                    {cronograma.estudiantes}
                                                </span>
                                            </div>
                                            <div className={styles.tableCell}>
                                                <button
                                                    onClick={() => handlePrintSingle(cronograma)}
                                                    disabled={isPrinting}
                                                    className={styles.printBtn}
                                                    title="Imprimir"
                                                >
                                                    <Printer size={20} />
                                                </button>
                                            </div>
                                            <div className={styles.tableCell}>
                                                <button
                                                    onClick={() => handleDelete(cronograma.id)}
                                                    className={styles.deleteBtn}
                                                    title="Eliminar"
                                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className={styles.tableFooter}>
                                {hasMore && (
                                    <button onClick={handleShowMore} className={styles.showMoreBtn}>
                                        Mostrar más
                                    </button>
                                )}
                                <button
                                    onClick={handlePrintAll}
                                    disabled={isPrinting || cronogramas.length === 0}
                                    className={styles.printAllBtn}
                                >
                                    <Printer size={20} />
                                    {isPrinting ? 'Generando PDF...' : 'Imprimir Todos'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
                {/* Modal para crear cronograma */}
                <CrearCronogramaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateCronograma}
                />
            </>
        );
    }

    return (
        <div className={styles.container}>
            {/* Main Content */}
            <main className={styles.main}>
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <span className={styles.breadcrumbItem}>Home</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={styles.breadcrumbItem}>Administrador</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={styles.breadcrumbItemActive}>Cronogramas</span>
                </div>

                {/* Title Section */}
                <div className={styles.titleSection}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.pageTitle}>Cronograma de tutorías</h2>
                    </div>
                    <div className={styles.actionGroup}>
                        <div className={styles.searchWrapper}>
                            <Search className={styles.searchIcon} size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por tutor..."
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button
                            className={styles.createBtn}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <CalendarPlus size={20} />
                            Crear nuevo cronograma
                        </button>
                    </div>
                </div>

                {/* Cronogramas Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h3 className={styles.tableTitle}>Lista de Cronogramas</h3>
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>Cargando cronogramas...</div>
                    ) : error ? (
                        <div className={styles.errorState}>{error}</div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className={styles.tableHeaderRow}>
                                <div className={styles.tableHeaderCell}>Fecha</div>
                                <div className={styles.tableHeaderCell}>Horario</div>
                                <div className={styles.tableHeaderCell}>Aula</div>
                                <div className={styles.tableHeaderCell}>Tutor</div>
                                <div className={styles.tableHeaderCell}>Estudiante</div>
                                <div className={styles.tableHeaderCell}></div>
                                <div className={styles.tableHeaderCell}></div>
                            </div>

                            {/* Table Body */}
                            <div className={styles.tableBody}>
                                {visibleCronogramas.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        No se encontraron cronogramas
                                        {searchTerm && ` para "${searchTerm}"`}
                                    </div>
                                ) : (
                                    visibleCronogramas.map((cronograma) => (
                                        <div key={cronograma.id} className={styles.tableRow}>
                                            <div className={styles.tableCell}>{cronograma.fecha}</div>
                                            <div className={styles.tableCell}>{cronograma.horario}</div>
                                            <div className={styles.tableCell}>{cronograma.aula}</div>
                                            <div className={styles.tableCell}>{cronograma.tutor}</div>
                                            <div className={styles.tableCell}>
                                                <span className={styles.badge}>
                                                    {cronograma.estudiantes}
                                                </span>
                                            </div>
                                            <div className={styles.tableCell}>
                                                <button
                                                    onClick={() => handlePrintSingle(cronograma)}
                                                    disabled={isPrinting}
                                                    className={styles.printBtn}
                                                    title="Imprimir"
                                                >
                                                    <Printer size={20} />
                                                </button>
                                            </div>
                                            <div className={styles.tableCell}>
                                                <button
                                                    onClick={() => handleDelete(cronograma.id)}
                                                    className={styles.deleteBtn}
                                                    title="Eliminar"
                                                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className={styles.tableFooter}>
                                {hasMore && (
                                    <button onClick={handleShowMore} className={styles.showMoreBtn}>
                                        Mostrar más
                                    </button>
                                )}
                                <button
                                    onClick={handlePrintAll}
                                    disabled={isPrinting || cronogramas.length === 0}
                                    className={styles.printAllBtn}
                                >
                                    <Printer size={20} />
                                    {isPrinting ? 'Generando PDF...' : 'Imprimir Todos'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Modal para crear cronograma */}
            <CrearCronogramaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateCronograma}
            />
        </div>
    );
}
