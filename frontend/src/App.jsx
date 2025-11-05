import {Routes, Route, BrowserRouter} from 'react-router-dom';
import Login from './pages/Login.jsx';
import Login2 from './pages/Login2.jsx';
import Register from './pages/Registro.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import BackendStatus from './pages/BackendStatus.jsx';
import { Navigate } from 'react-router-dom';

function App(){
  return(
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/login2' element={<Login2/>}/>
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar" element={<ForgotPassword />} />
      <Route path="/ping" element={<BackendStatus />} />
      <Route path = "*" element={<Navigate to = "/ping" replace />} />
    </Routes>
  );
}

export default App;