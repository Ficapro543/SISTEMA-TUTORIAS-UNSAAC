import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/components/Login.module.css";

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
    <div className={styles.loginPage}>
      {/* Cuadro de login */}
      <div className={styles.loginContainer}>
        <h2>Iniciar Sesión</h2>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Correo electrónico</label>
            <input
              type="text"
              placeholder="ejemplo@unsaac.edu.pe"
              value={email}
              onChange={(e)=> setEmail(e.target.value)}
              className={error && !emailRegex.test(email)?styles.inputError:""}
              autoComplete="off"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="Ingresa tu contraseña" 
              value={password}
              onChange={(e)=> setPassword(e.target.value)}
              className={error && !password ? styles.inputError:""}
            />
          </div>
          
          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.loginBtn}>
            Ingresar
          </button>

          <p className={styles.forgotPassword} onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </p>
        </form>

        <div className={styles.divider}>
          <span>O continúa con</span>
        </div>

        <button className={styles.googleBtn} onClick={handleGoogleLogin}>
          <img src="/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <div className={styles.registerSection}>
          <p>¿No tienes cuenta?</p>
          <button className={styles.registerBtn} onClick={handleRegister}>
            Registrarse aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;