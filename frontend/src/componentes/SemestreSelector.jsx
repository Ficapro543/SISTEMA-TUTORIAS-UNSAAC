import styles from "../styles/components/SemestreSelector.module.css";

function SemestreSelector({ semestres, onChange }) {
  return (
    <div className={styles.formGroup}>
      <label>Semestre académico</label>
      <select
        defaultValue=""
        onChange={(e) => {
          const semestre = semestres.find(
            (s) => s.id === Number(e.target.value)
          );
          onChange(semestre);
        }}
      >
        <option value="" disabled>
          Seleccionar semestre
        </option>
        {semestres.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SemestreSelector;