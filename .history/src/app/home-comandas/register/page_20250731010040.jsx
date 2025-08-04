"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";

function Register() {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    usuario: "",
    email: "",
    password: "",
    rol: "Mesero",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const codActivacion = localStorage.getItem("codActivacion");
    if (!codActivacion) {
      Swal.fire("Error", "No se encontró el código de activación.", "error");
      return;
    }

    if (!formData.foto || formData.foto.size > 1024 * 1024) {
      Swal.fire(
        "Error",
        "La imagen es requerida y debe ser menor a 1MB.",
        "error"
      );
      return;
    }

    const data = new FormData();
    data.append("nombreCompleto", formData.nombreCompleto);
    data.append("usuario", formData.usuario);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("rol", formData.rol);
    data.append("foto", formData.foto);
    data.append("codActivacion", codActivacion);

    try {
      const res = await fetch("/api/registrar-comanda", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error desconocido");
      }

      Swal.fire("Éxito", "Usuario registrado correctamente.", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0c1246] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.7)_0%,_transparent_60%)]" />
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="nombreCompleto"
            placeholder="Nombre Completo"
            value={formData.nombreCompleto}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="text"
            name="usuario"
            placeholder="Nombre de usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
          />

          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f2937] border border-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4ade80] text-white"
          >
            <option>Mesero</option>
            <option>Repartidor</option>
            <option>Cocina</option>
            <option>Admin</option>
          </select>

          <label className="w-full flex items-center justify-center bg-[#27272a] text-white px-4 py-2 rounded cursor-pointer">
            <input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            {formData.foto ? "Imagen seleccionada" : "Subir Foto"}
          </label>

          <button
            type="submit"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-2 rounded mt-2 transition-all duration-200"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
