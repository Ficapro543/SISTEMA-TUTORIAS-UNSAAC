import { useEffect, useState } from "react";
import styles from "../styles/components/BusquedaEstudiante.module.css";

function BusquedaEstudiante({ onBuscar, onLimpiar, valores = {} }) {
  const [codigo, setCodigo] = useState(valores.codigo || "");
  const [nombre, setNombre] = useState(valores.nombre || "");
  const [apellido, setApellido] = useState(valores.apellido || "");
  const [buscarPor, setBuscarPor] = useState("codigo"); //"codigo", "nombre"

  //Sincronizar con valores externos
  useEffect(()=>{
    if(valores){
      setCodigo(valores.codigo || "");
      setNombre(valores.nombre || "");
      setApellido(valores.apellido || "");
    }
  }, [valores]);

  const handleBuscar = () => {
    //Validacion
    if(buscarPor === "codigo" && !codigo.trim()){
      return;
    }
    if(buscarPor === "nombre" && (!nombre.trim() && !apellido.trim())){
      return;
    }

    onBuscar({codigo, nombre, apellido});
  };

  const handleLimpiar = () => {
    setCodigo("");
    setNombre("");
    setApellido("");
    setBuscarPor("codigo");
    onLimpiar();
  };

  const handleBuscarPorChange = (modo) =>{
    setBuscarPor(modo);
    if(modo === "codigo"){
      setNombre("");
      setApellido("");
    }else if(modo === "nombre"){
      setCodigo("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Consulta por Estudiante</h3>
        <p className={styles.subtitle}>
          Busque el historial de tutorías por código o nombre del estudiante
        </p>
      </div>

      <div className={styles.selector}>
        <div className={styles.selectorOptions}>
          <button
            className={`${styles.selectorOption} ${buscarPor === "codigo" ? styles.active : ""}`}
            onClick={() => handleBuscarPorChange("codigo")}
          >
            Por Código
          </button>
          <button
            className={`${styles.selectorOption} ${buscarPor === "nombre" ? styles.active : ""}`}
            onClick={() => handleBuscarPorChange("nombre")}
          >
            Por Nombre
          </button>
        </div>
      </div>
      
      <div className={styles.form}>
        {(buscarPor === "codigo" || buscarPor === "ambos") && (
          <div className={styles.inputGroup}>
            <label htmlFor="codigo-estudiante" className={styles.label}>
              Código de Estudiante
            </label>
            <input
              id="codigo-estudiante"
              type="text"
              placeholder="Ej: 200000"
              value={codigo}
              onChange={(e)=>setCodigo(e.target.value)}
              className={styles.input}
              autoComplete="off"
            />
          </div>
        )}

        {(buscarPor === "nombre" || buscarPor === "ambos") && (
          <div className={styles.nameGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="nombre-estudiante" className={styles.label}>
                Nombre(s)
              </label>
              <input
                id="nombre-estudiante"
                type="text"
                placeholder="Ej: Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={styles.input}
                autoComplete="off"
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="apellido-estudiante" className={styles.label}>
                Apellido(s)
              </label>
              <input
                id="apellido-estudiante"
                type="text"
                placeholder="Ej: Pérez García"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={styles.input}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={styles.searchButton}
            onClick={handleBuscar}
            disabled={
              (buscarPor === "codigo" && !codigo.trim()) ||
              (buscarPor === "nombre" && (!nombre.trim() && !apellido.trim()))
            }
          >
            <span className={styles.buttonIcon}>🔍</span>
            Buscar Historial
          </button>
          <button
            className={styles.clearButton}
            onClick={handleLimpiar}
          >
            Limpiar
          </button>
        </div>

        <div className={styles.hint}>
          <p className={styles.hintText}>
            <strong>Nota:</strong> El historial mostrará todas las tutorías del estudiante, 
            organizadas por semestre y fecha.
          </p>
        </div>

      </div>
    </div>
  );
}

export default BusquedaEstudiante;