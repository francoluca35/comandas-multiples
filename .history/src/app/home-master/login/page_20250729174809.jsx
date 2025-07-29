"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc } from "firebase/firestore";

export default function LoginMaster() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const ref = doc(collection(db, "usuarios"), "admin");
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Usuario no encontrado");
        return;
      }

      const user = snap.data();
      if (
        user.email === email &&
        user.password === password &&
        user.rol === "superadmin"
      ) {
        router.push("/home-master/dashboard");
      } else {
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al intentar ingresar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 shadow-lg rounded-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Login Superadmin
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
