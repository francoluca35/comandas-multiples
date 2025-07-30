"use client";
import { useState } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function VistaActivacion() {
  const [formulario, setFormulario] = useState({
    codActivacion: "",
    email: "",
    password: "",
    restaurante: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { codActivacion, email, password, restaurante } = formulario;

    try {
      // 1. Guardar en colección codigosactivacion
      await addDoc(collection(db, "codigosactivacion"), {
        codActivacion,
        email,
        password,
      });

      // 2. Crear documento en restaurantes
      const docRef = doc(db, "restaurantes", restaurante);
      await setDoc(docRef, {
        nombre: restaurante,
        creado: new Date(),
      });

      // 3. Crear subcolección vacía (ej: 'datos') solo si querés inicializarla
      await setDoc(doc(db, `restaurantes/${restaurante}/datos`, "inicial"), {
        info: "Inicial",
      });

      alert("Restaurante registrado correctamente");
      setFormulario({
        codActivacion: "",
        email: "",
        password: "",
        restaurante: "",
      });
    } catch (error) {
      console.error("Error al registrar restaurante:", error);
      alert("Error al registrar restaurante");
    }
  };

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Activar/Desactivar</h2>
      <p className="mb-6">
        Desde aquí se podrá habilitar o deshabilitar el acceso a restaurantes
        registrados.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded shadow-md"
      >
        <div className="mb-4">
          <label className="block mb-1">Código de Activación</label>
          <input
            type="text"
            name="codActivacion"
            value={formulario.codActivacion}
            onChange={handleChange}
            className="w-full p-2 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formulario.email}
            onChange={handleChange}
            className="w-full p-2 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formulario.password}
            onChange={handleChange}
            className="w-full p-2 rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Nombre del Restaurante</label>
          <input
            type="text"
            name="restaurante"
            value={formulario.restaurante}
            onChange={handleChange}
            className="w-full p-2 rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Registrar Restaurante
        </button>
      </form>
    </div>
  );
}
