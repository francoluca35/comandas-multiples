"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginSuperadmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Intentando login superadmin:", { email });

      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase Auth exitoso:", user);

      // Verificar documento en Firestore
      const docRef = doc(db, "usuarios", user.user.email);
      console.log("🔍 Verificando documento:", user.user.email);

      const snap = await getDoc(docRef);
      console.log("📄 Documento encontrado:", snap.exists());

      if (snap.exists()) {
        const userData = snap.data();
        console.log("📋 Datos del usuario:", userData);

        if (userData.rol === "superadmin") {
          console.log("✅ Rol superadmin confirmado");

          // Guardar datos del superadmin en localStorage
          localStorage.setItem("superAdminUser", user.user.email);
          localStorage.setItem("superAdminRole", "superadmin");
          localStorage.setItem("superadminImage", userData.imagen || "");
          localStorage.setItem("imagen", userData.imagen || "");

          console.log("💾 Datos guardados en localStorage");

          toast.success("¡Bienvenido al panel de administración!");

          // Redirigir al dashboard
          console.log("🔄 Redirigiendo al dashboard...");
          router.push("/dashboard");
        } else {
          console.log("❌ Rol incorrecto:", userData.rol);
          toast.error("No autorizado - Rol incorrecto");
          auth.signOut();
        }
      } else {
        console.log("❌ Documento no encontrado");
        toast.error("Usuario no encontrado");
        auth.signOut();
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      
      let errorMessage = "Error al iniciar sesión";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "Usuario no encontrado";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos. Intenta más tarde";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Superadmin Comandas
          </h1>
          <p className="text-gray-400">
            Panel de Administración
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="admin@comandas.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Acceso exclusivo para administradores del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
