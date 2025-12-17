import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/Recuperar.css";

function RecuperarPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Solo valida que termine en unsaac.edu.pe — la validación extra la haremos aparte
  const baseEmailRegex = /^[a-zA-Z0-9._%+-]+@unsaac\.edu\.pe$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, ingresa tu correo institucional.");
      return;
    }

    // 1. Validar estructura general
    if (!baseEmailRegex.test(email)) {
      setError("El correo ingresado no es válido.");
      return;
    }

    // 2. Separar código antes del @
    const codigo = email.split("@")[0];

    // 3. Validar que sean exactamente 6 dígitos
    if (!/^\d{6}$/.test(codigo)) {
      setError("El código del correo debe tener exactamente 6 dígitos.");
      return;
    }

    // 4. Obtener año de ingreso (primeros 2 dígitos)
    const ingreso = parseInt(codigo.substring(0, 2)); // ej: "25"
    const añoActual = new Date().getFullYear() % 100; // 2025 → 25

    // 5. Validar año de ingreso
    if (ingreso > añoActual) {
      setError(
        `El año de ingreso (${ingreso}) no puede ser mayor al año actual (${añoActual}).`
      );
      return;
    }

    setLoading(true)

    // **Si todo está bien → enviar al backend**
    try {
      const response = await fetch(
        "http://localhost:3001/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Se ha enviado un código de verificación a tu correo.");
        setTimeout(()=>{
          navigate("/recuperar/verificar",{state: {email}});
        },2000);
      } else {
        setError(data.message || "No se pudo procesar la solicitud.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="recover-page">
      <div className="recover-container">
        <img src="./alerta.jpg" alt="alerta" className="warning-icon" />
        <h2>Restablecer contraseña</h2>
        <p className="recover-text">
          Te enviaremos un enlace temporal a tu correo electrónico para que
          puedas crear una nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="recover-form">
          <h4>Correo Electrónico</h4>
          <input
            type="text"
            placeholder="codigo@unsaac.edu.pe"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "input-error" : ""}
            disabled={loading}
          />

          {error && <p className="error-message">{error}</p>}
          {message && <p className = "success-message">{message}</p>}

          <button 
            type="submit" 
            className="recover-btn"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/login")}>
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}

export default RecuperarPassword;
