// NuevoValidarUsuarios.jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/componentes/ui/Card';
import Button from '@/componentes/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/componentes/ui/Dialog';
import Badge from '@/componentes/ui/Badge';
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
} from '@/componentes/ui/icons';
import { 
    getPendingRequests, 
    approveUser, 
    rejectUser,
    getRequestDetail 
} from '@/services/adminService';
import styles from '@/styles/pages/admin/NuevoValidarUsuarios.module.css';

// Definir jerarquía de roles
const roleHierarchy = ['administrador', 'tutor', 'verificador'];

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

// Función para ordenar roles según jerarquía
const sortRolesByHierarchy = (roles) => {
    return [...roles].sort((a, b) => {
        const indexA = roleHierarchy.indexOf(a);
        const indexB = roleHierarchy.indexOf(b);
        
        // Si ambos están en la jerarquía, ordenar según su posición
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        
        // Si solo uno está en la jerarquía, ese va primero
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // Si ninguno está en la jerarquía, orden alfabético
        return a.localeCompare(b);
    });
};

const NuevoValidarUsuarios = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roleDecisions, setRoleDecisions] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingDetailId, setLoadingDetailId] = useState(null);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Cargar solicitudes pendientes al montar el componente
    useEffect(() => {
        fetchPendingUsers();
    }, []);

    // Efecto para limpiar decisiones cuando se cierra el diálogo
    useEffect(() => {
        if (!isDialogOpen) {
            // Limpiar decisiones después de un pequeño delay para asegurar
            // que la animación de cierre se complete
            const timer = setTimeout(() => {
                setRoleDecisions({});
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPendingRequests();
            
            // Transformar datos del backend al formato del frontend
            const transformedData = data.map(user => ({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                roles: Array.isArray(user.roles) ? sortRolesByHierarchy(user.roles) : [],
                roles_decisiones: user.roles_decisiones || [],
                created_at: user.created_at
            }));
            
            setPendingUsers(transformedData);
        } catch (err) {
            console.error('Error fetching pending users:', err);
            setError('Error al cargar las solicitudes pendientes');
        } finally {
            setLoading(false);
        }
    };

    const openDetails = async (user) => {
        try {
            setLoadingDetailId(user.id);
            setIsDialogOpen(true);
            // Obtener detalles actualizados del usuario
            const userDetail = await getRequestDetail(user.id);
            
            // Ordenar roles según jerarquía
            const sortedRoles = sortRolesByHierarchy(
                Array.isArray(userDetail.roles) ? userDetail.roles : []
            );
            
            setSelectedUser({
                ...userDetail,
                roles: sortedRoles
            });
            
            // Inicializar decisiones basadas en roles_decisiones existentes
            const decisions = {};
            
            sortedRoles.forEach((role) => {
                const existingDecision = userDetail.roles_decisiones?.find(d => d.rol === role);
                if (existingDecision) {
                    decisions[role] = existingDecision.decision === 'aprobado' ? true : 
                                    existingDecision.decision === 'rechazado' ? false : null;
                } else {
                    decisions[role] = null;
                }
            });
            
            setRoleDecisions(decisions);
        } catch (err) {
            console.error('Error fetching user details:', err);
            alert('Error al cargar los detalles del usuario');
        } finally{
            setLoadingDetailId(null);
        }
    };

    const closeDetails = () => {
        setSelectedUser(null);
        setRoleDecisions({});
        setIsDialogOpen(false);
    };

    const handleRoleDecision = (role, approved) => {
        setRoleDecisions((prev) => ({
            ...prev,
            [role]: prev[role] === approved ? null : approved,
        }));
    };

    const handleSubmitDecisions = async () => {
        if (!selectedUser) return;

        const allDecided = selectedUser.roles.every(
            (role) => roleDecisions[role] !== null
        );

        if (!allDecided) {
            alert('Decisiones incompletas\nDebes aprobar o rechazar cada rol antes de enviar.');
            return;
        }

        // Verificar si todos los roles fueron rechazados
        const allRejected = selectedUser.roles.every(
            (role) => roleDecisions[role] === false
        );

        setSubmitting(true);

        try {
            if (allRejected) {
                // Si todos los roles fueron rechazados, rechazar completamente al usuario
                await rejectUser(selectedUser.id);
                alert('Usuario rechazado\nSe ha rechazado completamente la solicitud del usuario.');
            } else {
                // Si hay al menos un rol aprobado, aprobar al usuario con las decisiones
                await approveUser(selectedUser.id, roleDecisions);
                alert('Decisiones enviadas\nLas decisiones de roles han sido registradas correctamente.');
            }

            // Actualizar la lista de usuarios pendientes
            await fetchPendingUsers();
            
        } catch (err) {
            console.error('Error submitting decisions:', err);
            alert('Error al enviar las decisiones. Por favor, intenta nuevamente.');
        } finally {
            setSubmitting(false);
            closeDetails();
        }
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

    if (loading) {
        return (
            <Card className={styles.emptyCard}>
                <CardContent className={styles.emptyContent}>
                    <div className={styles.loadingSpinner}></div>
                    <h3 className={styles.emptyTitle}>
                        Cargando solicitudes...
                    </h3>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={styles.emptyCard}>
                <CardContent className={styles.emptyContent}>
                    <XCircle className={styles.emptyIcon} style={{ color: '#ef4444' }} />
                    <h3 className={styles.emptyTitle}>
                        Error al cargar las solicitudes
                    </h3>
                    <p className={styles.emptyText}>
                        {error}
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={fetchPendingUsers}
                        style={{ marginTop: '1rem' }}
                    >
                        Reintentar
                    </Button>
                </CardContent>
            </Card>
        );
    }

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
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchPendingUsers}
                    disabled={loading}
                >
                    Actualizar
                </Button>
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

                            {/* Roles solicitados - ordenados por jerarquía */}
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

                            {/* Estado de decisiones */}
                            {user.roles_decisiones && user.roles_decisiones.length > 0 && (
                                <div className={styles.decisionsStatus}>
                                    <span className={styles.decisionsLabel}>
                                        Decisiones previas:
                                    </span>
                                    <div className={styles.decisionsBadges}>
                                        {/* Ordenar decisiones por jerarquía también */}
                                        {sortRolesByHierarchy(user.roles_decisiones.map(d => d.rol)).map((role) => {
                                            const decision = user.roles_decisiones.find(d => d.rol === role);
                                            return decision ? (
                                                <Badge
                                                    key={role}
                                                    variant={decision.decision === 'aprobado' ? 'success' : 'destructive'}
                                                    size="sm"
                                                >
                                                    {roleLabels[role] || role}: {decision.decision}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Botón ver detalle */}
                            <Button
                                variant="outline"
                                size="sm"
                                className={styles.detailButton}
                                onClick={() => openDetails(user)}
                                disabled={loadingDetailId === user.id}
                            >
                                {loadingDetailId === user.id ? (
                                    'Cargando...'
                                ):(
                                    <>
                                        <Eye className={styles.icon}/>
                                        Ver Detalle
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de detalles */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if(!open) closeDetails();
                }}>
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

                                {/* Decisión de roles - ORDENADOS POR JERARQUÍA */}
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