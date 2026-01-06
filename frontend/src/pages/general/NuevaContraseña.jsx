import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@/styles/pages/general/NuevaContrasena.css";
import api from "@/utils/api";

function NuevaContraseña({ embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  // If embedded, we don't need email from location
  const email = !embedded ? location.state?.email || null : null;

  const [currentPassword, setCurrentPassword] = useState(""); // Only for embedded
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!embedded && !email) {
      navigate("/recuperar");
    }
  }, [email, navigate, embedded]);

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
    setError("");
    setSuccess("");

    if (!contraseñaValida) {
      setError("Por favor, cumple con todos los requisitos de contraseña.");
      return;
    };

    if (embedded && !currentPassword) {
      setError("Ingresa tu contraseña actual.");
      return;
    }

    if (!embedded && !email) {
      setError("Error: No se encontró el correo asociado.");
      return;
    }

    setLoading(true);

    try {
      if (embedded) {
        // Authenticated change password
        const response = await api.post('/auth/change-password', {
          currentPassword,
          newPassword: password
        });
        setSuccess(response.data.message);
        setCurrentPassword("");
        setPassword("");
        setRepeatPassword("");
      } else {
        // Public reset password
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          navigate("/login");
        } else {
          setError(data.message || "Error al cambiar la contraseña.");
        }
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!embedded && !email) {
    return null; // Will redirect via useEffect
  }

  // Content to render
  const content = (
    <div className={!embedded ? "nueva-container" : "nueva-embedded-container"}>
      {!embedded && (
        <>
          <h2>Nueva Contraseña</h2>
          <p className="sub-text">
            Crea una contraseña segura para tu cuenta
          </p>
        </>
      )}

      {error && <div className="alert error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div className="alert success" style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="form-container">

        {/* Current Password (Only if embedded) */}
        {embedded && (
          <>
            <label>Contraseña Actual *</label>
            <div className="input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Contraseña actual"
                disabled={loading}
              />
              <span
                className="toggle"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? '🙈' : '👁'}
              </span>
            </div>
          </>
        )}

        {/* PASSWORD */}
        <label>Nueva Contraseña *</label>
        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={!contraseñaValida && password ? "input-error" : ""}
            placeholder="********"
            disabled={loading}
          />
          <span
            className="toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁'}
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
            disabled={loading}
          />
          <span
            className="toggle"
            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
          >
            {showRepeatPassword ? '🙈' : '👁'}
          </span>
        </div>

        {/* ERROR DE COINCIDENCIA */}
        {repeatPassword && repeatPassword !== password && (
          <p className="error-msg">Las contraseñas no coinciden</p>
        )}

        <button
          type="submit"
          className={`submit-btn ${!contraseñaValida ? "disabled" : ""}`}
          disabled={!contraseñaValida || loading}
        >
          {loading ? "Procesando..." : (embedded ? "Actualizar Contraseña" : "Reestablecer Contraseña")}
        </button>
      </form>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="nueva-page">
      {content}
    </div>
  );
}

export default NuevaContraseña;