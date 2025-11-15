import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/components/Registro.module.css"

function Register() {
  const navigate = useNavigate();

  // Estados del formulario
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rol, setRol] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tooltip, setTooltip] = useState({visible: false, content: "", x: 0, y: 0});

  // Regex correo institucional
  const emailRegex = /^[a-zA-Z0-9._%+-]+@unsaac\.edu\.pe$/;

  // Funciones de manejo
  const handleRolClick = (rolSeleccionado) =>{
    setRol((prev)=>
      prev.includes(rolSeleccionado)
        ? prev.filter((r) => r !== rolSeleccionado)
        : [...prev, rolSeleccionado]
      );
  };

  const handleTooltipShow = (content, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      content,
      x: (rect.left + rect.width / 2) - 5.5,
      y: rect.top - 90,
    });
  };

  const handleTooltipHide = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if(!nombres || !apellidos || !correo || !password || !confirmar){
      setError("Por favor, completa todos los campos.");
      return;
    }

    if(!emailRegex.test(correo)){
      setError("El correo debe ser institucional (@unsaac.edu.pe).");
      return;
    }

    if(password.length < 8){
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if(password !== confirmar){
      setError("Las contraseñas no coinciden.");
      return;
    }

    if(rol.length === 0){
      setError("Por favor, selecciona al menos un rol.");
      return;
    }

    //Envio simulado al backend
    try{
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombres, 
          apellidos, 
          correo,
          password,
          roles: rol 
        }),
      });

      const data = await response.json();
      if(response.ok){
        setSuccess(`Su solicitud fue recibida. Se le enviará un correo a ${correo} indicando el estado de su registro`);
        setTimeout(() => navigate("/login"), 4000);
      }else{
        setError(data.message || "Error en el registro. Inténtalo de nuevo.");
      }
    } catch(err){
      setError("No se pudo conectar con el servidor.");
    }
  };

  const handleGoBack = () => {
    navigate("/login");
  };

  // Datos de los roles
  const rolesData = [
    {
      id: "Tutor",
      nombre: "Tutor",
      imagen: "/tutorIcon.svg",
      descripcion: "Registra y actualiza las tutorías de sus estudiantes; emite constancias y listados de tutorados."
    },
    {
      id: "evaluador", 
      nombre: "Evaluador",
      imagen: "/EvaluadorIcon.svg",
      descripcion: "Verifica el seguimiento de estudiantes tutorados y revisa el trabajo realizado por cada tutor."
    },
    {
      id: "administrador",
      nombre: "Administrador",
      imagen: "/adminIcon.svg",
      descripcion: "Gestiona el cronograma de tutorías, tutores y administra la información de cada estudiante."
    }
  ];

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <h2>Registro</h2>
        <p className={styles.subtitle}>Solicitar acceso al sistema</p>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={`${styles.formGroup} ${styles.half}`}>
              <label>Nombres</label>
              <input
                type="text"
                placeholder="Ingrese su nombre"
                value={nombres}
                onChange={(e)=>setNombres(e.target.value)}
                className={error && !nombres ? styles.inputError : ""}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.half}`}>
              <label>Apellidos</label>
              <input
                type="text"
                placeholder="Ingrese sus apellidos"
                value={apellidos}
                onChange={(e)=>setApellidos(e.target.value)}
                className={error && !apellidos ? styles.inputError : ""}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Correo electrónico</label>
            <input 
              type="text" 
              placeholder="ejemplo@unsaac.edu.pe"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={error && (!correo || !emailRegex.test(correo)) ? styles.inputError : ""}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error && (!password || password.length < 8) ? styles.inputError : ""}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Confirmar contraseña</label>
            <input 
              type="password"
              placeholder="Confirme su contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className={error && (!confirmar || confirmar !== password) ? styles.inputError : ""}
            />
          </div>

          {/* Roles */}
          <p className={styles.rolesLabel}>Selecciona tus roles</p>
          <div className={styles.rolesContainer}>
            {rolesData.map((rolItem) => (
              <div
                key={rolItem.id}
                className={`${styles.rolCard} ${rol.includes(rolItem.id) ? styles.activo : ""}`}
                onClick={()=>handleRolClick(rolItem.id)}
              >
                <div className={styles.rolIcon}>
                  <img src={rolItem.imagen} alt={rolItem.nombre}/>
                </div>
                <div className={styles.rolName}>{rolItem.nombre}</div>
                <div
                  className={styles.infoIcon}
                  onMouseEnter={(e)=>handleTooltipShow(rolItem.descripcion, e)}
                  onMouseLeave={handleTooltipHide}
                >
                  ⓘ
                </div>
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className={styles.tooltip}
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translateX(-50%)",
              }}
            >
              {tooltip.content}
              <div className={styles.tooltipArrow}></div>
            </div>
          )}

          {/*Mensajes*/}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <button type="submit" className={styles.registerBtn}>
            Registrarse
          </button>

          <div className={styles.divider}>
            <span>O continua con</span>
          </div>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={()=>
              alert("🔐 Conexión con Google pendiente de backend.")
            }
          >
            <img src="/google.svg" alt="Google" />
            Continuar con Google
          </button>

          <div className={styles.loginSection}>
            <p>¿Ya tienes cuenta?</p>
            <button
              type="button"
              className={styles.loginBtn}
              onClick={handleGoBack}
            >
              Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
