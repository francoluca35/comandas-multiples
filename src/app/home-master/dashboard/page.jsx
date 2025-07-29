"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardMaster() {
  const { usuario, rol, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!usuario || rol !== "superadmin")) {
      router.push("/home-master/login");
    }
  }, [usuario, rol, loading]);

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-4">Panel del SuperAdmin</h1>
      <p>Acceso permitido. Aquí irán los controles de la app.</p>
    </div>
  );
}
