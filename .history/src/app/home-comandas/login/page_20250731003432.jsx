"use client";
import React, { useEffect, useState } from "react";
import { FaUsers, FaKeyboard, FaSyncAlt } from "react-icons/fa";
import { db } from "../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

function Login() {
  const [usuarios, setUsuarios] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const nombreResto = localStorage.getItem("nombreResto");

        if (!nombreResto) return;

        const usersRef = collection(db, `restaurantes/${nombreResto}/users`);
        const snapshot = await getDocs(usersRef);

        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsuarios(usersData);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

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
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button className="bg-white text-black rounded-full p-3 shadow">
            <FaKeyboard size={20} />
          </button>
          <button
            className="bg-[#4da6ff] text-black font-bold px-4 py-2 rounded"
            onClick={() => router.push("/home-comandas/register")}
          >
            Registrate
          </button>

          <button
            className="bg-[#c084fc] text-black font-semibold px-4 py-2 rounded flex items-center gap-1"
            onClick={() => window.location.reload()}
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
