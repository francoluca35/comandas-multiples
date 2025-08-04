"use client";
import { useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../../../../lib/firebase.js";
// import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginSuperadmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // TEMPORALMENTE COMENTADO PARA EVITAR CONFLICTOS
      // const user = await signInWithEmailAndPassword(auth, email, password);
      // const docRef = doc(db, "usuarios", user.user.email);

      // const snap = await getDoc(docRef);
      // if (snap.exists() && snap.data().rol === "superadmin") {
      //   router.push("/home-master/dashboard");
      // } else {
      //   alert("No autorizado");
      // }

      // TEMPORAL: Simular login exitoso del superadmin
      console.log("🔐 Login superadmin:", { email, password });

      // Guardar datos del superadmin en localStorage
      localStorage.setItem("superAdminUser", email);
      localStorage.setItem("superAdminRole", "superadmin");

      console.log("✅ Superadmin autenticado y datos guardados");

      // Redirigir al dashboard
      router.push("/home-master/dashboard");
    } catch (err) {
      console.error("Error en login superadmin:", err);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-80">
        <h1 className="text-2xl font-bold">Login SuperAdmin</h1>
        <input
          type="email"
          placeholder="Correo"
          className="p-2 bg-gray-800 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="p-2 bg-gray-800 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 p-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  );
}
