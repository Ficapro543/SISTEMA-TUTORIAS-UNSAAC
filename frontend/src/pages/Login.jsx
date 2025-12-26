import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Importar el api configurado
import styles from "../styles/pages/Login.module.css";

function Login() {
  const navigate = useNavigate();

  // Estados front end
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Solo correos institucionales @unsaac.edu.pe
  const emailRegex = /^[a-zA-Z0-9._%+-]+@unsaac\.edu\.pe$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validación básica
    if (!email && !password) {
      setError("Por favor rellena tus credenciales.");
      setLoading(false);
      return;
    } else if (!email) {
      setError("Por favor, ingresa tu correo institucional.");
      setLoading(false);
      return;
    } else if (!password){
      setError("Por favor, ingresa tu contraseña.");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("El correo ingresado no es válido.");
      setLoading(false);
      return;
    }

    // Envio al backend usando api
    try {
      const response = await api.post('/auth/login',{
        email,
        password
      })

      const data = response.data;

      // Credenciales correctas
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Guardar roles por separado
      if (data.user && data.user.roles) {
        localStorage.setItem('userRoles', JSON.stringify(data.user.roles));

        if (roles.administrador) {
          navigate("/admin");
        } else {
          navigate("/mainpage");
        }

      } else {
        // Credenciales incorrectas
        setError(data.message || "Correo o contraseña incorrectos.");
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      //Navegamos
      navigate("/mainpage");

    } catch (err) {
      // Manejo de errores con axios
      console.error("Login error:", err);
      
      // Axios envuelve la respuesta en error.response
      if (err.response) {
        // El servidor respondió con un código de error
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error ||
                            "Credenciales incorrectas";
        setError(errorMessage);
        
        // Mostrar detalles en consola para debugging
        console.error("Response error:", {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        // La petición fue hecha pero no hubo respuesta
        console.error("No response received:", err.request);
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        // Algo pasó al configurar la petición
        console.error("Request setup error:", err.message);
        setError("Error al configurar la petición.");
      }

    } finally{
      setLoading(false);
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
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${error && !password ? styles.inputError : ""} ${styles.passwordInput}`}
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <img
                  src={showPassword ? "/hidden.svg" : "/view.svg"}
                  alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                />
              </button>
            </div>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? "Cargando..." : "Ingresar"}
          </button>

          <p className={styles.forgotPassword} onClick={!loading ? handleForgotPassword: undefined}>
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
          <button 
            className={styles.registerBtn} 
            onClick={!loading ? handleRegister: undefined}
            disabled={loading}
          >
            Registrarse aquí
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;