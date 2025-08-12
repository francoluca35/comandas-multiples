"use client";
import React, { useState, useEffect } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import Sidebar, { useSidebar, SidebarProvider } from "./components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../context/RestaurantContext";
import { db } from "../../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

function HomeContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { restauranteActual: restaurant, loading: restaurantLoading } =
    useRestaurant();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);

  useEffect(() => {
    if (!restaurantLoading) {
      checkUserSetup();
    }
  }, [user, restaurant, restaurantLoading]);

  const checkUserSetup = async () => {
    try {
      if (user && restaurant) {
        const restaurantDoc = await getDoc(
          doc(db, "restaurantes", restaurant.id)
        );
        const data = restaurantDoc.data();

        // Verificar si necesita configuración inicial
        const isFirstTimeUser = !data?.configuracionCompleta;
        const hasMercadoPago = data?.mercadopago?.accessToken;

        if (isFirstTimeUser || !hasMercadoPago) {
          setNeedsSetup(true);
          // Solo redirigir si no estamos ya en configuración
          if (window.location.pathname !== "/home-comandas/configuracion") {
            router.push("/home-comandas/configuracion");
          }
          return;
        }

        setNeedsSetup(false);
      }
    } catch (error) {
      console.error("Error checking user setup:", error);
    } finally {
      setLoading(false);
      setSetupChecked(true);
    }
  };

  if (loading || restaurantLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-400 mt-4">Cargando dashboard...</p>
      </div>
    );
  }

  // Si necesita configuración, mostrar mensaje de redirección
  if (needsSetup && setupChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirigiendo a configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />

      {/* Overlay para cerrar sidebar cuando está abierto */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 flex flex-col bg-slate-800 transition-all duration-300 ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-700/50">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-400 mt-1 text-base">
              Bienvenido al panel de control de tu restaurante
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card de Bienvenida */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-blue-400 text-2xl mr-3">🎉</div>
                  <h3 className="text-lg font-semibold text-white">
                    ¡Bienvenido!
                  </h3>
                </div>
                <p className="text-slate-300 text-sm">
                  Tu restaurante está configurado y listo para recibir pedidos y
                  pagos con tarjeta.
                </p>
              </div>

              {/* Card de Estado de Mercado Pago */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-green-400 text-2xl mr-3">💳</div>
                  <h3 className="text-lg font-semibold text-white">
                    Mercado Pago
                  </h3>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-400 text-sm font-medium">
                    Conectado
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-2">
                  Listo para procesar pagos con tarjeta de crédito y débito.
                </p>
              </div>

              {/* Card de Acciones Rápidas */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-purple-400 text-2xl mr-3">⚡</div>
                  <h3 className="text-lg font-semibold text-white">
                    Acciones Rápidas
                  </h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push("/home-comandas/ventas")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Ir a Ventas
                  </button>
                  <button
                    onClick={() => router.push("/home-comandas/configuracion")}
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                  >
                    Configuración
                  </button>
                </div>
              </div>

              {/* Card de Información del Restaurante */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-orange-400 text-2xl mr-3">🏪</div>
                  <h3 className="text-lg font-semibold text-white">
                    Tu Restaurante
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">Nombre:</span>
                    <span className="text-white ml-2">
                      {restaurant?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">ID:</span>
                    <span className="text-white ml-2">{restaurant?.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Usuario:</span>
                    <span className="text-white ml-2">
                      {user?.email || user?.usuario}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Estadísticas */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 text-2xl mr-3">📊</div>
                  <h3 className="text-lg font-semibold text-white">
                    Estadísticas
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mesas activas:</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pedidos hoy:</span>
                    <span className="text-white">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ventas hoy:</span>
                    <span className="text-white">$0</span>
                  </div>
                </div>
              </div>

              {/* Card de Soporte */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50 p-6">
                <div className="flex items-center mb-4">
                  <div className="text-red-400 text-2xl mr-3">🆘</div>
                  <h3 className="text-lg font-semibold text-white">Soporte</h3>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  ¿Necesitas ayuda con la configuración o tienes alguna
                  pregunta?
                </p>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors">
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HomePage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessHome"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder al dashboard.
              </p>
              <p className="text-slate-500 text-sm">
                Contacta al administrador para obtener acceso.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <HomeContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default HomePage;
