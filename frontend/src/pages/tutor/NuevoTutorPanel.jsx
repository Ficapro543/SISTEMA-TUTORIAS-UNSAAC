import { useState } from 'react';
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

// Mock data basado en las tablas de la BDD
const mockCronogramas = [
    {
        id: '1',
        fecha: '12/02/25',
        horaInicio: '10:00',
        horaFin: '10:15',
        aula: '201',
        estudiante: { codigo: '184521', nombre: 'Carlo Rodriguez Mamani' },
        tutoria: {
            id: 't1',
            obsAcademico: 'El estudiante presenta buen rendimiento en cálculo pero dificultades en programación.',
            obsPersonal: 'Se muestra motivado pero con algo de estrés por la carga académica.',
            obsProfesional: 'Interesado en desarrollo web, busca orientación para prácticas.',
            requiereDerivacion: false,
            fechaRegistro: '10:03 a.m. - 12/02/2025',
        },
    },
    {
        id: '2',
        fecha: '12/02/25',
        horaInicio: '10:15',
        horaFin: '10:30',
        aula: '201',
        estudiante: { codigo: '184522', nombre: 'Ana Quispe Torres' },
        tutoria: {
            id: 't2',
            obsAcademico: 'Excelente rendimiento general, destaca en bases de datos.',
            obsPersonal: 'Buena adaptación universitaria.',
            obsProfesional: 'Orientada hacia análisis de datos.',
            requiereDerivacion: false,
            fechaRegistro: '10:18 a.m. - 12/02/2025',
        },
    },
    {
        id: '3',
        fecha: '12/02/25',
        horaInicio: '10:30',
        horaFin: '10:45',
        aula: '201',
        estudiante: { codigo: '184523', nombre: 'José Huamán Ccopa' },
        tutoria: {
            id: 't3',
            obsAcademico: 'Presenta dificultades en matemáticas, requiere apoyo adicional.',
            obsPersonal: 'Muestra signos de ansiedad ante los exámenes.',
            obsProfesional: 'Aún no tiene definida su orientación profesional.',
            requiereDerivacion: true,
            especialidad: 'Departamento de Psicología',
            motivo: 'Ansiedad académica que afecta su rendimiento en evaluaciones.',
            fechaRegistro: '10:35 a.m. - 12/02/2025',
        },
    },
    {
        id: '4',
        fecha: '12/02/25',
        horaInicio: '10:45',
        horaFin: '11:00',
        aula: '201',
        estudiante: { codigo: '184524', nombre: 'Lucía Ramos Quispe' },
        tutoria: {
            id: 't4',
            obsAcademico: 'Buen desempeño en programación orientada a objetos.',
            obsPersonal: 'Equilibrio entre vida académica y personal.',
            obsProfesional: 'Interés en inteligencia artificial.',
            requiereDerivacion: false,
            fechaRegistro: '10:48 a.m. - 12/02/2025',
        },
    },
    {
        id: '5',
        fecha: '12/02/25',
        horaInicio: '11:00',
        horaFin: '11:15',
        aula: '201',
        estudiante: { codigo: '200932', nombre: 'Miguel Condori Apaza' },
    },
    {
        id: '6',
        fecha: '12/02/25',
        horaInicio: '11:15',
        horaFin: '11:30',
        aula: '201',
        estudiante: { codigo: '184526', nombre: 'Elena Torres Mendoza' },
    },
    {
        id: '7',
        fecha: '12/02/25',
        horaInicio: '11:45',
        horaFin: '12:00',
        aula: '201',
        estudiante: { codigo: '184527', nombre: 'Bruno Cáceres Vilca' },
    },
    {
        id: '8',
        fecha: '12/02/25',
        horaInicio: '12:00',
        horaFin: '12:15',
        aula: '201',
        estudiante: { codigo: '184528', nombre: 'Sofía Mendoza Chávez' },
    },
];

const NuevoTutorPanel = () => {
    const [cronogramas, setCronogramas] = useState(mockCronogramas);
    const [selectedCronograma, setSelectedCronograma] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Form state
    const [obsAcademico, setObsAcademico] = useState('');
    const [obsPersonal, setObsPersonal] = useState('');
    const [obsProfesional, setObsProfesional] = useState('');
    const [requiereDerivacion, setRequiereDerivacion] = useState(false);
    const [especialidad, setEspecialidad] = useState('Departamento de Psicología');
    const [motivo, setMotivo] = useState('');

    // Get user from localStorage (assuming it's stored from login)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.nombres || user.first_name || 'Usuario';

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
            setObsAcademico(cronograma.tutoria.obsAcademico);
            setObsPersonal(cronograma.tutoria.obsPersonal);
            setObsProfesional(cronograma.tutoria.obsProfesional);
            setRequiereDerivacion(cronograma.tutoria.requiereDerivacion);
            setEspecialidad(cronograma.tutoria.especialidad || 'Departamento de Psicología');
            setMotivo(cronograma.tutoria.motivo || '');
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!selectedCronograma) return;

        const now = new Date();
        const fechaRegistro = `${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - ${now.toLocaleDateString('es-PE')}`;

        const newTutoria = {
            id: `t${Date.now()}`,
            obsAcademico,
            obsPersonal,
            obsProfesional,
            requiereDerivacion,
            especialidad: requiereDerivacion ? especialidad : undefined,
            motivo: requiereDerivacion ? motivo : undefined,
            fechaRegistro: isEditing && selectedCronograma.tutoria
                ? selectedCronograma.tutoria.fechaRegistro
                : fechaRegistro,
        };

        setCronogramas((prev) =>
            prev.map((c) =>
                c.id === selectedCronograma.id ? { ...c, tutoria: newTutoria } : c
            )
        );

        setIsDialogOpen(false);
        alert(
            `${isEditing ? 'Tutoría actualizada' : 'Tutoría registrada'}\nLa tutoría de ${selectedCronograma.estudiante.nombre} ha sido ${isEditing ? 'actualizada' : 'registrada'} correctamente.`
        );
    };

    const handleDownload = async (cronograma) => {
        setDownloadingId(cronograma.id);

        // Simular descarga
        await new Promise((resolve) => setTimeout(resolve, 2000));

        alert(`Constancia generada\nLa constancia de ${cronograma.estudiante.nombre} está lista para descargar.`);

        setDownloadingId(null);
    };

    const formatHora = (horaInicio, horaFin) => {
        return `${horaInicio} - ${horaFin} a.m.`;
    };

    const handleRadioChange = (value) => {
        setRequiereDerivacion(value === 'si');
    };

    return (
        <div className={styles.container}>
            {/* Welcome Card */}
            <div className={styles.welcomeCard}>
                <h2 className={styles.welcomeTitle}>¡Bienvenido!</h2>
                <h3 className={styles.welcomeName}>{userName}</h3>
                <p className={styles.welcomeText}>Accede a las herramientas del sistema de tutorías</p>
            </div>

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
                        {cronogramas.map((cronograma, index) => (
                            <TableRow
                                key={cronograma.id}
                                className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                            >
                                <TableCell className={styles.fontMedium}>{cronograma.fecha}</TableCell>
                                <TableCell>{formatHora(cronograma.horaInicio, cronograma.horaFin)}</TableCell>
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
                                                            Descargando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Printer className={styles.icon} />
                                                            Imprimir Constancia
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
                        ))}
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
                                        value={formatHora(selectedCronograma.horaInicio, selectedCronograma.horaFin)}
                                        disabled
                                        className={styles.inputDisabled}
                                    />
                                </div>
                                <div>
                                    <Label className={styles.labelMuted}>Fecha Registro:</Label>
                                    <Input
                                        value={
                                            isEditing && selectedCronograma.tutoria
                                                ? selectedCronograma.tutoria.fechaRegistro
                                                : new Date().toLocaleString('es-PE')
                                        }
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
                                >
                                    <Check className={styles.icon} />
                                    Confirmar
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className={styles.flexOne}
                                >
                                    <CornerDownLeft className={styles.icon} />
                                    Volver atrás
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
