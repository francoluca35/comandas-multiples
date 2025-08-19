"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRestaurant } from "../app/context/RestaurantContext";

export const RestaurantGuard = ({ children }) => {
  const { restauranteActual, loading } = useRestaurant();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !restauranteActual) {
      // Si no hay restaurante cargado, redirigir al login de comandas
      router.push("/home-comandas");
    }
  }, [restauranteActual, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white text-lg">Cargando restaurante...</div>
      </div>
    );
  }

  if (!restauranteActual) {
    return null; // No renderizar nada mientras redirige
  }

  return <>{children}</>;
};
