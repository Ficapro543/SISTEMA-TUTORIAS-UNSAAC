import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CalendarPlus, Search, Trash2, Pencil } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { SingleCronogramaPDF, AllCronogramasPDF } from '../componentes/pdf-documents';
import CrearCronogramaModal from '../componentes/CrearCronogramaModal';
import { getCronogramas, createCronograma, deleteCronograma, updateCronograma } from '../services/cronogramaService';
import { getSemesters } from '../services/assignmentService';
import styles from '../styles/pages/Cronogramas.module.css';

export default function Cronogramas({ embedded = false }) {
    const navigate = useNavigate();
    const [cronogramas, setCronogramas] = useState([]);
    const [visibleCount, setVisibleCount] = useState(5);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search & Filtering
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');

    // Edit Mode
    const [editingCronograma, setEditingCronograma] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

        loadInitialData();
        loadCronogramas();
    }, [navigate]);

    async function loadInitialData() {
        try {
            const semesterData = await getSemesters();
            setSemesters(semesterData);
        } catch (err) {
            console.error('Error al cargar semestres:', err);
        }
    }

    async function loadCronogramas(semesterId = '') {
        try {
            setLoading(true);
            setError('');
            // Pass semester filter to service
            const data = await getCronogramas({ semestre: semesterId });
            setCronogramas(data);
        } catch (err) {
            console.error('Error al cargar cronogramas:', err);
            setError('Error al cargar cronogramas');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = () => {
        loadCronogramas(selectedSemester);
    };

    const handleEditClick = (cronograma) => {
        setEditingCronograma(cronograma);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Pagination / Visibility
    const visibleCronogramas = cronogramas.slice(0, visibleCount);
    const hasMore = visibleCount < cronogramas.length;

    // Función para imprimir un cronograma individual (removed as per instruction)

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
        setVisibleCount((prev) => Math.min(prev + 5, cronogramas.length));
    };

    const handleCreateCronograma = async (data) => {
        try {
            await createCronograma(data);
            await loadCronogramas(selectedSemester);
            alert('Cronograma creado exitosamente');
            setIsModalOpen(false);
        } catch (err) {
            throw err;
        }
    };

    const handleUpdateCronograma = async (data) => {
        try {
            if (!editingCronograma) return;
            await updateCronograma(editingCronograma.id, data);
            await loadCronogramas(selectedSemester);
            alert('Cronograma actualizado exitosamente');
            handleModalClose();
        } catch (err) {
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este cronograma?')) {
            try {
                await deleteCronograma(id);
                await loadCronogramas(selectedSemester); // user usually wants to stay on same search
            } catch (error) {
                console.error('Error al eliminar:', error);
                const msg = error.message || 'Hubo un error al eliminar el cronograma';
                alert(msg);
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingCronograma(null);
        setIsEditing(false);
    };

    // Shared content for both embedded and full page views
    const renderContent = () => (
        <>
            {/* Title Section */}
            <div className={styles.titleSection}>
                <div className={styles.titleGroup}>
                    <h2 className={styles.pageTitle}>Cronograma de tutorías</h2>
                </div>
                <div className={styles.actionGroup}>
                    <div className={styles.searchWrapper}>
                        <label style={{ marginRight: '10px' }}>Semestre</label>
                        <select
                            className={styles.searchInput}
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            style={{ width: '120px' }}
                        >
                            <option value="">Todos</option>
                            {semesters.map(sem => (
                                <option key={sem.id} value={sem.id}>{sem.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleSearch}
                            className={styles.createBtn}
                            style={{ marginLeft: '10px', padding: '8px 16px', minWidth: 'auto' }}
                        >
                            <Search size={18} style={{ marginRight: '5px' }} />
                            Buscar
                        </button>
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
                                    {selectedSemester && ` para el semestre seleccionado`}
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
                                                onClick={() => handleEditClick(cronograma)}
                                                className={styles.printBtn}
                                                title="Editar"
                                            >
                                                <Pencil size={20} />
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

            {/* Modal para crear/editar cronograma */}
            <CrearCronogramaModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={isEditing ? handleUpdateCronograma : handleCreateCronograma}
                initialData={editingCronograma}
                isEditing={isEditing}
            />
        </>
    );

    if (embedded) {
        return renderContent();
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <span className={styles.breadcrumbItem}>Home</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={styles.breadcrumbItem}>Administrador</span>
                    <span className={styles.breadcrumbSeparator}>&gt;</span>
                    <span className={styles.breadcrumbItemActive}>Cronogramas</span>
                </div>
                {renderContent()}
            </main>
        </div>
    );
}
