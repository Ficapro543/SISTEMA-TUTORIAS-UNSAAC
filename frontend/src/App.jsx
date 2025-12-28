import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/general/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/general/Registro.jsx";
import RegisterConfirmation from "./pages/general/RegistroConfirmacion.jsx";
import CuentaVerificada from "./pages/general/CuentaVerificada.jsx";
import AprobarRegistro from "./pages/admin/AprobarRegistro.jsx";
import SolicitudDetalle from "./pages/admin/SolicitudDetalle.jsx";
import MainPage from "./pages/general/MainPageRoles.jsx";
import BackendStatus from "./pages/general/BackendStatus.jsx";
import RecuperarPassword from "./pages/general/RecuperarPassword.jsx";
import VerificarCodigo from "./pages/general/VerificarCodigo.jsx";
import NuevaContrasena from "./pages/general/NuevaContraseña.jsx";

//---- SISTEMA ----
import TutoriasHistoricas from "./pages/TutoriasHistoricas.jsx";
import TestJWT from "./componentes/TestJWT.jsx";
import AsignacionTutorados from "./pages/admin/AsignacionTutorados.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard2.jsx";
import CambioTutorados from "./pages/CambioTutorados.jsx";
import AsignarTutorados from "./pages/AsignarTutorados.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/registro" element={<Layout><Register /></Layout>} />
      <Route path="/confirmacion" element={<Layout><RegisterConfirmation /></Layout>} />
      <Route path="/verificado" element={<Layout><CuentaVerificada /></Layout>} />
      <Route path="/solicitudes_registro" element={<Layout><AprobarRegistro /></Layout>} />
      <Route path="/mainpage" element={<Layout><MainPage /></Layout>} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/asignaciones" element={<AsignacionTutorados />} />
      <Route path="/recuperar" element={<Layout><RecuperarPassword /></Layout>} />
      <Route path="/recuperar/verificar" element={<Layout><VerificarCodigo /></Layout>} />
      <Route path="/recuperar/nueva" element={<Layout><NuevaContrasena /></Layout>} />
      <Route path="/ping" element={<Layout><BackendStatus /></Layout>} />

      {/* NUEVA RUTA: módulo Administrador -> Asignaciones */}
      <Route path="/administrador/asignaciones" element={<AsignarTutorados />} />
      <Route path="/admin/cambio-tutor" element={<CambioTutorados />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/tutoriasHistoricas" element={<TutoriasHistoricas roles={{ administrador: true }} />} />
      <Route path="/test-jwt" element={<TestJWT />} />
    </Routes>
  );
}

export default App;