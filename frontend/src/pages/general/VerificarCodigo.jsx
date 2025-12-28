import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pages/Verificar.css";

function VerificarCodigo() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || null; // viene de pantalla 1

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60); // 60 segundos para reenviar
  const inputsRef = useRef([]);

  // Si no llegó email (acceso directo a la URL), redirigir
  useEffect(() => {
    if (!email) {
      navigate("/recuperar");
    }
  }, [email, navigate]);

  // Auto-disminuir contador
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError("");
      setSuccess("");

      if (value !== "" && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fullCode = code.join("");

    if (fullCode.length < 6) {
      setError("Debe ingresar los 6 dígitos del código.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      if (response.ok) {
        setSuccess("Código verificado correctamente.");
        setTimeout(() => navigate("/recuperar/nueva", { state: { email } }), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "El código ingresado no es válido.");
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0].focus();
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    setTimer(60); // reset timer

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess("Se envió un nuevo código a tu correo.");
      } else {
        const data = await response.json();
        setError(data.message || "No se pudo reenviar el código.");
      }
    } catch {
      setError("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">

        <img src="/candado.png" alt="alerta" className="warning-icon" />

        <h2>Verifica tu código</h2>
        <p className="verify-text">
          Ingresa el código de verificación que enviamos a:  
          <br />
          <strong>{email}</strong>
        </p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-container">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-input"
              />
            ))}
          </div>

          <button
            type="submit"
            className="verify-btn"
            disabled={code.join("").length < 6 || loading}
          >
            {loading ? "Verificando..." : "Verificar Código"}
          </button>
        </form>

        {/* Reenviar código */}
        <div style={{ marginTop: "15px", fontSize: "0.9rem" }}>
          {timer > 0 ? (
            <p>Podrás reenviar un nuevo código en {timer}s</p>
          ) : (
            <button className="back-btn" onClick={handleResend}>
              Reenviar código
            </button>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate("/login")}>
          ← Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}

export default VerificarCodigo;
