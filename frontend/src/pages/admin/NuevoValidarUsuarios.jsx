import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../componentes/ui/Card';
import Button from '../../componentes/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../componentes/ui/Dialog';
import Badge from '../../componentes/ui/Badge';
import {
    User,
    Mail,
    Calendar,
    Clock,
    ShieldCheck,
    Eye,
    CheckCircle2,
    XCircle,
    Send,
} from '../../componentes/ui/icons';
import styles from './NuevoValidarUsuarios.module.css';

// Mock data para simular solicitudes pendientes
const mockPendingUsers = [
    {
        id: '1',
        first_name: 'María Elena',
        last_name: 'Quispe Mamani',
        email: 'maria.quispe@unsaac.edu.pe',
        roles: ['administrador', 'tutor'],
        roles_decisiones: [
            { role: 'administrador', approved: null },
            { role: 'tutor', approved: null },
        ],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        first_name: 'Carlos Alberto',
        last_name: 'Huanca Condori',
        email: 'carlos.huanca@unsaac.edu.pe',
        roles: ['verificador'],
        roles_decisiones: [{ role: 'verificador', approved: null }],
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        first_name: 'Ana Lucía',
        last_name: 'Flores Gutierrez',
        email: 'ana.flores@unsaac.edu.pe',
        roles: ['tutor', 'verificador'],
        roles_decisiones: [
            { role: 'tutor', approved: null },
            { role: 'verificador', approved: null },
        ],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

const roleLabels = {
    administrador: 'Administrador',
    tutor: 'Tutor',
    verificador: 'Verificador',
};

const roleVariants = {
    administrador: 'secondary',
    tutor: 'accent',
    verificador: 'default',
};

const NuevoValidarUsuarios = () => {
    const [pendingUsers, setPendingUsers] = useState(mockPendingUsers);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleDecisions, setRoleDecisions] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const openDetails = (user) => {
        setSelectedUser(user);
        const decisions = {};
        user.roles.forEach((role) => {
            const existingDecision = user.roles_decisiones?.find((d) => d.role === role);
            decisions[role] = existingDecision?.approved ?? null;
        });
        setRoleDecisions(decisions);
    };

    const closeDetails = () => {
        setSelectedUser(null);
        setRoleDecisions({});
    };

    const handleRoleDecision = (role, approved) => {
        setRoleDecisions((prev) => ({
            ...prev,
            [role]: prev[role] === approved ? null : approved,
        }));
    };

    const handleSubmitDecisions = () => {
        if (!selectedUser) return;

        const allDecided = selectedUser.roles.every(
            (role) => roleDecisions[role] !== null
        );

        if (!allDecided) {
            alert('Decisiones incompletas\nDebes aprobar o rechazar cada rol antes de enviar.');
            return;
        }

        setSubmitting(true);

        // Simular procesamiento
        setTimeout(() => {
            const updatedUsers = pendingUsers.map((user) => {
                if (user.id === selectedUser.id) {
                    return {
                        ...user,
                        roles_decisiones: user.roles.map((role) => ({
                            role,
                            approved: roleDecisions[role],
                        })),
                    };
                }
                return user;
            });

            // Remover usuario de la lista (simulando que ya fue procesado)
            setPendingUsers(updatedUsers.filter((u) => u.id !== selectedUser.id));

            alert('Decisiones enviadas\nLas decisiones de roles han sido registradas correctamente.');

            closeDetails();
            setSubmitting(false);
        }, 800);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (pendingUsers.length === 0) {
        return (
            <Card className={styles.emptyCard}>
                <CardContent className={styles.emptyContent}>
                    <ShieldCheck className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>
                        Sin solicitudes pendientes
                    </h3>
                    <p className={styles.emptyText}>
                        No hay nuevas solicitudes de acceso por revisar.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h3 className={styles.headerTitle}>
                        Solicitudes de Acceso
                    </h3>
                    <p className={styles.headerSubtitle}>
                        {pendingUsers.length} solicitud{pendingUsers.length !== 1 ? 'es' : ''} pendiente{pendingUsers.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Grid de tarjetas */}
            <div className={styles.cardGrid}>
                {pendingUsers.map((user) => (
                    <Card
                        key={user.id}
                        className={styles.userCard}
                    >
                        {/* Barra superior decorativa */}
                        <div className={styles.decorativeBar} />

                        <CardHeader className={styles.cardHeader}>
                            <div className={styles.cardHeaderContent}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        <User className={styles.avatarIcon} />
                                    </div>
                                    <div>
                                        <h4 className={styles.userName}>
                                            {user.first_name} {user.last_name}
                                        </h4>
                                        <div className={styles.userEmail}>
                                            <Mail className={styles.smallIcon} />
                                            <span className={styles.emailText}>
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className={styles.cardContent}>
                            {/* Fecha y hora */}
                            <div className={styles.dateTimeRow}>
                                <div className={styles.dateTime}>
                                    <Calendar className={styles.smallIcon} />
                                    <span>{formatDate(user.created_at)}</span>
                                </div>
                                <div className={styles.dateTime}>
                                    <Clock className={styles.smallIcon} />
                                    <span>{formatTime(user.created_at)}</span>
                                </div>
                            </div>

                            {/* Roles solicitados */}
                            <div className={styles.rolesSection}>
                                <span className={styles.rolesLabel}>
                                    Roles Solicitados
                                </span>
                                <div className={styles.badgeContainer}>
                                    {user.roles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant={roleVariants[role] || 'default'}
                                            className={styles.badge}
                                        >
                                            {roleLabels[role] || role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Botón ver detalle */}
                            <Button
                                variant="outline"
                                size="sm"
                                className={styles.detailButton}
                                onClick={() => openDetails(user)}
                            >
                                <Eye className={styles.icon} />
                                Ver Detalle
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de detalles */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && closeDetails()}>
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader>
                        <DialogTitle className={styles.dialogTitleSection}>
                            <ShieldCheck className={styles.dialogTitleIcon} />
                            Revisar Solicitud
                        </DialogTitle>
                        <DialogDescription>
                            Revisa los detalles y decide sobre cada rol solicitado.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className={styles.scrollArea}>
                            <div className={styles.modalContent}>
                                {/* Información del solicitante */}
                                <div className={styles.infoSection}>
                                    <h4 className={styles.sectionTitle}>
                                        Información Personal
                                    </h4>
                                    <div className={styles.infoBox}>
                                        <div className={styles.userInfoModal}>
                                            <div className={styles.avatarLarge}>
                                                <User className={styles.avatarIconLarge} />
                                            </div>
                                            <div>
                                                <p className={styles.userNameModal}>
                                                    {selectedUser.first_name} {selectedUser.last_name}
                                                </p>
                                                <p className={styles.userEmailModal}>
                                                    {selectedUser.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={styles.separator} />
                                        <div className={styles.gridTwo}>
                                            <div>
                                                <span className={styles.labelMuted}>Fecha:</span>
                                                <p className={styles.labelValue}>{formatDate(selectedUser.created_at)}</p>
                                            </div>
                                            <div>
                                                <span className={styles.labelMuted}>Hora:</span>
                                                <p className={styles.labelValue}>{formatTime(selectedUser.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Decisión de roles */}
                                <div className={styles.decisionsSection}>
                                    <h4 className={styles.sectionTitle}>
                                        Decisión por Rol
                                    </h4>
                                    <div className={styles.rolesDecisions}>
                                        {selectedUser.roles.map((role) => (
                                            <div
                                                key={role}
                                                className={styles.roleCard}
                                            >
                                                <div className={styles.roleCardHeader}>
                                                    <Badge
                                                        variant={roleVariants[role] || 'default'}
                                                    >
                                                        {roleLabels[role] || role}
                                                    </Badge>
                                                    {roleDecisions[role] !== null && (
                                                        <span
                                                            className={
                                                                roleDecisions[role]
                                                                    ? styles.approvedText
                                                                    : styles.rejectedText
                                                            }
                                                        >
                                                            {roleDecisions[role] ? 'Aprobado' : 'Rechazado'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.roleButtons}>
                                                    <Button
                                                        size="sm"
                                                        variant={roleDecisions[role] === true ? 'primary' : 'outline'}
                                                        className={
                                                            roleDecisions[role] === true
                                                                ? styles.approveButton
                                                                : ''
                                                        }
                                                        onClick={() => handleRoleDecision(role, true)}
                                                    >
                                                        <CheckCircle2 className={styles.icon} />
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={roleDecisions[role] === false ? 'primary' : 'outline'}
                                                        className={
                                                            roleDecisions[role] === false
                                                                ? styles.rejectButton
                                                                : ''
                                                        }
                                                        onClick={() => handleRoleDecision(role, false)}
                                                    >
                                                        <XCircle className={styles.icon} />
                                                        Rechazar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className={styles.dialogFooter}>
                        <Button variant="outline" onClick={closeDetails}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmitDecisions}
                            disabled={submitting}
                        >
                            {submitting ? (
                                'Enviando...'
                            ) : (
                                <>
                                    <Send className={styles.icon} />
                                    Enviar Decisiones
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NuevoValidarUsuarios;
