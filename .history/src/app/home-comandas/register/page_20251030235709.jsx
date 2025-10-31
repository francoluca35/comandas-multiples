"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nombreRestaurante, setNombreRestaurante] = useState("Restaurante");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    usuario: "",
    email: "",
    password: "",
    rol: "Mesero",
    foto: null,
  });

  useEffect(() => {
    const cargarNombreRestaurante = () => {
      const nombreResto = localStorage.getItem("nombreResto");
      if (nombreResto) {
        setNombreRestaurante(nombreResto);
      }
    };

    cargarNombreRestaurante();
  }, []);

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
    setLoading(true);
    setError(null);

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
      const res = await fetch("/api/usuarios/registro", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Error desconocido");
      }

      Swal.fire("Éxito", "Usuario registrado correctamente.", "success").then(
        () => {
          router.push("/home-comandas/login"); // ✅ Redirección al login
        }
      );
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/Assets/fondo-prelogin.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="relative z-10 bg-violet-950/50 bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-md text-white">
        {/* Nombre del restaurante */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1 uppercase">
            {nombreRestaurante}
          </h1>
          <p className="text-white text-base italic">
            by QuickSolution
          </p>
        </div>

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
