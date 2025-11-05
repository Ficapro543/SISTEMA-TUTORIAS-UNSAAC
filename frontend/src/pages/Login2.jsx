import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

function Login2() {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/recuperar");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const handleGoogleLogin = () => {
    // Simulación — aquí irá tu lógica real de autenticación con Google
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

        <form className="login-form">
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="Ingresa tu correo" />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Ingresa tu contraseña" />
          </div>

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

export default Login2;