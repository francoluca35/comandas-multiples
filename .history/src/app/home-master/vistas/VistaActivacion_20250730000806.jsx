"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function VistaActivacion() {
  const [formData, setFormData] = useState({
    restaurante: "",
    email: "",
    password: "",
    codActivacion: "",
    cantUsuarios: 1,
    finanzas: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/registrar-restaurante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire(
          "¡Registrado!",
          "El restaurante fue registrado con éxito",
          "success"
        );
        setFormData({
          restaurante: "",
          email: "",
          password: "",
          codActivacion: "",
          cantUsuarios: 1,
          finanzas: false,
        });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Activar/Desactivar</h2>
      <p className="mb-6">
        Desde aquí se podrá habilitar o deshabilitar el acceso a restaurantes
        registrados.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[#0e132d] p-6 rounded-xl shadow-md"
      >
        <label className="block font-bold">Restaurante</label>
        <input
          type="text"
          name="restaurante"
          value={formData.restaurante}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 text-black"
        />

        <label className="block font-bold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 text-black"
        />

        <label className="block font-bold">Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 text-black"
        />

        <label className="block font-bold">Código de Activación</label>
        <input
          type="text"
          name="codActivacion"
          value={formData.codActivacion}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 text-black"
        />

        <div className="flex gap-6 mb-6">
          <div>
            <label className="block font-bold mb-1">Cantidad de Usuarios</label>
            <input
              type="number"
              name="cantUsuarios"
              value={formData.cantUsuarios}
              onChange={handleChange}
              className="p-2 w-28 text-black"
              min={1}
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="finanzas"
              checked={formData.finanzas}
              onChange={handleChange}
            />
            <label>Con Finanzas</label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-300 transition"
        >
          Registrar Restaurante
        </button>
      </form>
    </div>
  );
}
