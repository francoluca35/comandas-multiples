"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

function PreLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codActivacion, setCodActivacion] = useState("");
  const [recordarUsuario, setRecordarUsuario] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (intentos >= 3) {
      alert("Acceso bloqueado por intentos fallidos.");
      return;
    }

    try {
      const docRef = doc(db, "codigosactivacion", codActivacion);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.email === email && data.password === password) {
          alert(
            `Bienvenido ${codActivacion}. Máximo de usuarios: ${data.cantUsuarios}`
          );
          router.push("/home-comandas/login");
        } else {
          alert("Email o contraseña incorrectos.");
          setIntentos((prev) => prev + 1);
        }
      } else {
        alert("Código de activación inválido.");
        setIntentos((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión. Intente nuevamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="bg-[#0c14499b] text-white w-full max-w-sm p-6 rounded shadow-md flex flex-col items-center">
        <img src="/Assets/LogoApp.png" alt="Logo" className="w-28 h-28 mb-4" />

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Código Activación
            </label>
            <input
              type="text"
              required
              value={codActivacion}
              onChange={(e) => setCodActivacion(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#1d253c] text-white focus:outline-none"
            />
          </div>

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

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded transition"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default PreLogin;
