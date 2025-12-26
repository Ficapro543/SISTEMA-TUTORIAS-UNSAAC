import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MainPageRoles() {
  const [roles, setRoles] = useState({});

  useEffect(() => {
    const savedRoles = localStorage.getItem("userRoles");
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bienvenido a MainPage</h1>
      <p className="mb-4">Tus roles actuales:</p>
      <pre className="bg-gray-100 p-2 rounded mb-6">{JSON.stringify(roles, null, 2)}</pre>

      {roles.administrador ? (
        <button
          onClick={() => window.location.href = '/admin'}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Ir al Dashboard de Administrador
        </button>
      ) : null}
    </div>
  );
}

export default MainPageRoles;