import React, {useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/components/AprobarRegistro.module.css";

function AprobarRegistro() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de prueba
  const mockSolicitudes = [
    {
      id:1,
      nombre: "Juan Pérez",
      email: "juan.perez@unsaac.edu.pe",
      fechaSolicitud: "2024-01-15",
      rolesSolicitados: ["Tutor","Evaluador","Administrador"],
      estado: "pendiente"
    },
    {
      id:2,
      nombre: "María Garcia",
      email: "maria.garcia@unsaac.edu.pe",
      fechaSolicitud: "2024-01-14",
      rolesSolicitados: ["Tutor"],
      estado: "pendiente"
    },
    {
      id:3,
      nombre: "Carlos Lopez",
      email: "carlos.lopez@unsaac.edu.pe",
      fechaSolicitud: "2024-01-13",
      rolesSolicitados: ["Evaluador","Administrador"],
      estado: "pendiente"
    },
    {
      id:4,
      nombre: "Ana Torres",
      email: "ana.torres@unsaac.edu.pe",
      fechaSolicitud: "2024-01-12",
      rolesSolicitados: ["Tutor","Evaluador"],
      estado: "pendiente"
    },
  ]

  useEffect(()=>{
    //Simular carga de datos del backend
    const fetchSolicitudes = async () =>{
      try{
        setLoading(true);
        //// Backend
        // const response = await fetch ('/api/solicitudes');
        // const data = await response.json;
        setTimeout(()=>{
          setSolicitudes(mockSolicitudes);
          setLoading(false);
        },1000);
      }catch(err){
        console.error("Error al cargar solicitudes:",err);
        setError("No se pudieron cargar las solicitudes. Intenta nuevamente.");
        setLoading(false);
      }
    };
    fetchSolicitudes();
  }, []);

  //Funcion para manejar la aceptacion/rechazo de un rol especifico
  const handleRolDecision = (solicitudId, rol, decision) =>{
    console.log(`Solicitud ${solicitudId}: Rol ${rol} -> ${decision}`);
    
    // TODO: Backend peticiones
    // await fetch(`/api/solicitudes/${solicitudId}/rol/${rol}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ decision })
    // });

    //Actualizar UI
    setSolicitudes(prev => prev.map(solicitud => {
      if(solicitud.id === solicitudId){
        return{
          ...solicitud,
          //BackEnd
        };
      }
      return solicitud;
    }));

    alert(`Rol ${rol} ${decision === 'aprobado' ? 'aprobado' : 'rechazado'} para la solicitud ${solicitudId}`);
  };

  // Funcion para aprobar/rechazar toda la solicitud
  const handleSolicitudDecision = (solicitudId, decision) =>{
    console.log(`Solicitud ${solicitudId}: ${decision}`);
    // Aquí iría la llamada al backend
    // await fetch(`/api/solicitudes/${solicitudId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ decision })
    // });

    // Remover de la lista (temporal)
    setSolicitudes(prev => prev.filter(s => s.id !== solicitudId));
    
    alert(`Solicitud ${solicitudId} ${decision === 'aprobada' ? 'aprobada' : 'rechazada'} completamente`);
  };

  // Funcion para ver detalles
  const verDetalles = (solicitud) => {
    console.log("Ver detalles: ",solicitud);
    // Podrías navegar a una página de detalles o mostrar un modal
    alert(`Detalles de ${solicitud.nombre}:\nEmail: ${solicitud.email}\nRoles: ${solicitud.rolesSolicitados.join(", ")}`);
  }

  // Función para volver atras
  const volverInicio = () => {
    navigate("/");
  };

  if(loading){
    return (
      <div className={styles.adminPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminPage}>
        <div className={styles.errorContainer}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.header}>
        <h1>Solicitudes de Registro Pendientes</h1>
        <p>Total: {solicitudes.length} solicitud(es)</p>
        <button onClick={volverInicio} className={styles.backButton}>
          ← Volver al Dashboard
        </button>
      </div>

      {solicitudes.length === 0 ? (
        <div className={styles.noSolicitudes}>
          <p>No hay solicitudes pendientes por revisar.</p>
        </div>
      ) : (
        <div className={styles.solicitudesGrid}>
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className={styles.solicitudCard}>
              <div className={styles.cardHeader}>
                <h3>{solicitud.nombre}</h3>
                <span className={styles.badgePendiente}>PENDIENTE</span>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <strong>Email:</strong>
                  <span>{solicitud.email}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <strong>Fecha:</strong>
                  <span>{new Date(solicitud.fechaSolicitud).toLocaleDateString()}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <strong>Roles Solicitados:</strong>
                  <div className={styles.rolesList}>
                    {solicitud.rolesSolicitados.map((rol, index) => (
                      <div key={index} className={styles.rolItem}>
                        <span className={styles.rolNombre}>{rol}</span>
                        <div className={styles.rolAcciones}>
                          <button
                            onClick={() => handleRolDecision(solicitud.id, rol, 'aprobado')}
                            className={styles.btnAprobarRol}
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => handleRolDecision(solicitud.id, rol, 'rechazado')}
                            className={styles.btnRechazarRol}
                          >
                            ✗ Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <button
                  onClick={() => verDetalles(solicitud)}
                  className={styles.btnDetalles}
                >
                  Ver Detalles
                </button>
                
                <div className={styles.accionesGlobales}>
                  <button
                    onClick={() => handleSolicitudDecision(solicitud.id, 'aprobada')}
                    className={styles.btnAprobarTodo}
                  >
                    Aprobar Todo
                  </button>
                  <button
                    onClick={() => handleSolicitudDecision(solicitud.id, 'rechazada')}
                    className={styles.btnRechazarTodo}
                  >
                    Rechazar Todo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AprobarRegistro;