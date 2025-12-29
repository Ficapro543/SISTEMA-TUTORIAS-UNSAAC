import { useEffect, useMemo, useState } from "react";
import "../../styles/AsignarTutorados.css";

/**
 * Pantalla: Asignación de tutorados
 *
 * Requisitos:
 * - Espera estos endpoints (ajusta las URLs si tu backend difiere):
 *   GET  /api/semestres/activo                     -> { id, nombre }
 *   GET  /api/tutores?search=...                    -> [{ id, nombre, codigo, contadorTutorados }]
 *   GET  /api/estudiantes/sin-tutor?semestreId=ID  -> [{ id, nombre, codigo, ciclo }]
 *   POST /api/asignaciones                          -> { tutorId, estudiantesIds: [], semestreId }
 *
 * - Si tu backend usa otras rutas o nombres de campos, cámbialos en las constantes abajo.
 *
 * Notas:
 * - Control de acceso: aquí muestro la pantalla sin integración con el sistema de roles.
 *   En tu app, renderiza esta ruta sólo si roles.administrador === true (ver instrucciones abajo).
 */

const API = {
  semestreActivo: "/api/semestres/activo",
  buscarTutores: (q) => `/api/tutores?search=${encodeURIComponent(q || "")}`,
  estudiantesSinTutor: (semestreId) =>
    `/api/estudiantes/sin-tutor?semestreId=${encodeURIComponent(semestreId || "")}`,
  asignar: "/api/asignaciones",
};

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function AsignarTutorados() {
  // estados
  const [semestre, setSemestre] = useState(null);
  const [tutorQuery, setTutorQuery] = useState("");
  const tutorQueryDeb = useDebounced(tutorQuery, 350);
  const [tutores, setTutores] = useState([]);
  const [tutorSeleccionado, setTutorSeleccionado] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [loadingTutores, setLoadingTutores] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Cargar semestre activo
  useEffect(() => {
    setLoading(true);
    fetch(API.semestreActivo)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo obtener el semestre activo");
        return r.json();
      })
      .then((data) => {
        setSemestre(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Buscar tutores cuando cambie la query
  useEffect(() => {
    let ignore = false;
    setLoadingTutores(true);
    fetch(API.buscarTutores(tutorQueryDeb))
      .then((r) => {
        if (!r.ok) throw new Error("Error al buscar tutores");
        return r.json();
      })
      .then((data) => {
        if (!ignore) setTutores(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoadingTutores(false);
      });
    return () => {
      ignore = true;
    };
  }, [tutorQueryDeb]);

  // Cargar estudiantes sin tutor para el semestre activo
  useEffect(() => {
    if (!semestre?.id) return;
    setLoadingEstudiantes(true);
    fetch(API.estudiantesSinTutor(semestre.id))
      .then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los estudiantes");
        return r.json();
      })
      .then((data) => {
        setEstudiantes(Array.isArray(data) ? data : []);
        setSelectedIds(new Set()); // limpiar selección al recargar
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingEstudiantes(false));
  }, [semestre]);

  const toggleSelect = (id) => {
    const s = new Set(selectedIds);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedIds(s);
  };

  const selectAllVisible = () => {
    const s = new Set(selectedIds);
    estudiantes.forEach((e) => s.add(e.id));
    setSelectedIds(s);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const canAssign = tutorSeleccionado && selectedIds.size > 0 && semestre?.id;

  const handleAssign = async () => {
    if (!canAssign) return;
    // Confirmación previa con resumen
    const ok = window.confirm(
      `Vas a asignar ${selectedIds.size} estudiante(s) al tutor ${tutorSeleccionado.nombre} (${tutorSeleccionado.codigo}) para el semestre ${semestre?.nombre}. ¿Continuar?`
    );
    if (!ok) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(API.asignar, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: tutorSeleccionado.id,
          estudiantesIds: Array.from(selectedIds),
          semestreId: semestre.id,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        // Si backend devuelve lista de conflictivos, mostrarla
        if (payload?.conflictos) {
          setError(
            `No se asignaron ${payload.conflictos.length} estudiante(s) porque ya tienen tutor en este semestre: ${payload.conflictos
              .map((c) => c.codigo || c.id)
              .join(", ")}`
          );
        } else {
          setError(payload?.message || "Error del servidor al asignar");
        }
      } else {
        setSuccessMsg(`Asignación completada: ${payload?.asignadas || selectedIds.size} estudiante(s).`);
        // Actualizar lista de estudiantes (eliminar los asignados)
        if (Array.isArray(payload?.asignadasIds)) {
          const asignadasIds = new Set(payload.asignadasIds);
          setEstudiantes((prev) => prev.filter((e) => !asignadasIds.has(e.id)));
          setSelectedIds(new Set());
        } else {
          // si no se devuelve ids, refrescar por simplicidad
          // Re-fetch estudiantes sin tutor
          const r2 = await fetch(API.estudiantesSinTutor(semestre.id));
          const data2 = await r2.json();
          setEstudiantes(Array.isArray(data2) ? data2 : []);
          setSelectedIds(new Set());
        }
      }
    } catch (err) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  // derived
  const selectedCount = selectedIds.size;
  const allVisibleSelected = useMemo(
    () => estudiantes.length > 0 && estudiantes.every((e) => selectedIds.has(e.id)),
    [estudiantes, selectedIds]
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Asignación de tutorados</h1>

      {/* Mensajes */}
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
      {successMsg && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{successMsg}</div>}
      <div className="mb-4 text-sm text-gray-600">Un estudiante solo puede tener un tutor por semestre.</div>

      {/* Selector de semestre */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Semestre</label>
        <div className="mt-1">
          <input
            readOnly
            value={semestre ? semestre.nombre : "Cargando..."}
            className="border rounded px-3 py-2 w-64 bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de selección: buscador de tutores + panel info */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">Buscar tutor (nombre o código)</label>
          <input
            value={tutorQuery}
            onChange={(e) => setTutorQuery(e.target.value)}
            placeholder="Escribe nombre o código..."
            className="mt-1 border rounded px-3 py-2 w-full"
          />
          <div className="mt-2">
            {loadingTutores ? (
              <div className="text-sm text-gray-500">Buscando tutores...</div>
            ) : (
              <ul className="border rounded divide-y mt-2 max-h-60 overflow-auto">
                {tutores.length === 0 && <li className="p-2 text-sm text-gray-500">No hay resultados.</li>}
                {tutores.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => setTutorSeleccionado(t)}
                    className={`p-2 cursor-pointer hover:bg-gray-50 ${tutorSeleccionado?.id === t.id ? "bg-blue-50" : ""}`}
                  >
                    <div className="font-medium">{t.nombre}</div>
                    <div className="text-xs text-gray-500">{t.codigo}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Panel info tutor */}
          <div className="mt-4 border rounded p-4 bg-white">
            <h3 className="font-medium">Tutor seleccionado</h3>
            {!tutorSeleccionado ? (
              <div className="text-sm text-gray-500 mt-2">Ninguno</div>
            ) : (
              <div className="mt-2 text-sm text-gray-700">
                <div className="font-semibold">{tutorSeleccionado.nombre}</div>
                <div className="text-xs text-gray-500">Código: {tutorSeleccionado.codigo}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Tutorados actuales: {tutorSeleccionado.contadorTutorados ?? 0}
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => setTutorSeleccionado(null)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Quitar selección
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de estudiantes (ocupa 2 columnas en desktop) */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Estudiantes sin tutor en el semestre</h2>
            <div className="text-sm text-gray-600">{loadingEstudiantes ? "Cargando..." : `${estudiantes.length} estudiantes`}</div>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              onClick={selectAllVisible}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Seleccionar todos
            </button>
            <button onClick={clearSelection} className="px-3 py-1 border rounded text-sm">
              Limpiar selección
            </button>
            <div className="ml-auto text-sm text-gray-600">Seleccionados: {selectedCount}</div>
          </div>

          <div className="overflow-auto border rounded">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(e) => {
                        if (e.target.checked) selectAllVisible();
                        else clearSelection();
                      }}
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium">Código</th>
                  <th className="px-3 py-2 text-left text-sm font-medium">Nombre completo</th>
                  <th className="px-3 py-2 text-left text-sm font-medium">Ciclo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {estudiantes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-sm text-gray-500">
                      {loadingEstudiantes ? "Cargando estudiantes..." : "No hay estudiantes disponibles"}
                    </td>
                  </tr>
                )}
                {estudiantes.map((e, idx) => (
                  <tr key={e.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm">{e.codigo}</td>
                    <td className="px-3 py-2 text-sm">{e.nombre}</td>
                    <td className="px-3 py-2 text-sm">{e.ciclo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAssign}
              disabled={!canAssign || loading}
              className={`px-4 py-2 rounded text-white ${canAssign ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
            >
              {loading ? "Asignando..." : "Asignar seleccionados"}
            </button>

            <button onClick={clearSelection} className="px-3 py-2 border rounded">
              Limpiar selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}