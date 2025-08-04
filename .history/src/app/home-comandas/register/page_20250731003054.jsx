"use client";
import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    usuario: "",
    email: "",
    password: "",
    rol: "Repartidor",
    codAcceso: "",
    foto: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") {
      setFormData({ ...formData, foto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1246] flex items-center justify-center px-4">
      <div className="bg-[#111827] p-6 rounded-lg shadow-lg w-full max-w-md text-white relative">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/Assets/LogoApp.png"
            alt="Logo"
            className="w-24 h-24 rounded-full object-cover border-4 border-white"
          />
        </div>

        {/* Formulario */}
        <div className="space-y-3">
          <input
            type="text"
            name="nombreCompleto"
            placeholder="Nombre Completo"
            value={formData.nombreCompleto}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="text"
            name="usuario"
            placeholder="Nombre de usuario"
            value={formData.usuario}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80] text-white"
          >
            <option>Repartidor</option>
            <option>Mesero</option>
            <option>Cocina</option>
            <option>Admin</option>
          </select>

          <input
            type="text"
            name="codAcceso"
            placeholder="Código de acceso"
            value={formData.codAcceso}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          {/* Subir Foto */}
          <label className="w-full flex items-center justify-center bg-[#27272a] text-white px-4 py-2 rounded cursor-pointer">
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            Subir Foto
          </label>

          {/* Botón */}
          <button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-2 rounded mt-2 transition-all duration-200">
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
