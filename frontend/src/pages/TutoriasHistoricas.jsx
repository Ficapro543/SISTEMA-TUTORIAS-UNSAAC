import { useEffect, useState } from "react";
import styles from "../styles/pages/TutoriasHistoricas.module.css";

import SemestreSelector from "../componentes/SemestreSelector";
import TablaTutorias from "../componentes/TablaTutorias";
import DetalleTutoriaModal from "../componentes/DetalleTutoriaModal";

function TutoriasHistoricas({ roles }) {
  if (!roles?.administrador) {
    return <p className={styles.errorMessage}>No autorizado</p>;
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
        const res = await fetch("http://localhost:3001/api/admin/semestres", {
            credentials: "include" // 🔑 importante para auth
        });

        if (!res.ok) {
        throw new Error("Error al cargar semestres");
        }

        const data = await res.json();
        setSemestres(data);
    } catch (err) {
        setError(err.message);
    }
  };

  const cargarTutorias = async (semestreId) => {
    setLoading(true);
    setError("");

    try {
        const res = await fetch(
        `http://localhost:3001/api/admin/tutorias?semestreId=${semestreId}`,
        {
            credentials: "include"
        }
        );

        if (!res.ok) {
        throw new Error("Error al cargar tutorías");
        }

        const data = await res.json();
        setTutorias(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const cargarDetalleTutoria = async (id) => {
    try {
        const res = await fetch(
        `http://localhost:3001/api/admin/tutorias/${id}`,
        { credentials: "include" }
        );

        if (!res.ok) {
        throw new Error("Error al cargar detalle");
        }

        const data = await res.json();
        setTutoriaSeleccionada(data);
    } catch (err) {
        setError(err.message);
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

        <DetalleTutoriaModal
          tutoria={tutoriaSeleccionada}
          onClose={() => setTutoriaSeleccionada(null)}
        />
      </div>
    </div>
  );
}

export default TutoriasHistoricas;