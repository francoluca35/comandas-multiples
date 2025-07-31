"use client";
import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codActivacion, setCodActivacion] = useState("");
  const [recordarUsuario, setRecordarUsuario] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de login
    console.log({ email, password, codActivacion, recordarUsuario });
  };

  return (
    <div className="min-h-screen bg-[#0b1134] flex items-center justify-center p-4">
      <div className="bg-[#0b1134] text-white w-full max-w-sm p-6 rounded shadow-md flex flex-col items-center">
        {/* Logo */}
        <img
          src="/logo-francomputer.png"
          alt="Logo"
          className="w-28 h-28 mb-4"
        />

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c63] text-white  focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Codigo Activacion
            </label>
            <input
              type="text"
              required
              value={codActivacion}
              onChange={(e) => setCodActivacion(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center text-sm">
            <input
              type="checkbox"
              id="recordar"
              checked={recordarUsuario}
              onChange={() => setRecordarUsuario(!recordarUsuario)}
              className="mr-2"
            />
            <label htmlFor="recordar">¿Queres Recordar Usuario?</label>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded transition"
          >
            Iniciar Sesion
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
