"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginSuperAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const docRef = doc(db, "usuarios/admin", "admin");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().rol === "superadmin") {
        router.push("/dashboard-master");
      } else {
        alert("Acceso denegado");
      }
    } catch (error) {
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Login SuperAdmin</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Correo"
          className="p-2 rounded bg-gray-800 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 rounded bg-gray-800 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
          Ingresar
        </button>
      </form>
    </div>
  );
}
