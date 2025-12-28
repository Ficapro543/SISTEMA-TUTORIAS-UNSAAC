import { useEffect, useState } from "react";

export default function BackendStatus() {
  const [message, setMessage] = useState("Cargando...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/ping`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error al conectar con el backend 😥"));
  }, []);

  return (
    <p className="text-sm text-gray-600 text-center mt-4">
      Estado del servidor: <strong>{message}</strong>
    </p>
  );
}
