"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaKeyboard, FaSyncAlt } from "react-icons/fa";
import { db } from "../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

function Login() {
  const [usuarios, setUsuarios] = useState([]);

  const fetchUsuarios = async () => {
    const cod = localStorage.getItem("recordedCod");
    if (!cod) return;

    try {
      const usersRef = collection(db, `restaurantes/${cod}/users`);
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.data().id,
        nombre: doc.data().usuario,
      }));

      setUsuarios(users);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="min-h-screen bg-black flex justify-center p-4">
      <div className="bg-[#1c1c1c] h-full p-6 rounded-lg shadow-lg w-[400px] text-white">
        <div className="flex items-center justify-center mb-4 text-white text-xl font-semibold">
          <FaUsers className="mr-2" />
          Usuarios
        </div>

        <div className="bg-[#2e2e2e] p-3 rounded flex flex-wrap gap-2 justify-start mb-4">
          {usuarios.map((user) => (
            <div
              key={user.id}
              className="bg-white text-black rounded px-3 py-1 font-semibold flex items-center gap-2"
            >
              <span className="bg-gray-200 rounded-full px-2 py-0.5 text-sm font-bold">
                {user.id}
              </span>
              {user.nombre}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button className="bg-white text-black rounded-full p-3 shadow">
            <FaKeyboard size={20} />
          </button>
          <button className="bg-[#4da6ff] text-black font-bold px-4 py-2 rounded">
            Registrate
          </button>
          <button
            onClick={fetchUsuarios}
            className="bg-[#c084fc] text-black font-semibold px-4 py-2 rounded flex items-center gap-1"
          >
            <FaSyncAlt />
            Refrescar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
