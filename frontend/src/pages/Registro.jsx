import React from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Registro de Usuario</h2>
        <form className="login-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" placeholder="Ingresa tu nombre" />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="Ingresa tu correo" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" placeholder="Crea una contraseña" />
          </div>
          <button type="submit" className="login-btn">
            Registrarse
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

export default Register;
