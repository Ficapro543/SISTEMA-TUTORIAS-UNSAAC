import { useEffect, useState } from "react";
import styles from "../styles/pages/TutoriasHistoricas.module.css";
import api from "../utils/api";

import BusquedaSelector from "../componentes/BusquedaSelector";
import SemestreSelector from "../componentes/SemestreSelector";
import TablaTutorias from "../componentes/TablaTutorias";
import DetalleTutoriaModal from "../componentes/DetalleTutoriaModal";
import BusquedaEstudiante from "../componentes/BusquedaEstudiante";

function TutoriasHistoricas({ roles }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [semestres, setSemestres] = useState([]);
  const [modoBusqueda, setModoBusqueda] = useState("semestre"); //semestre o estudiante

  //Estados para busqueda por semestre
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);
  
  //Estados para busqueda por estudiante
  const [filtroEstudiante, setFiltroEstudiante] = useState({
    codigo: "",
    nombre: "",
    apellido: ""
  });

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

  const cargarTutoriasPorSemestre = async (semestre) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get('/admin/tutorias', {
        params: { 
          semestre: semestre?.nombre,
        }
      });
      setTutorias(response.data);
    } catch (err) {
      handleApiError(err, 'cargar tutorías');
    } finally {
      setLoading(false);
    }
  };

  const cargarTutoriasPorEstudiante = async(filtros) =>{
    setLoading(true);
    setError("");

    try{
      const response = await api.get('/admin/tutorias/estudiante',{
        params:{
          codigo: filtros.codigo || undefined,
          nombre: filtros.nombre || undefined,
          apellido: filtros.apellido || undefined
        }
      });
      setTutorias(response.data);
    }catch(err){
      handleApiError(err, 'cargar tutorias por estudiante');
    }finally{
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

  const handleModoBusquedaChange = (modo) =>{
    setModoBusqueda(modo);
    setTutorias([]);
    setSemestreSeleccionado(null);
    setFiltroEstudiante({codigo: "", nombre: "", apellido: ""});
    setError("");
  }

  const handleSemestreChange = (semestre) => {
    setSemestreSeleccionado(semestre);
    if(semestre){
      cargarTutoriasPorSemestre(semestre);
    }else{
      setTutorias([]);
    }
  };

  const handleBuscarPorEstudiante = (filtros) => {
    setFiltroEstudiante(filtros);
    //Validamos que minimo haya un filtro
    if(!filtros.codigo && !filtros.nombre && !filtros.apellido){
      setError("Debe ingresar al menos un criterio de busqueda.");
      return;
    }

    cargarTutoriasPorEstudiante(filtros);
  }

  const handleLimpiarBusqueda = () => {
    setTutorias([]);
    setSemestreSeleccionado(null);
    setFiltroEstudiante({codigo: "", nombre: "", apellido: ""});
    setError("");
  }

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
            Consulte registros de acompañamiento académico por semestre o por estudiante
          </p>
        </header>

        <main className={styles.mainContent}>
          {/* Selector de modo de busqueda */}
          <BusquedaSelector
            modo={modoBusqueda}
            onChange={handleModoBusquedaChange}
          />

          {/* Contenido según el modo seleccionado */}
          <div className={styles.searchContent}>
            {modoBusqueda === "semestre" ? (
              <>
                <SemestreSelector
                  semestres={semestres}
                  onChange={handleSemestreChange}
                  value={semestreSeleccionado}
                />
                {semestreSeleccionado && tutorias.length === 0 && !loading && (
                  <div className={styles.emptyState}>
                    <p>No se encontraron tutorías para el semestre seleccionado.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <BusquedaEstudiante
                  onBuscar = {handleBuscarPorEstudiante}
                  onLimpiar = {handleLimpiarBusqueda}
                  valores = {filtroEstudiante}
                />
                {tutorias.length === 0 && !loading && filtroEstudiante.codigo && (
                  <div className={styles.emptyState}>
                    <p>No se encontraron tutorías para el estudiante especificado.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Estados de carga y error */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Cargando registros...</p>
            </div>
          )}

          {error && !loading && (
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

          {/* Mostrar resultados si hay tutorias */}
          {tutorias.length > 0 && !loading && !error && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <h3>Resultados encontrados</h3>
                <p className={styles.resultsCount}>
                  {tutorias.length} {tutorias.length === 1 ? 'registro':'registros'} encontrados
                </p>
              </div>
              <TablaTutorias
                tutorias={tutorias}
                onVerDetalle={(tutoria) => cargarDetalleTutoria(tutoria.id)}
                modo={modoBusqueda}
              />
            </div>
          )}

          {/* Instrucciones iniciales */}
          {tutorias.length === 0 && !loading && !error && (
            <div className={styles.instructions}>
              <p>
                {modoBusqueda === "semestre"
                  ? "Selecciona un semestre para consultar las tutorias realizadas."
                  : "Ingrese los datos del estudiante para consultar su historial de tutorías."
                }
              </p>
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