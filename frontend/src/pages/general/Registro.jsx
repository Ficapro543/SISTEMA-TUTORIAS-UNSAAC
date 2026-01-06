import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "@/styles/pages/general/Registro.module.css"
import { useGoogleLogin } from '@react-oauth/google';
import api from "@/utils/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados del formulario
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rol, setRol] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0, align: 'center' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const [googleToken, setGoogleToken] = useState(null);

  // Estados para mostrar contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pre-fill con datos de Google si existen
  useEffect(() => {
    if (location.state && location.state.googleData) {
      const { email, first_name, last_name } = location.state.googleData;
      if (email) setCorreo(email);
      // Google a veces manda nombre y apellido, a veces no.
      if (first_name) setNombres(first_name);
      if (last_name) setApellidos(last_name);
      if (location.state.googleToken) setGoogleToken(location.state.googleToken);
    }
  }, [location.state]);

  const isGoogleRegister = !!googleToken;

  // Regex correo institucional
  const emailRegex = /^[a-zA-Z0-9._%+-]+@unsaac\.edu\.pe$/;

  // Validacion contraseña
  const validarPassword = (pass) => {
    if (isGoogleRegister) return null; // No validar si es google
    if (pass.length < 8 || pass.length > 64) {
      return "La contraseña debe tener entre 8 y 64 caracteres.";
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return "La contraseña debe contener al menos una letra minúscula.";
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/(?=.*\d)/.test(pass)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!/(?=.*[@$!%*?&])/.test(pass)) {
      return "La contraseña debe contener al menos un carácter especial (@$!%*?&).";
    }
    return null;
  };

  // Funciones de manejo
  const handleRolClick = (rolSeleccionado) => {
    setRol((prev) =>
      prev.includes(rolSeleccionado)
        ? prev.filter((r) => r !== rolSeleccionado)
        : [...prev, rolSeleccionado]
    );
  };

  const handleTooltipShow = (content, event, type = 'rol') => {
    const rect = event.target.getBoundingClientRect();
    const yOffset = type === 'password' ? -125 : -85;
    const alineado = type === 'password' ? 'left' : 'center';
    setTooltip({
      visible: true,
      content,
      x: (rect.left + rect.width / 2),
      y: rect.top + yOffset,
      align: alineado
    });
  };

  const handleTooltipHide = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0, align: 'center' });
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true); // Start loading
      // Si el usuario hace click en Google aqui, intentamos loguear/verificar
      // Igual que en login. Si ya existe -> login. Si no, pre-fill form aqui mismo.
      try {
        const response = await api.post('/auth/google', {
          token: tokenResponse.access_token,
          isAccessToken: true
        });
        const data = response.data;
        if (data.needs_registration) {
          // Rellenamos el form con los datos recibidos
          setCorreo(data.userData.email);
          setNombres(data.userData.first_name);
          setApellidos(data.userData.last_name);
          setGoogleToken(data.tempGoogleToken || tokenResponse.access_token);
          setError(""); // Limpiar errores previos
        } else {
          // Si resulta que YA existia, lo logueamos directamente
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.user));

          if (data.user && data.user.roles) {
            localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
            api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            navigate("/dashboard");
          }
        }
      } catch (err) {
        console.error("Google Auth Error:", err);
        setError(err.response?.data?.message || "Error al autenticar con Google");
      } finally {
        setLoading(false); // Stop loading
      }
    },
    onError: () => setLoading(false)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isSubmitting) return;

    // Validaciones
    if (!nombres || !apellidos || !correo || ((!password || !confirmar) && !isGoogleRegister)) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!emailRegex.test(correo)) {
      setError("El correo debe ser institucional (@unsaac.edu.pe).");
      return;
    }

    // Validar contraseña con la función si NO es google
    if (!isGoogleRegister) {
      const errorPassword = validarPassword(password);
      if (errorPassword) {
        setError(errorPassword);
        return;
      }

      if (password !== confirmar) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    if (rol.length === 0) {
      setError("Por favor, selecciona al menos un rol.");
      return;
    }

    setIsSubmitting(true);

    const simulateSuccess = false; //Cambiar a falso para probar errores
    if (simulateSuccess) {
      navigate("/confirmacion", {
        state: {
          email: correo,
          nombres: nombres,
        }
      });
      return;
    }

    //Envio al backend (COMENTADO TEMPORALMENTE)
    try {
      // Usamos api.post en vez de fetch directo si es posible, para mantener consistencia.
      // Pero el original usaba fetch. Lo cambiare a api (que importa axios) para consistencia si es facil.
      // El user tiene 'api' importado en Login, voy a usarlo aqui tambien.

      const payload = {
        first_name: nombres,
        last_name: apellidos,
        email: correo,
        roles: rol,
        // Si es google, mandamos token y quizas password vacio o no lo mandamos
        googleToken: isGoogleRegister ? googleToken : undefined,
        password: isGoogleRegister ? undefined : password
      };

      const response = await api.post('/admin/solicitud', payload); // Axios lanza excepcion si status no es 2xx

      navigate("/confirmacion", {
        state: {
          email: correo,
          nombres: nombres
        }
      });

    } catch (err) {
      setError(err.response?.data?.message || "Error en el registro. Inténtalo de nuevo.");

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/login");
  };

  // Datos de los roles
  const rolesData = [
    {
      id: "tutor",
      nombre: "Tutor",
      imagen: "/tutorIcon.svg",
      descripcion: "Registra y actualiza las tutorías de sus estudiantes; emite constancias y listados de tutorados."
    },
    {
      id: "verificador",
      nombre: "Evaluador",
      imagen: "/evaluadorIcon.svg",
      descripcion: "Verifica el seguimiento de estudiantes tutorados y revisa el trabajo realizado por cada tutor."
    },
    {
      id: "administrador",
      nombre: "Administrador",
      imagen: "/administradorIcon.svg",
      descripcion: "Gestiona el cronograma de tutorías, tutores y administra la información de cada estudiante."
    }
  ];

  // Información de requisitos de contraseña
  const passwordRequisitos = "• 8-64 caracteres\n• 1 letra mayúscula\n• 1 letra minúscula\n• 1 número\n• 1 símbolo (@, $, !, %, *, ?, &)";

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <h2>Registro</h2>
        <p className={styles.subtitle}>Solicitar acceso al sistema</p>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={`${styles.formGroup} ${styles.half}`}>
              <label>Nombres</label>
              <input
                type="text"
                placeholder="Ingrese su nombre"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className={error && !nombres ? styles.inputError : ""}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.half}`}>
              <label>Apellidos</label>
              <input
                type="text"
                placeholder="Ingrese sus apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className={error && !apellidos ? styles.inputError : ""}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Correo electrónico</label>
            <input
              type="text"
              placeholder="ejemplo@unsaac.edu.pe"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={error && (!correo || !emailRegex.test(correo)) ? styles.inputError : ""}
              disabled={isGoogleRegister} // Disabled if google
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.passwordLabelContainer}>
              <label>Contraseña</label>
              {!isGoogleRegister && (
                <div
                  className={styles.infoIcon}
                  onMouseEnter={(e) => handleTooltipShow(passwordRequisitos, e, 'password')}
                  onMouseLeave={handleTooltipHide}
                >
                  <img src="/info-icon.svg" alt="Información" />
                </div>
              )}
            </div>
            <div className={styles.passwordInputWrapper}>
              <input
                type={(showPassword && !isGoogleRegister) ? "text" : "password"} // Always password type if google
                placeholder="Ingrese su contraseña"
                value={isGoogleRegister ? "••••••••" : password} // Dummy validation if google
                onChange={(e) => !isGoogleRegister && setPassword(e.target.value)}
                className={`${error && !isGoogleRegister && validarPassword(password) ? styles.inputError : ""} ${styles.passwordInput}`}
                disabled={isGoogleRegister}
              />
              {!isGoogleRegister && (
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img
                    src={showPassword ? "/hidden.svg" : "/view.svg"}
                    alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  />
                </button>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Confirmar contraseña</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={(showConfirmPassword && !isGoogleRegister) ? "text" : "password"}
                placeholder="Confirme su contraseña"
                value={isGoogleRegister ? "••••••••" : confirmar}
                onChange={(e) => !isGoogleRegister && setConfirmar(e.target.value)}
                className={`${error && !isGoogleRegister && (!confirmar || confirmar !== password) ? styles.inputError : ""} ${styles.passwordInput}`}
                disabled={isGoogleRegister}
              />
              {!isGoogleRegister && (
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img
                    src={showConfirmPassword ? "/hidden.svg" : "/view.svg"}
                    alt={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Roles */}
          <p className={styles.rolesLabel}>Selecciona tus roles</p>
          <div className={styles.rolesContainer}>
            {rolesData.map((rolItem) => (
              <div
                key={rolItem.id}
                className={`${styles.rolCard} ${rol.includes(rolItem.id) ? styles.activo : ""}`}
                onClick={() => handleRolClick(rolItem.id)}
              >
                <div className={styles.rolIcon}>
                  <img src={rolItem.imagen} alt={rolItem.nombre} />
                </div>
                <div className={styles.rolName}>{rolItem.nombre}</div>
                <div
                  className={styles.infoIcon}
                  onMouseEnter={(e) => handleTooltipShow(rolItem.descripcion, e, 'rol')}
                  onMouseLeave={handleTooltipHide}
                >
                  <img src="/info-icon.svg" alt="Información" />
                </div>
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className={`${styles.tooltip} ${tooltip.align === 'left' ? styles.tooltipLeft : ""}`}
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translateX(-50%)",
              }}
            >
              {tooltip.content}
              <div className={styles.tooltipArrow}></div>
            </div>
          )}

          {/*Mensajes*/}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <button type="submit" className={styles.registerBtn} disabled={isSubmitting}>
            {isSubmitting ? "Enviando solicitud..." : "Registrarse"}
          </button>

          <div className={styles.divider}>
            <span>O continúa con</span>
          </div>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={() => googleLogin()}
          >
            <img src="/google.svg" alt="Google" />
            Continuar con Google
          </button>

          <div className={styles.loginSection}>
            <p>¿Ya tienes cuenta?</p>
            <button
              type="button"
              className={styles.loginBtn}
              onClick={handleGoBack}
            >
              Inicia sesión
            </button>
          </div>
        </form>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Procesando...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
