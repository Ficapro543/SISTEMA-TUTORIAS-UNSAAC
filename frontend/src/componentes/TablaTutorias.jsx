import styles from "../styles/components/TablaTutorias.module.css";

function TablaTutorias({ tutorias, onVerDetalle }) {
  if (tutorias.length === 0) {
    return <p>No hay tutorías registradas.</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Tutor</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tutorias.map((t) => (
            <tr key={t.id}>
              <td>{t.estudiante}</td>
              <td>{t.tutor}</td>
              <td>{t.tipo}</td>
              <td>{t.fecha}</td>
              <td>
                <button
                 className={styles.viewBtn}
                 onClick={() => onVerDetalle(t)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaTutorias;
