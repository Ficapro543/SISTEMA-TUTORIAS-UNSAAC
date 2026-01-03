import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "@/styles/pages/admin/SolicitudDetalle.module.css";

function SolicitudDetalle() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [decisionesRoles, setDecisionesRoles] = useState({});
    const [decisionGlobal, setDecisionGlobal] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/solicitud/${token}`);
                
                if (!res.ok) {
                    // Obtener más detalles del error
                    const errorText = await res.text();
                    console.error("Error del servidor:", errorText);
                    throw new Error(`Error ${res.status}: ${errorText || "Token inválido o expirado"}`);
                }

                const data = await res.json();
                console.log("Datos recibidos:", data); // Para depuración

                // Formatear datos para la UI
                setSolicitud({
                    id: data.id,
                    nombre: `${data.first_name} ${data.last_name}`,
                    email: data.email,
                    rolesSolicitados: Array.isArray(data.roles) ? data.roles : [],
                    estado: "pendiente"
                });

                // Inicializar decisiones de roles como vacías
                const decisionesIniciales = {};

                // Si hay roles_decisiones en la respuesta, usarlos
                if (data.roles_decisiones && Array.isArray(data.roles_decisiones)) {
                    data.roles_decisiones.forEach(item => {
                        if (item && item.rol && item.decision) {
                            decisionesIniciales[item.rol] = item.decision;
                        }
                    });
                }

                // Inicializar roles que no tienen decisión
                if (data.roles && Array.isArray(data.roles)) {
                data.roles.forEach(rol => {
                    if (!decisionesIniciales[rol]) {
                    decisionesIniciales[rol] = null;
                    }
                });
                }

                setDecisionesRoles(decisionesIniciales);

                // Verificar si ya hay una decisión global (todos los roles tienen misma decisión)
                const decisionesValores = Object.values(decisionesIniciales);
                if (decisionesValores.length > 0 && decisionesValores.every(d => d === 'aprobado')) {
                    setDecisionGlobal('aprobada');
                } else if (decisionesValores.length > 0 && decisionesValores.every(d => d === 'rechazado')) {
                    setDecisionGlobal('rechazada');
                }

            } catch (err) {
                console.error("Error al cargar solicitud:", err);
                setError(err.message || "Solicitud no encontrada o token inválido");
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [token]);

    // Función para manejar la aceptación/rechazo de un rol
    const handleRolDecision = async (rol, decision) => {
        // Feedback inmediato
        setDecisionesRoles(prev => ({
            ...prev,
            [rol]: decision
        }));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/solicitud/${solicitud.id}/rol/${rol}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision })
            });

            if (!res.ok) {
                throw new Error('Error en el servidor');
            }

            const result = await res.json();
            console.log(`Rol ${rol} actualizado correctamente`, result);
            
            // Verificar si todos los roles están decididos y tienen la misma decisión
            const nuevaDecisiones = { ...decisionesRoles, [rol]: decision };
            const decisionesValores = Object.values(nuevaDecisiones);
            
            if (decisionesValores.every(d => d === 'aprobado')) {
                setDecisionGlobal('aprobada');
            } else if (decisionesValores.every(d => d === 'rechazado')) {
                setDecisionGlobal('rechazada');
            } else {
                setDecisionGlobal(null);
            }

            // Opcional: mostrar confirmación visual temporal
            console.log(`Rol ${rol} actualizado correctamente`);
        } catch (err) {
            console.error("Error al actualizar rol:", err);
            // Revertir si falla
            setDecisionesRoles(prev => ({
                ...prev,
                [rol]: prev[rol] // Mantener la decisión anterior si existe
            }));
        }
    };

    // Función para volver a la lista
    const volverALista = () => {
        navigate("/solicitudes_registro");
    };

    // Función para aprobar/rechazar toda la solicitud
    const handleSolicitudDecision = async (decision) => {
        if (!solicitud) return;

        setDecisionGlobal(decision);

        // Actualiza todos los roles visualmente
        const updatedRoles = {};
        const rolDecision = decision === 'aprobada' ? 'aprobado' : 'rechazado';
        solicitud.rolesSolicitados.forEach(rol => {
            updatedRoles[rol] = rolDecision;
        });
        setDecisionesRoles(updatedRoles);

        // Enviar todas las decisiones al backend
        try {
            // Enviar cada decisión de rol individualmente
            const promises = solicitud.rolesSolicitados.map(rol =>
                fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/solicitud/${solicitud.id}/rol/${rol}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ decision: rolDecision })
                })
            );
            
            await Promise.all(promises);
            
            // Luego ejecutar la acción global
            if (decision === 'aprobada') {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/aprobar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pendingUserId: solicitud.id })
                });
            } else {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/rechazar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pendingUserId: solicitud.id })
                });
            }

            // Redirigir después de 1.5 segundos para que el usuario vea el cambio
            setTimeout(() => {
                volverALista();
            }, 1500);
        } catch (err) {
            console.error("Error al procesar solicitud:", err);
            setDecisionGlobal(null); // Revertir si hay error
            // Revertir roles visualmente si falla
            setDecisionesRoles(prev => {
                const reverted = {};
                Object.keys(prev).forEach(rol => reverted[rol] = null);
                return reverted;
            });
        }
    };

    // Función para obtener el texto del botón según la decisión del rol
    const getRolButtonText = (rol, decision) => {
        if (decision === 'aprobado') return '✓ Aprobado';
        if (decision === 'rechazado') return '✗ Rechazado';
        return decision === 'aprobado' ? '✓ Aprobado' : '✗ Rechazar Rol';
    };

    // Verificar si todos los roles tienen decisión
    const todosRolesDecididos = solicitud &&
        solicitud.rolesSolicitados.every(rol => decisionesRoles[rol] !== null);

    if (loading) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando detalles de la solicitud...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>
                        <img src="error-icon.svg" alt="Error" />
                    </div>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={volverALista} className={styles.backButton}>
                        ← Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    if (!solicitud) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.noData}>
                    <h3>No se encontraron datos</h3>
                    <button onClick={volverALista} className={styles.backButton}>
                        ← Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detailPage}>
            <div className={styles.detailContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <h1>Detalle de Solicitud</h1>
                    <p>Revisión de solicitud de registro</p>
                    <button onClick={volverALista} className={styles.backButton}>
                        ← Volver a la lista
                    </button>
                </div>

                {/* Información del solicitante */}
                <div className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>Información del Solicitante</h2>

                    <div className={styles.infoCard}>
                        <div className={styles.infoRow}>
                            <strong>Nombre:</strong>
                            <span>{solicitud.nombre}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <strong>Email:</strong>
                            <span>{solicitud.email}</span>
                        </div>

                        <div className={styles.infoRow}>
                            <strong>Estado:</strong>
                            <span className={styles.badgePendiente}>PENDIENTE</span>
                        </div>
                    </div>
                </div>

                {/* Roles Solicitados */}
                <div className={styles.rolesSection}>
                    <h2 className={styles.sectionTitle}>Roles Solicitados</h2>

                    {solicitud.rolesSolicitados.length === 0 ? (
                        <div className={styles.noRoles}>
                            <p>No se solicitaron roles específicos</p>
                        </div>
                    ) : (
                        <div className={styles.rolesList}>
                            {solicitud.rolesSolicitados.map((rol, index) => {
                                const decision = decisionesRoles[rol];

                                return (
                                    <div key={index} className={`${styles.rolItem} ${decision === 'aprobado' ? styles.rolAprobado :
                                            decision === 'rechazado' ? styles.rolRechazado : ''
                                        }`}>
                                        <div className={styles.rolInfo}>
                                            <div className={styles.rolIcon}>
                                                <img src={`/${rol.toLowerCase()}Icon.svg`} alt={rol} />
                                            </div>
                                            <span className={styles.rolNombre}>{rol}</span>
                                        </div>

                                        <div className={styles.rolAcciones}>
                                            {decision === null ? (
                                                // Mostrar ambos botones si no hay decisión
                                                <>
                                                    <button
                                                        onClick={() => handleRolDecision(rol, 'aprobado')}
                                                        className={styles.btnAprobarRol}
                                                    >
                                                        ✓ Aprobar Rol
                                                    </button>
                                                    <button
                                                        onClick={() => handleRolDecision(rol, 'rechazado')}
                                                        className={styles.btnRechazarRol}
                                                    >
                                                        ✗ Rechazar Rol
                                                    </button>
                                                </>
                                            ) : (
                                                // Mostrar solo el botón de la decisión tomada
                                                <button
                                                    className={
                                                        decision === 'aprobado'
                                                            ? styles.btnAprobadoConfirmado
                                                            : styles.btnRechazadoConfirmado
                                                    }
                                                    disabled
                                                >
                                                    {getRolButtonText(rol, decision)}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {todosRolesDecididos && (
                        <div className={styles.todosDecididos}>
                            <p>✓ Todos los roles han sido revisados</p>
                        </div>
                    )}
                </div>

                {/* Acciones Globales */}
                <div className={styles.accionesGlobales}>
                    <h2 className={styles.sectionTitle}>Acciones Globales</h2>
                    <div className={styles.accionesButtons}>
                        <button
                            onClick={() => handleSolicitudDecision('aprobada')}
                            className={`${styles.btnAprobarTodo} ${decisionGlobal === 'aprobada' ? styles.btnAprobadoConfirmado : ''
                                }`}
                            disabled={decisionGlobal !== null}
                        >
                            {decisionGlobal === 'aprobada' ? '✓ Aprobada' : '✓ Aprobar Toda la Solicitud'}
                        </button>
                        <button
                            onClick={() => handleSolicitudDecision('rechazada')}
                            className={`${styles.btnRechazarTodo} ${decisionGlobal === 'rechazada' ? styles.btnRechazadoConfirmado : ''
                                }`}
                            disabled={decisionGlobal !== null}
                        >
                            {decisionGlobal === 'rechazada' ? '✗ Rechazada' : '✗ Rechazar Toda la Solicitud'}
                        </button>
                    </div>

                    {decisionGlobal && (
                        <div className={styles.decisionConfirmada}>
                            <p>
                                Solicitud {decisionGlobal === 'aprobada' ? 'aprobada' : 'rechazada'}.
                                Redirigiendo a la lista...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SolicitudDetalle;