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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/confirmacion" element={<RegisterConfirmation />} />
        <Route path="/verificado/:token" element={<CuentaVerificada />} />
        <Route path="/solicitudes_registro" element={<AprobarRegistro />} />
        <Route path="/solicitudes_registro/:token" element={<SolicitudDetalle />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/recuperar/verificar" element={<VerificarCodigo />} />
        <Route path="/recuperar/nueva" element={<NuevaContrasena />} />
        <Route path="/ping" element={<BackendStatus />} />
        <Route path="*" element={<Navigate to="/ping" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
