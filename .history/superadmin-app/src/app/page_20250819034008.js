"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (usuario && rol === "superadmin") {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [usuario, rol, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return null;
}
