import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../componentes/ui/Table';
import Button from '../../componentes/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../componentes/ui/Dialog';
import Input from '../../componentes/ui/Input';
import Textarea from '../../componentes/ui/Textarea';
import Label from '../../componentes/ui/Label';
import { RadioGroup, RadioGroupItem } from '../../componentes/ui/RadioGroup';
import { Plus, Pencil, Printer, Check, CornerDownLeft, Loader2 } from '../../componentes/ui/icons';
import styles from './NuevoTutorPanel.module.css';
import { getTutorias, registrarTutoria, actualizarTutoria } from '../../services/tutorService';

const NuevoTutorPanel = () => {
    const [cronogramas, setCronogramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCronograma, setSelectedCronograma] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [obsAcademico, setObsAcademico] = useState('');
    const [obsPersonal, setObsPersonal] = useState('');
    const [obsProfesional, setObsProfesional] = useState('');
    const [requiereDerivacion, setRequiereDerivacion] = useState(false);
    const [especialidad, setEspecialidad] = useState('Departamento de Psicología');
    const [motivo, setMotivo] = useState('');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.nombres || user.first_name || 'Usuario';
    const tutorId = user.id || user.user_id; // Ajustar según lo que guarde el login

    // Cargar datos reales
    const fetchTutorias = async () => {
        if (!tutorId) return;
        setLoading(true);
        try {
            const data = await getTutorias(tutorId);
            // Mapeo de datos del backend a la estructura usada en el frontend
            const formattedData = data.map(item => ({
                id: item.cronograma_id,
                fecha: new Date(item.fecha).toLocaleDateString('es-PE'),
                horaInicio: item.hora.substring(0, 5), // '10:00:00' -> '10:00'
                horaFin: item.hora.substring(0, 5),
                aula: item.aula,
                estudiante: {
                    codigo: item.codigo_estudiante,
                    nombre: `${item.nombre_estudiante} ${item.apellido_estudiante}`
                },
                tutoria: item.tutoria_id ? {
                    id: item.tutoria_id,
                    obsAcademico: item.obs_academico,
                    obsPersonal: item.obs_personal,
                    obsProfesional: item.obs_profesional,
                    requiereDerivacion: item.requiere_derivacion,
                    especialidad: item.derivacion_especialidad,
                    motivo: item.derivacion_motivo,
                    fechaRegistro: 'Registrado' // Fecha real podría venir del backend
                } : null
            }));
            setCronogramas(formattedData);
        } catch (error) {
            console.error("Error cargando tutorías:", error);
            // alert("Error al cargar las tutorías."); // Opcional: mostrar error visual
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutorias();
    }, [tutorId]);

    const openRegisterDialog = (cronograma) => {
        setSelectedCronograma(cronograma);
        setIsEditing(false);
        setObsAcademico('');
        setObsPersonal('');
        setObsProfesional('');
        setRequiereDerivacion(false);
        setEspecialidad('Departamento de Psicología');
        setMotivo('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (cronograma) => {
        setSelectedCronograma(cronograma);
        setIsEditing(true);
        if (cronograma.tutoria) {
            setObsAcademico(cronograma.tutoria.obsAcademico || '');
            setObsPersonal(cronograma.tutoria.obsPersonal || '');
            setObsProfesional(cronograma.tutoria.obsProfesional || '');
            setRequiereDerivacion(cronograma.tutoria.requiereDerivacion || false);
            setEspecialidad(cronograma.tutoria.especialidad || 'Departamento de Psicología');
            setMotivo(cronograma.tutoria.motivo || '');
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!selectedCronograma) return;
        setSubmitting(true);

        const payload = {
            cronograma_id: selectedCronograma.id,
            obs_academico: obsAcademico,
            obs_personal: obsPersonal,
            obs_profesional: obsProfesional,
            requiere_derivacion: requiereDerivacion,
            derivacion: requiereDerivacion ? {
                especialidad,
                motivo
            } : null
        };

        try {
            if (isEditing && selectedCronograma.tutoria) {
                // Actualizar
                await actualizarTutoria(selectedCronograma.tutoria.id, payload);
                alert('Tutoría actualizada correctamente');
            } else {
                // Registrar nueva
                await registrarTutoria(payload);
                alert('Tutoría registrada correctamente');
            }
            setIsDialogOpen(false);
            fetchTutorias(); // Refrescar tabla
        } catch (error) {
            console.error("Error guardando tutoría:", error);
            alert("Error al guardar la operación.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async (cronograma) => {
        // En un futuro, esto llamaría a un endpoint de generación de PDF real
        setDownloadingId(cronograma.id);
        console.log("Generando constancia para:", cronograma.id);

        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulación de espera de red
        alert(`Constancia generada para ${cronograma.estudiante.nombre}`);
        setDownloadingId(null);
    };

    const formatHora = (hora) => {
        return `${hora} a.m.`;
    };

    const handleRadioChange = (value) => {
        setRequiereDerivacion(value === 'si');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeCard}>
                    <h2 className={styles.welcomeTitle}>Cargando...</h2>
                    <Loader2 className={`${styles.icon} animate-spin`} />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {/* Table */}
            <div className={styles.tableCard}>
                <Table>
                    <TableHeader>
                        <TableRow className={styles.tableHeaderRow}>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                            <TableHead>Aula</TableHead>
                            <TableHead>Estudiante</TableHead>
                            <TableHead className={styles.tableHeadCenter}>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cronogramas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No hay tutorías programadas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cronogramas.map((cronograma, index) => (
                                <TableRow
                                    key={cronograma.id}
                                    className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                                >
                                    <TableCell className={styles.fontMedium}>{cronograma.fecha}</TableCell>
                                    <TableCell>{formatHora(cronograma.horaInicio)}</TableCell>
                                    <TableCell>Aula {cronograma.aula}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className={styles.fontMedium}>{cronograma.estudiante.nombre}</p>
                                            <p className={styles.codigoText}>Código: {cronograma.estudiante.codigo}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={styles.actionsCell}>
                                            {cronograma.tutoria ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="accent"
                                                        onClick={() => openEditDialog(cronograma)}
                                                    >
                                                        <Pencil className={styles.icon} />
                                                        Editar Tutoría
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleDownload(cronograma)}
                                                        disabled={downloadingId === cronograma.id}
                                                    >
                                                        {downloadingId === cronograma.id ? (
                                                            <>
                                                                <Loader2 className={styles.icon} />
                                                                ...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Printer className={styles.icon} />
                                                                Imprimir
                                                            </>
                                                        )}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => openRegisterDialog(cronograma)}
                                                >
                                                    <Plus className={styles.icon} />
                                                    Registrar Tutoría
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal de Registro/Edición */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader className={styles.dialogHeader}>
                        <DialogTitle className={styles.dialogTitle}>
                            {isEditing ? 'EDITAR TUTORÍA' : 'REGISTRAR TUTORÍA'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCronograma && (
                        <div className={styles.formContainer}>
                            {/* Datos del estudiante y sesión */}
                            <div className={styles.gridTwo}>
                                <div>
                                    <Label className={styles.labelMuted}>Nombre Estudiante:</Label>
                                    <Input
                                        value={selectedCronograma.estudiante.nombre}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                                <div>
                                    <Label className={styles.labelMuted}>Código Estudiante:</Label>
                                    <Input
                                        value={selectedCronograma.estudiante.codigo}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                            </div>

                            <div className={styles.gridThree}>
                                <div>
                                    <Label className={styles.labelMuted}>Fecha:</Label>
                                    <Input
                                        value={selectedCronograma.fecha}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                                <div>
                                    <Label className={styles.labelMuted}>Hora:</Label>
                                    <Input
                                        value={formatHora(selectedCronograma.horaInicio)}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                                <div>
                                    <Label className={styles.labelMuted}>Estado:</Label>
                                    <Input
                                        value={isEditing ? "Registrada" : "Pendiente"}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                            </div>

                            {/* Aspectos */}
                            <div className={styles.gridTwo}>
                                <div>
                                    <Label className={styles.labelMuted}>Aspecto Académico:</Label>
                                    <Textarea
                                        value={obsAcademico}
                                        onChange={(e) => setObsAcademico(e.target.value)}
                                        placeholder="Observaciones sobre el rendimiento académico..."
                                        className={styles.textarea}
                                    />
                                </div>
                                <div>
                                    <Label className={styles.labelMuted}>Aspecto Personal:</Label>
                                    <Textarea
                                        value={obsPersonal}
                                        onChange={(e) => setObsPersonal(e.target.value)}
                                        placeholder="Observaciones sobre el aspecto personal..."
                                        className={styles.textarea}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className={styles.labelMuted}>Aspecto Profesional:</Label>
                                <Textarea
                                    value={obsProfesional}
                                    onChange={(e) => setObsProfesional(e.target.value)}
                                    placeholder="Observaciones sobre la orientación profesional..."
                                    className={styles.textareaSmall}
                                />
                            </div>

                            {/* Derivación */}
                            <div className={styles.derivacionSection}>
                                <div className={styles.derivacionLabel}>
                                    <Label className={styles.labelMuted}>¿Requiere derivación psicológica?</Label>
                                    <div className={styles.infoIcon} title="Marcar si el estudiante necesita atención psicológica">
                                        i
                                    </div>
                                </div>
                                <div className={styles.radioContainer}>
                                    <div className={styles.radioOption}>
                                        <RadioGroupItem
                                            value="si"
                                            id="si"
                                            checked={requiereDerivacion}
                                            onChange={() => handleRadioChange('si')}
                                        />
                                        <Label htmlFor="si" className={styles.radioLabel}>Sí</Label>
                                    </div>
                                    <div className={styles.radioOption}>
                                        <RadioGroupItem
                                            value="no"
                                            id="no"
                                            checked={!requiereDerivacion}
                                            onChange={() => handleRadioChange('no')}
                                        />
                                        <Label htmlFor="no" className={styles.radioLabel}>No</Label>
                                    </div>
                                </div>

                                {requiereDerivacion && (
                                    <div className={styles.gridTwo + ' ' + styles.conditionalFields}>
                                        <div>
                                            <Label className={styles.labelMuted}>Especialidad:</Label>
                                            <Input
                                                value={especialidad}
                                                onChange={(e) => setEspecialidad(e.target.value)}
                                                placeholder="Departamento de Psicología"
                                            />
                                        </div>
                                        <div>
                                            <Label className={styles.labelMuted}>Motivo:</Label>
                                            <Textarea
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                                placeholder="Describa el motivo de la derivación..."
                                                className={styles.textareaSmall}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div className={styles.actionButtons}>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    className={styles.flexOne}
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Check className={styles.icon} />}
                                    {isEditing ? 'Guardar Cambios' : 'Confirmar Registro'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className={styles.flexOne}
                                    disabled={submitting}
                                >
                                    <CornerDownLeft className={styles.icon} />
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NuevoTutorPanel;
