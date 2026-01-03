import styles from "@/styles/components/BusquedaSelector.module.css";

function BusquedaSelector({modo, onChange}){
  return(
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tipo de Consulta</h3>
        <p className={styles.subtitle}>
          Seleccione cómo desea realizar la consulta de tutorías
        </p>
      </div>

      <div className={styles.selector}>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${modo === "semestre" ? styles.active : ""}`}
            onClick={()=>onChange("semestre")}
          >
            <span className={styles.optionIcon}>📅</span>
            <div className={styles.optionContent}>
              <h4 className={styles.optionTitle}>Por Semestre</h4>
              <p className={styles.optionDescription}>
                Consulta todas las tutorias realizadas en un periodo académico específico
              </p>
            </div>
          </button>

          <button
            className={`${styles.option} ${modo === "estudiante" ? styles.active : ""}`}
            onClick={() => onChange("estudiante")}
          >
            <span className={styles.optionIcon}>👨‍🎓</span>
            <div className={styles.optionContent}>
              <h4 className={styles.optionTitle}>Por Estudiante</h4>
              <p className={styles.optionDescription}>
                Consulta el historial completo de tutorías de un estudiante
              </p>
            </div>
          </button>
        </div>

        <div className={styles.selectedIndicator}>
          <span className={styles.indicatorLabel}>Modo actual:</span>
          <span className={styles.indicatorValue}>
            {modo === "semestre" ? "Por semestre" : "Por estudiante"}
          </span>
        </div>
      </div>
    </div>
  )

}
export default BusquedaSelector;