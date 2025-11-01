import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    navigate("/recuperar");
  };
  const handleRegister = () => {
    navigate("/registro");
  };
  const handleGoogleLogin = () => {
    alert("🔐 Conexión con Google iniciada (pendiente de backend)");
  };

  return (
    <div className="login-page">
      {/* ENCABEZADO */}
      <header className="header">
        <img
          src="/logo_izquierdo.png"
          alt="Logo Izquierdo"
          className="logo logo-left"
        />
        <h1 className="title">SISTEMA DE TUTORÍAS UNSAAC</h1>
        <img
          src="/logo_derecho.png"
          alt="Logo Derecho"
          className="logo logo-right"
        />
      </header>

      {/* LOGIN */}
      <div className="login-container">
        <h>Iniciar Sesión</h>

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

          <p className="forgot-password">¿Olvidaste tu contraseña?</p>
        </form>

        <div className="divider">
          <span>O continúa con</span>
        </div>

        <button className="google-btn">
          <img src="/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <div className="register-section">
          <p>¿No tienes cuenta?</p>
          <button className="register-btn">Registrarse aquí</button>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <footer className="footer">
        © 2025 Universidad Nacional de San Antonio Abad del Cusco — Todos los
        derechos reservados.
      </footer>
    </div>
  );
}

export default App;
