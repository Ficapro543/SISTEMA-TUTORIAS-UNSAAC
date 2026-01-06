import { Routes, Route, Navigate } from "react-router-dom";

// General pages
import LandingPage from "./pages/general/LandingPage.jsx";
import Layout from "./pages/general/Layout.jsx";
import Login from "./pages/general/Login.jsx";
import Register from "./pages/general/Registro.jsx";
import RegisterConfirmation from "./pages/general/RegistroConfirmacion.jsx";
import CuentaVerificada from "./pages/general/CuentaVerificada.jsx";
import RecuperarPassword from "./pages/general/RecuperarPassword.jsx";
import VerificarCodigo from "./pages/general/VerificarCodigo.jsx";
import NuevaContrasena from "./pages/general/NuevaContraseña.jsx";
import Cronogramas from "./pages/admin/Cronogramas.jsx";

import BackendStatus from "./pages/general/BackendStatus.jsx";
import Dashboard from "./pages/Dashboard.jsx"
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* General routes */}
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/registro" element={<Layout><Register /></Layout>} />
      <Route path="/confirmacion" element={<Layout><RegisterConfirmation /></Layout>} />
      <Route path="/verificado/:token" element={<Layout><CuentaVerificada /></Layout>} />
      <Route path="/recuperar" element={<Layout><RecuperarPassword /></Layout>} />
      <Route path="/recuperar/verificar" element={<Layout><VerificarCodigo /></Layout>} />
      <Route path="/recuperar/nueva" element={<Layout><NuevaContrasena /></Layout>} />
      <Route path="/ping" element={<Layout><BackendStatus /></Layout>} />

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/configuracion" element={<Configuracion />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes >
  );
}

export default App;