import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Login.css";

function Login() {
  const navigate = useNavigate();

  // Estados front end
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Solo correos institucionales @unsaac.edu.pe
  const emailRegex = /^[a-zA-Z0-9._%+-]+@unsaac\.edu\.pe$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validación básica
    if (!email && !password) {
      setError("Por favor rellena tus credenciales.");
      return;
    }

    else if (!email) {
      setError("Por favor, ingresa tu correo institucional.");
      return;
    }

    else if (!password){
      setError("Por favor, ingresa tu contraseña.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("El correo ingresado no es válido.");
      return;
    }

    // Envio al backend
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Mantiene la sesion segura (cookie JWT)
      });

      const data = await response.json();
      if (response.ok) {
        //Credenciales correctas
        const userRole = data.role?.rol || "tutor";
        switch (userRole) {
          case "tutor":
            navigate("/tutor");
            break;
          case "verificador":
            navigate("/verificador");
            break;
          case "administrador":
            navigate("/admin");
            break;
          default:
            navigate("/inicio");
        }
      } else {
        // Credenciales incorrectas
        setError(data.message || "Correo o contraseña incorrectos.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  }

  // --- Otros manejadores ---
  const handleForgotPassword = () => navigate("/recuperar");
  const handleRegister = () => navigate("/registro");

  const handleGoogleLogin = () => {
    alert("🔐 Conexión con Google iniciada (pendiente de backend)");
  };

  return (
    <div className="login-page">
      {/* Encabezado */}
      <header className="header">
        <img src="/logo_izquierdo.png" alt="Logo Izquierdo" className="logo" />
        <h1 className="title">SISTEMA DE TUTORÍAS UNSAAC</h1>
        <img src="/logo_derecho.png" alt="Logo Derecho" className="logo" />
      </header>

      {/* Cuadro de login */}
      <div className="login-container">
        <h2>Iniciar Sesión</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="text"
              placeholder="ejemplo@unsaac.edu.pe"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className={error && !emailRegex.test(email)?"input-error":""}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Ingresa tu contraseña" 
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className={error && !password ? "input-error":""}
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">
            Ingresar
          </button>

          <p className="forgot-password" onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </p>
        </form>

        <div className="divider">
          <span>O continúa con</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <div className="register-section">
          <p>¿No tienes cuenta?</p>
          <button className="register-btn" onClick={handleRegister}>
            Registrarse aquí
          </button>
        </div>
      </div>

      {/* Pie de página */}
      <footer className="footer">
        © 2025 Universidad Nacional de San Antonio Abad del Cusco — Todos los
        derechos reservados.
      </footer>
    </div>
  );
}

export default Login;