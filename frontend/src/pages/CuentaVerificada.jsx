import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../styles/components/CuentaVerificada.module.css";

function CuentaVerificada() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rolesData, setRolesData] = useState([]);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(()=>{
    const token = searchParams.get("token");
    if(!token){
      //Si no hay token, mostrar error y redirigir
      setError("Enlace de activación INVALIDO o EXPIRADO");

      //Redirigir despues de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 5000);
      return;
    }

    /// Ejemplo llamada backend
    /*
    const response = await axios.get(`/api/activate-account?token=${token}`);
    const {email, roles, rejectedRoles} = response.data;
    */
    //Usamos datos de prueba directamente
    const mockResponse = {
      email: "usuario@unsaac.edu.pe",
      approvedRoles: ["Administrador"],
      rejectedRoles: ["Tutor"]
    }

    if(mockResponse.approvedRoles.length === 0){
      setError("No se aprobaron roles de acceso. Contacta con el administrador del Sistema.");
      setTimeout(()=>{
        navigate("/");
      },5000);
      return;
    }

    setUserEmail(mockResponse.email);

    //Creando array solo con roles solicitados
    const requestedRoles = [];

    // Agregar roles aprobados
    mockResponse.approvedRoles.forEach(roleName =>{
      const icono = getIconForRole(roleName);
      requestedRoles.push({
        nombre: roleName,
        estado: "aprobado",
        icono: icono
      });
    });

    // Agregar roles rechazados
    mockResponse.rejectedRoles.forEach(roleName =>{
      const icono = getIconForRole(roleName);
      requestedRoles.push({
        nombre: roleName,
        estado: "rechazado",
        icono: icono
      });
    });

    setRolesData(requestedRoles);

  },[searchParams, navigate]);

  // Icono por rol
  const getIconForRole = (roleName) => {
    const iconMap = {
      "Tutor": "tutorIcon.svg",
      "Evaluador": "EvaluadorIcon.svg",
      "Administrador": "adminIcon.svg"
    };
    return iconMap[roleName] || "tutorIcon.svg"; //Default
  };

  // Calcular estadísticas de roles
  const rolesAprobados = rolesData.filter(rol => rol.estado === "aprobado").length;
  const rolesRechazados = rolesData.filter(rol => rol.estado === "rechazado").length;
  
  //Handle para regresar a login
  const handleBackToLogin = () =>{
    navigate("/login");
  };

   // Estado de error
  if (error) {
    return (
      <div className={styles.verificationPage}>
        <div className={styles.verificationContainer}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <img src="error-icon.svg" alt="Error" />
            </div>
            <h3><strong>ERROR DE ACTIVACIÓN</strong></h3>
            <p><strong>{error}</strong></p>
            <p>Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  //Si todo es correcto => Con minimo 1 rol aprobado
  return (
    <div className = {styles.verificationPage}>
      <div className = {styles.verificationContainer}>
        {/* Icono de confirmacion */}
        <div className = {styles.successHeader}>
          <div className = {styles.checkIcon}>
            <img src = "check-icon.svg" alt = "Check"/>
          </div>
          <h1>¡Cuenta Activada!</h1>
          {userEmail && <p className={styles.userEmail}>Correo: {userEmail}</p>}
        </div>
        {/*Informacion de bienvenida */}
        <div className={styles.infoCard}>
          <div className={styles.cardIcon}>
            <img src="info-icon.svg" alt="Información"/>
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
              {rolesData.map((rol, index)=>(
                <div
                  key={index}
                  className={`${styles.roleCard} ${rol.estado === 'aprobado' ? styles.roleApproved : styles.roleRejected}`}
                >
                  <div className = {styles.roleInfo}>
                    <div className = {styles.roleIcon}>
                      <img src = {rol.icono} alt={rol.nombre}/>
                    </div>
                    <span className={styles.roleName}>{rol.nombre}</span>
                  </div>

                  <div className={styles.roleStatus}>
                    {rol.estado === 'aprobado' ? (
                      <>
                        <img src="check-icon.svg" alt="Aprobado" className={styles.statusIcon}/>
                        <span className={styles.statusTextApproved}>Aprobado</span>
                      </>
                    ):(
                      <>
                        <img src="error-icon.svg" alt="No aprobado" className={styles.statusIcon}/>
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