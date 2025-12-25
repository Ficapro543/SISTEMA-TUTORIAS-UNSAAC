import styles from "../styles/components/DetalleTutoriaModal.module.css";

function DetalleTutoriaModal({ tutoria, onClose }) {
  if (!tutoria) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Detalle de Tutoría</h3>

        <p><strong>Estudiante:</strong> {tutoria.estudiante}</p>
        <p><strong>Tutor:</strong> {tutoria.tutor}</p>
        <p><strong>Tipo:</strong> {tutoria.tipo}</p>
        <p><strong>Fecha:</strong> {tutoria.fecha}</p>
        <p><strong>Observaciones:</strong></p>
        <p className={styles.observaciones}>{tutoria.observaciones}</p>

        <button className={styles.closeBtn} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default DetalleTutoriaModal;