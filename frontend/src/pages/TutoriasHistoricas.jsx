import { useEffect, useState } from "react";
import styles from "../styles/pages/TutoriasHistoricas.module.css";
import api from "../utils/api";

import SemestreSelector from "../componentes/SemestreSelector";
import TablaTutorias from "../componentes/TablaTutorias";
import DetalleTutoriaModal from "../componentes/DetalleTutoriaModal";

function TutoriasHistoricas({ roles }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [semestres, setSemestres] = useState([]);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);
  const [tutorias, setTutorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);

  // Verificar permisos de administrador
  useEffect(() => {
    const verifyAdmin = () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsAdmin(false);
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRoles = payload.roles || [];
        const isAdminUser = userRoles.includes('administrador') || userRoles.includes('admin');
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error verificando permisos:', error);
        setIsAdmin(false);
      } finally {
        setLoadingAuth(false);
      }
    };

    verifyAdmin();
  }, []);

  // Cargar semestres cuando se confirma admin
  useEffect(() => {
    if (isAdmin) {
      cargarSemestres();
    }
  }, [isAdmin]);

  const cargarSemestres = async () => {
    try {
      const response = await api.get('/admin/semestres');
      setSemestres(response.data);
    } catch (err) {
      handleApiError(err, 'cargar semestres');
    }
  };

  const cargarTutorias = async (semestreNombre) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get('/admin/tutorias', {
        params: { semestre: semestreNombre }
      });
      setTutorias(response.data);
    } catch (err) {
      handleApiError(err, 'cargar tutorías');
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleTutoria = async (id) => {
    try {
      const response = await api.get(`/admin/tutorias/${id}`);
      setTutoriaSeleccionada(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el detalle');
    }
  };

  const handleSemestreChange = (semestre) => {
    if (!semestre) return;
    setSemestreSeleccionado(semestre);
    setTutorias([]);
    cargarTutorias(semestre.nombre);
  };

  const handleApiError = (err, context) => {
    console.error(`Error al ${context}:`, err);
    
    if (err.response?.status === 401) {
      setError('Sesión expirada. Redirigiendo al inicio de sesión...');
      setTimeout(() => window.location.href = '/login', 2000);
    } else if (err.response?.status === 403) {
      setIsAdmin(false);
      setError('Acceso denegado. Permisos insuficientes.');
    } else {
      setError(err.response?.data?.message || `Error al ${context}`);
    }
  };

  // Estados de carga
  if (loadingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Verificando permisos de acceso...</p>
      </div>
    );
  }

  // Acceso denegado
  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h2>Acceso Restringido</h2>
        <p className={styles.accessMessage}>
          Esta sección requiere permisos de administrador.
        </p>
        {error && <p className={styles.errorText}>{error}</p>}
        <button 
          className={styles.returnButton}
          onClick={() => window.history.back()}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tutorías Históricas</h1>
          <p className={styles.subtitle}>
            Consulta de registros de acompañamiento académico por semestre
          </p>
        </header>

        <main className={styles.mainContent}>
          <SemestreSelector
            semestres={semestres}
            onChange={handleSemestreChange}
          />

          {loading && (
            <div className={styles.loadingState}>
              <p>Cargando registros...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorAlert}>
              <p>{error}</p>
              <button 
                className={styles.dismissButton}
                onClick={() => setError("")}
              >
                Cerrar
              </button>
            </div>
          )}

          {semestreSeleccionado && !loading && !error && (
            <div className={styles.resultsSection}>
              <TablaTutorias
                tutorias={tutorias}
                onVerDetalle={(tutoria) => cargarDetalleTutoria(tutoria.id)}
              />
            </div>
          )}

          {semestreSeleccionado && tutorias.length === 0 && !loading && !error && (
            <div className={styles.emptyState}>
              <p>No se encontraron tutorías registradas para este semestre.</p>
            </div>
          )}

          {!semestreSeleccionado && !loading && !error && semestres.length > 0 && (
            <div className={styles.instructions}>
              <p>Seleccione un semestre para consultar las tutorías realizadas.</p>
            </div>
          )}
        </main>

        <DetalleTutoriaModal
          tutoria={tutoriaSeleccionada}
          onClose={() => setTutoriaSeleccionada(null)}
        />
      </div>
    </div>
  );
}

export default TutoriasHistoricas;