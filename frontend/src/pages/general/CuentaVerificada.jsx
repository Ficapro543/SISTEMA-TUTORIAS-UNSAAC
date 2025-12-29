import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/pages/CuentaVerificada.module.css";

function CuentaVerificada() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [rolesData, setRolesData] = useState([]);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [activationStatus, setActivationStatus] = useState(null); //'Activating', 'Success', 'already_active', 'error'

  const abortControllerRef = useRef(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const activateAccount = async () => {
      if (!token) {
        setError("Enlace de activación INVÁLIDO o EXPIRADO");
        setTimeout(() => {
          navigate("/login");
        }, 7000);
        return;
      }

      try {
        setLoading(true);
        setActivationStatus('activating');
        console.log("Activando cuenta con token:", token);

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/activarCuenta/${token}`, {
          // Agregar headers para prevenir cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          signal  //Pasar la señal para abortar
        });

        //Verificamos si la peticion fue abortada
        if (signal.aborted) {
          console.log("Peticion abortada");
          return;
        }

        const responseText = await response.text();
        console.log("Respuesta del servidor (texto)", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parseando JSON:", parseError);
          throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok) {
          //Si es 409 (conflicto), reintentar despues de un delay
          if (response.status === 409) {
            console.log("Conflicto detectado, reintentando...");
            setActivationStatus('already_processing');
            // Esperar y reintentar una sola vez
            await new Promise(resolve => setTimeout(resolve, 1000));

            const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/activarCuenta/${token}`, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              },
              signal
            });

            if (signal.aborted) return;

            const retryText = await retryResponse.text();
            data = JSON.parse(retryText);

            if (!retryResponse.ok) {
              throw new Error(data.message || `Error ${retryResponse.status}: ${retryText}`);
            }
          } else {
            throw new Error(data.message || `Error ${response.status}: ${responseText}`);
          }
        }

        console.log("Datos recibidos de activación:", data);

        // Determinar estado
        if (data.message && data.message.includes('ya estaba activada')) {
          setActivationStatus('already_active');
        } else {
          setActivationStatus('success');
        }

        // Datos del usuario activado
        setUserEmail(data.user?.email || "usuario@unsaac.edu.pe");
        setUserName(data.user?.nombre || "user");

        // Procesar roles aprobados y rechazados
        const approvedRoles = data.user?.approvedRoles || data.user?.roles || [];
        const rejectedRoles = data.user?.rejectedRoles || [];

        if (approvedRoles.length === 0) {
          setError("No se aprobaron roles de acceso. Contacta con el administrador del Sistema.");
          setTimeout(() => {
            navigate("/");
          }, 5000);
          return;
        }

        // Crear array solo con roles solicitados
        const requestedRoles = [];

        // Agregar roles aprobados
        approvedRoles.forEach(roleName => {
          const icono = getIconForRole(roleName);
          requestedRoles.push({
            nombre: roleName,
            estado: "aprobado",
            icono: icono
          });
        });

        // Agregar roles rechazados (si hay)
        rejectedRoles.forEach(roleName => {
          const icono = getIconForRole(roleName);
          requestedRoles.push({
            nombre: roleName,
            estado: "rechazado",
            icono: icono
          });
        });

        setRolesData(requestedRoles);

      } catch (err) {
        //Si fue abortado, no hacer nada
        if (err.name === "AbortError" || signal.aborted) {
          console.log("Peticion cancelada intencionalmente.");
          return;
        }

        console.error("Error al activar cuenta:", err);
        setActivationStatus('error');

        //Manejamos errores especificos
        if (err.message.includes('Token expirado')) {
          setError('El enlace de activación ha expirado. Contacta al administrador para un nuevo enlace.')

        } else if (err.message.includes("La cuenta ya está activada")) {
          setError("Esta cuenta ya está activada. Puedes iniciar sesión con tus credenciales.");
          setTimeout(() => {
            navigate("/login");
          }, 5000);

        } else if (err.message.includes("ya estaba activada")) {
          setActivationStatus('already_active');
          //Parseamos datos si estan en el mensaje
          try {
            const match = err.message.match(/\{[^}]+\}/);
            if (match) {
              const data = JSON.parse(match[0]);
              setUserEmail(data.user?.email || "");
              setUserName(data.user?.nombre || "");
              return;
            }
          } catch (e) {

          }
        } else {
          setError(err.message || "Error al activar la cuenta. El enlace puede ser inválido o haber expirado.");
        }

        // Redirigir después de mostrar error
        setTimeout(() => {
          navigate("/login");
        }, 7000);

      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    activateAccount();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };

  }, [token, navigate]);

  // Icono por rol
  const getIconForRole = (roleName) => {
    const iconMap = {
      "Tutor": "/tutorIcon.svg",
      "Evaluador": "/evaluadorIcon.svg",
      "Administrador": "/administradorIcon.svg"
    };
    return iconMap[roleName] || "tutorIcon.svg"; //Default
  };

  // Calcular estadísticas de roles
  const rolesAprobados = rolesData.filter(rol => rol.estado === "aprobado").length;
  const rolesRechazados = rolesData.filter(rol => rol.estado === "rechazado").length;

  //Handle para regresar a login
  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className={styles.verificationPage}>
        <div className={styles.verificationContainer}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <h3>Activando cuenta...</h3>
            <p>Validando tu enlace de activación...</p>
            {activationStatus === 'already_processing' && (
              <p className={styles.infoMessage}>La activación ya está en proceso. Esperando confirmación...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className={styles.verificationPage}>
        <div className={styles.verificationContainer}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <img src="/error-icon.svg" alt="Error" />
            </div>
            <h3><strong>ERROR DE ACTIVACIÓN</strong></h3>
            <p><strong>{error}</strong></p>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  //Si la cuenta ya estaba activada
  if (activationStatus === 'already_active') {
    return (
      <div className={styles.verificationPage}>
        <div className={styles.verificationContainer}>
          <div className={styles.infoState}>
            <div className={styles.infoIcon}>
              <img src="/info-icon.svg" alt="Información" />
            </div>
            <h3><strong>CUENTA YA ACTIVADA</strong></h3>
            <p>Esta cuenta ya estaba activada anteriormente.</p>
            {userName && <p className={styles.userName}>Bienvenido nuevamente, {userName}</p>}
            {userEmail && <p className={styles.userEmail}>Correo: {userEmail}</p>}
            <button
              className={styles.backToLoginBtn}
              onClick={handleBackToLogin}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  //Si todo es correcto => Con minimo 1 rol aprobado
  return (
    <div className={styles.verificationPage}>
      <div className={styles.verificationContainer}>
        {/* Icono de confirmacion */}
        <div className={styles.successHeader}>
          <div className={styles.checkIcon}>
            <img src="/check-icon.svg" alt="Check" />
          </div>
          <h1>¡Cuenta Activada!</h1>
          {userName && <p className={styles.userName}>Bienvenido, {userName}</p>}
          {userEmail && <p className={styles.userEmail}>Correo: {userEmail}</p>}
        </div>
        {/*Informacion de bienvenida */}
        <div className={styles.infoCard}>
          <div className={styles.cardIcon}>
            <img src="/info-icon.svg" alt="Información" />
          </div>
          <div className={styles.cardContent}>
            <h3>¡Bienvenido al sistema!</h3>
            <p>
              Tu cuenta ha sido activada exitosamente.
              {rolesAprobados > 0 && (
                <>
                  {" "}Se han aprobado <strong>{rolesAprobados}</strong>{" "}
                  {rolesAprobados === 1 ? "rol de acceso" : "roles de acceso"}
                </>
              )}
              {rolesRechazados > 0 && (
                <>
                  {" "}y <strong>{rolesRechazados}</strong>{" "}
                  {rolesRechazados === 1 ? "rol no fue aceptado" : "roles no fueron aceptados"}
                </>
              )}
              . Ya puedes iniciar sesión con tus credenciales.
            </p>
          </div>
        </div>

        {/* Lista de roles solicitados */}
        {rolesData.length > 0 && (
          <div className={styles.rolesSection}>
            <h3 className={styles.rolesTitle}>Roles Solicitados:</h3>
            {rolesData.map((rol, index) => (
              <div
                key={index}
                className={`${styles.roleCard} ${rol.estado === 'aprobado' ? styles.roleApproved : styles.roleRejected}`}
              >
                <div className={styles.roleInfo}>
                  <div className={styles.roleIcon}>
                    <img src={rol.icono} alt={rol.nombre} />
                  </div>
                  <span className={styles.roleName}>{rol.nombre}</span>
                </div>

                <div className={styles.roleStatus}>
                  {rol.estado === 'aprobado' ? (
                    <>
                      <img src="/check-icon.svg" alt="Aprobado" className={styles.statusIcon} />
                      <span className={styles.statusTextApproved}>Aprobado</span>
                    </>
                  ) : (
                    <>
                      <img src="/error-icon.svg" alt="No aprobado" className={styles.statusIcon} />
                      <span className={styles.statusTextRejected}>No aprobado</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boton para volver al login */}
        <button
          className={styles.backToLoginBtn}
          onClick={handleBackToLogin}
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

export default CuentaVerificada;