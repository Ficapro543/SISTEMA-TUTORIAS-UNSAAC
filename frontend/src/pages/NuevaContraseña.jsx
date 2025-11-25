import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/NuevaContrasena.css";

function NuevaContrasena() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const requisitos = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const contraseñaValida =
    requisitos.minLength &&
    requisitos.hasUpper &&
    requisitos.hasNumber &&
    requisitos.hasSpecial &&
    password === repeatPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contraseñaValida) return;

    try {
      const response = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.log("Error del servidor");
      }
    } catch (err) {
      console.log("Error de conexión");
    }
  };

  return (
    <div className="nueva-page">
      <div className="nueva-container">
        <h2>Nueva Contraseña</h2>
        <p className="sub-text">
          Crea una contraseña segura para tu cuenta
        </p>

        <form onSubmit={handleSubmit} className="form-container">

          {/* PASSWORD */}
          <label>Nueva Contraseña *</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={!contraseñaValida && password ? "input-error" : ""}
              placeholder="********"
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </span>
          </div>

          {/* REQUISITOS */}
          <div className="requirements">
            <p className={requisitos.minLength ? "ok" : "bad"}>
              {requisitos.minLength ? "✔" : "✘"} Mínimo 8 caracteres.
            </p>
            <p className={requisitos.hasUpper ? "ok" : "bad"}>
              {requisitos.hasUpper ? "✔" : "✘"} Al menos 1 mayúscula.
            </p>
            <p className={requisitos.hasNumber ? "ok" : "bad"}>
              {requisitos.hasNumber ? "✔" : "✘"} Al menos 1 número.
            </p>
            <p className={requisitos.hasSpecial ? "ok" : "bad"}>
              {requisitos.hasSpecial ? "✔" : "✘"} Al menos 1 carácter especial (!@#$...).
            </p>
          </div>

          {/* REPETIR PASSWORD */}
          <label>Repetir Contraseña *</label>
          <div className="input-wrapper">
            <input
              type={showRepeatPassword ? "text" : "password"}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="********"
              className={
                repeatPassword && repeatPassword !== password
                  ? "input-error"
                  : ""
              }
            />
            <span
              className="toggle"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              👁
            </span>
          </div>

          {/* ERROR DE COINCIDENCIA */}
          {repeatPassword && repeatPassword !== password && (
            <p className="error-msg">Las contraseñas no coinciden</p>
          )}

          <button
            type="submit"
            className={`submit-btn ${!contraseñaValida ? "disabled" : ""}`}
            disabled={!contraseñaValida}
          >
            Restablecer Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default NuevaContrasena;
