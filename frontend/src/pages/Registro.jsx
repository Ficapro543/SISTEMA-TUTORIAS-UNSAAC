import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Registro.css"

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

  return (
    <div className="login-page">
      {/* Encabezado */}
      <header className="header">
        <img src="/logo_izquierdo.png" alt="Logo IN" className="logo" />
        <h1 className="title">SISTEMA DE TUTORIAS UNSAAC</h1>
        <img src="/logo_derecho.png" alt="Logo UNSAAC" className="logo" />
      </header>

      <div className="login-container">
        <h2>Registro</h2>
        <p className="subtitle">Solicitar acceso al sistema</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="row">
            <div className="form-group half">
              <label>Nombres</label>
              <input
                type="text"
                placeholder="Ingresa tus nombres"
                value={nombres}
                onChange={(e)=>setNombres(e.target.value)}
              />
            </div>

            <div className="form-group half">
              <label>Apellidos</label>
              <input
                type="text"
                placeholder="Ingresa tus apellidos"
                value={apellidos}
                onChange={(e)=>setApellidos(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input 
              type="text" 
              placeholder="ejemplo@unsaac.edu.pe"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Crea una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input 
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>

          {/* Roles */}
          <p className="roles-label">Selecciona tus roles</p>
          <div className="roles-container">
            <div
              className={`rol ${rol.includes("docente")?"activo":""}`}
              onClick={() => handleRolClick("docente")}
            >
              <span>🎈</span>Docente
            </div>
            <div
              className={`rol ${rol.includes("evaluador")?"activo":""}`}
              onClick={() => handleRolClick("evaluador")}
            >
              <span>🎈</span>Evaluador
            </div>
            <div
              className={`rol ${rol.includes("administrador")?"activo":""}`}
              onClick={() => handleRolClick("administrador")}
            >
              <span>🎈</span>Administrador
            </div>
          </div>

          {/*Mensajes*/}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="login-btn">
            Registrarse
          </button>

          <div className="divider">
            <span>O continua con</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={()=>
              alert("🔐 Conexión con Google pendiente de backend.")
            }
          >
            <img src="/google.svg" alt="Google" />
            Continuar con Google
          </button>

          <div className="register-section">
            <p>¿Ya tienes cuenta?</p>
            <button
              type="button"
              className="register-btn"
              onClick={handleGoBack}
            >
              Inicia sesión
            </button>
          </div>
        </form>
      </div>

      {/* Pie de página */}
      <footer className="footer">
        © 2025 Universidad Nacional de San Antonio Abad del Cusco — Todos los
        derechos reservados.
      </footer>
    </div>
  );
}

export default Register;
