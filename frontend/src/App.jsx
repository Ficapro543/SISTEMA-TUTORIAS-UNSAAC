import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import Login from "./pages/Login.jsx";
import Login2 from "./pages/Login2.jsx";
import Register from "./pages/Registro.jsx";
import RegisterConfirmation from "./pages/RegistroConfirmacion.jsx";
import ForgotPassword from "./pages/RecuperarPassword.jsx";
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
        <Route path="/login2" element={<Login2 />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/confirmacion" element={<RegisterConfirmation />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/ping" element={<BackendStatus />} />
        <Route path="/recuperar/verificar" element={<VerificarCodigo />} />
        <Route path="/recuperar/nueva" element={<NuevaContrasena />} />
        <Route path="*" element={<Navigate to="/ping" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
