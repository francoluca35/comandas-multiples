"use client";
import React from "react";
import { useRouter } from "next/navigation";

function CrearResto() {
  const router = useRouter();

  const irAVistaActivacion = () => {
    router.push("/vistas/VistaActivacion");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <button
        onClick={irAVistaActivacion}
        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Nuevo Usuario Resto
      </button>
    </div>
  );
}

export default CrearResto;
