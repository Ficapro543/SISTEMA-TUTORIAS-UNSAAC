import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "../styles/pages/TutoriasHistoricas.module.css";
import api from "../utils/api";

import SemestreSelector from "../componentes/SemestreSelector";
import TablaTutorias from "../componentes/TablaTutorias";
import DetalleTutoriaModal from "../componentes/DetalleTutoriaModal";

function TutoriasHistoricas({ roles }) {
  // Verificar roles desde localStorage
  const [userRoles, setUserRoles] = useState(roles || {});
  // Verifica si el usuario es administrador
  useEffect(() => {
    // Si roles no viene por props, intentar obtener de localStorage
    if (!roles) {
      try {
        const storedRoles = localStorage.getItem('userRoles');
        if (storedRoles) {
          const parsedRoles = JSON.parse(storedRoles);
          // Convertir array de roles a objeto {administrador: true, ...}
          const rolesObj = {};
          if (Array.isArray(parsedRoles)) {
            parsedRoles.forEach(role => {
              rolesObj[role.toLowerCase()] = true;
            });
          }
          setUserRoles(rolesObj);
        }
      } catch (error) {
        console.error('Error obteniendo roles:', error);
      }
    }
  }, [roles]);

  if (!userRoles?.administrador) {
    return console.error("Acceso denegado: Se requieren permisos de administrador")
  }

  const [semestres, setSemestres] = useState([]);
  const [semestreSeleccionado, setSemestreSeleccionado] = useState(null);

  const [tutorias, setTutorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);

  useEffect(() => {
    cargarSemestres();
  }, []);

  const cargarSemestres = async () => {
    try {
      const response = await api.get('/admin/semestres');
      setSemestres(response.data);

    } catch (err) {
      console.error('Error cargando semestres:', err);
      if(err.response?.status === 401){
        setError('Sesión expirada. Por favor, inicia sesión nuevamente');
        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      }else{
        setError(err.response?.data?.message || 'Error al cargar semestres');
      }
    }
  };

  const cargarTutorias = async (semestreId) => {
    setLoading(true);
    setError("");

    try {
        const response = await api.get('/admin/tutorias',{
          params: {semestreId}
        });
        setTutorias(response.data);

    } catch (err) {
      console.error('Error cargando tutorías:', err);
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err.response?.data?.message || 'Error al cargar tutorías');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleTutoria = async (id) => {
    try {
      const response = await api.get(`/admin/tutorias/${id}`);
      setTutoriaSeleccionada(response.data);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      setError(err.response?.data?.message || 'Error al cargar el detalle');
    }
  };

  const handleSemestreChange = (semestre) => {
    if (!semestre) return;
    setSemestreSeleccionado(semestre);
    setTutorias([]);
    cargarTutorias(semestre.id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2>Tutorías de Semestres Anteriores</h2>
        <p className={styles.subtitle}>
          Consulta histórica del acompañamiento académico
        </p>

        <SemestreSelector
          semestres={semestres}
          onChange={handleSemestreChange}
        />

        {loading && <p>Cargando tutorías...</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {!loading && semestreSeleccionado && (
          <TablaTutorias
            tutorias={tutorias}
            onVerDetalle={cargarDetalleTutoria}
          />
        )}

        {!loading && semestreSeleccionado && tutorias.length === 0 && !error && (
          <p>
            No hay tutorías registradas para este semestre.
          </p>
        )}

        <DetalleTutoriaModal
          tutoria={tutoriaSeleccionada}
          onClose={() => setTutoriaSeleccionada(null)}
        />
      </div>
    </div>
  );
}

export default TutoriasHistoricas;