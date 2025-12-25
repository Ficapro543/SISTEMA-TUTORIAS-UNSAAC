import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Registro.jsx";
import RegisterConfirmation from "./pages/RegistroConfirmacion.jsx";
import CuentaVerificada from "./pages/CuentaVerificada.jsx";
import AprobarRegistro from "./pages/AprobarRegistro.jsx";
import SolicitudDetalle from "./pages/SolicitudDetalle.jsx";
import MainPage from "./pages/MainPageRoles.jsx";
import BackendStatus from "./pages/BackendStatus.jsx";
import { Navigate } from "react-router-dom";
import RecuperarPassword from "./pages/RecuperarPassword.jsx";
import VerificarCodigo from "./pages/VerificarCodigo.jsx";
import NuevaContrasena from "./pages/NuevaContraseña.jsx";
//---- SISTEMA ----
import TutoriasHistoricas from "./pages/TutoriasHistoricas.jsx";
import TestJWT from "./componentes/TestJWT.jsx";
import AsignacionTutorados from "./pages/AsignacionTutorados.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/login2" element={<Layout><Login2 /></Layout>} />
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
      <Route path="*" element={<Navigate to="/ping" replace />} />
      <Route path="/tutoriasHistoricas"  element={<TutoriasHistoricas roles={{ administrador: true }} />} />
      <Route path="/test-jwt" element={<TestJWT />} />
    </Routes>
  );
}

export default App;
