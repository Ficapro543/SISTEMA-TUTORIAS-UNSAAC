import React from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/login");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Recuperar Contraseña</h2>
        <form className="login-form">
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="Ingresa tu correo registrado" />
          </div>
          <button type="submit" className="login-btn">
            Enviar enlace de recuperación
          </button>
        </form>
        <p
          className="forgot-password"
          style={{ cursor: "pointer" }}
          onClick={handleGoBack}
        >
          ← Volver al inicio de sesión
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
