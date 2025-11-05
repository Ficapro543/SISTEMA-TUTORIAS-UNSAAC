import { useState } from "react";
import { FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ user: "", password: "", remember: false });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // validación local por ahora (cambia si conectas backend)
    if (form.user === "admin" && form.password === "1234") {
      setMsg("✅ Bienvenido, " + form.user);
    } else {
      setMsg("❌ Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-slate-100">
      {/* Panel izquierdo visual */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/3 bg-gradient-to-br from-blue-900 via-indigo-800 to-blue-700 text-white items-center justify-center p-10">
        <div className="max-w-lg text-center">
          <img
            src="/src/assets/logo.png"
            alt="logo"
            onError={(e) => (e.currentTarget.src = "/vite.svg")}
            className="mx-auto w-28 h-28 mb-6 rounded-full bg-white/10 p-2"
          />

          <h1 className="text-4xl font-extrabold mb-3 leading-tight">
            SISTEMA DE TUTORÍAS
          </h1>
          <p className="text-lg text-blue-100/90 mb-6">
            Accede con tu cuenta institucional para gestionar sesiones, horarios y
            reportes. Seguro, rápido y responsivo.
          </p>

          <ul className="text-left mx-auto max-w-sm space-y-3">
            <li className="flex items-start gap-3">
              <span className="inline-block mt-1 w-3 h-3 rounded-full bg-white/70" />
              Panel administrativo moderno
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-block mt-1 w-3 h-3 rounded-full bg-white/70" />
              Integración con backend y auth (próximo paso)
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-block mt-1 w-3 h-3 rounded-full bg-white/70" />
              Diseño responsivo y accesible
            </li>
          </ul>
        </div>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex w-full md:w-1/2 lg:w-1/3 items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          {/* header pequeño con título y subtítulo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 rounded-xl p-2 text-white">
              <FaUserCircle size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
              <p className="text-sm text-gray-500">Ingresa con tu cuenta institucional</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="text-sm font-medium text-gray-700">Usuario</label>
              <div className="mt-2 relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  name="user"
                  value={form.user}
                  onChange={handleChange}
                  type="text"
                  placeholder="ejemplo@unsaac.edu.pe"
                  className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="mt-2 relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <FaLock />
                </span>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Row: remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Recordarme
              </label>

              <a href="#" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              Entrar
            </button>
          </form>

          {/* Mensaje de estado */}
          {msg && (
            <div
              className={`mt-4 text-center font-medium ${
                msg.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msg}
            </div>
          )}

          {/* división */}
          <div className="mt-6 flex items-center gap-2">
            <div className="h-px bg-gray-200 flex-1" />
            <div className="text-xs text-gray-400">o</div>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Botones sociales (opcional visual) */}
          <div className="mt-4 flex gap-3">
            <button className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition">
              Continuar con Google
            </button>
            <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition hidden sm:inline-flex">
              Git
            </button>
          </div>

          <footer className="mt-6 text-center text-xs text-gray-400">
            © 2025 Universidad - Sistema de Tutorías
          </footer>
        </div>
      </div>
    </div>
  );
}
