"use client";
import React, { useState, useEffect } from "react";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../context/RestaurantContext";
import { db } from "../../../../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

function ConfiguracionContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { restauranteActual: restaurant, loading: restaurantLoading } =
    useRestaurant();

  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configComplete, setConfigComplete] = useState(false);

  // Estados para Mercado Pago
  const [mercadopagoConfig, setMercadopagoConfig] = useState({
    accessToken: "",
    publicKey: "",
    isConfigured: false,
  });

  // Estados para información del restaurante
  const [restaurantInfo, setRestaurantInfo] = useState({
    nombre: restaurant?.nombre || "",
    direccion: restaurant?.direccion || "",
    telefono: restaurant?.telefono || "",
    email: restaurant?.email || "",
    horario: restaurant?.horario || "",
    descripcion: restaurant?.descripcion || "",
  });

  useEffect(() => {
    if (!restaurantLoading) {
      checkFirstTimeSetup();
    }
  }, [user, restaurant, restaurantLoading]);

  const checkFirstTimeSetup = async () => {
    try {
      if (user && restaurant) {
        const restaurantDoc = await getDoc(
          doc(db, "restaurantes", restaurant.id)
        );
        const data = restaurantDoc.data();

        // Verificar si es la primera vez o si no tiene Mercado Pago configurado
        const isFirstTimeUser = !data?.configuracionCompleta;
        const hasMercadoPago = data?.mercadopago?.accessToken;

        setIsFirstTime(isFirstTimeUser || !hasMercadoPago);
        setConfigComplete(data?.configuracionCompleta || false);

        // Cargar configuración existente si existe
        if (data?.mercadopago) {
          setMercadopagoConfig({
            accessToken: data.mercadopago.accessToken || "",
            publicKey: data.mercadopago.publicKey || "",
            isConfigured: !!data.mercadopago.accessToken,
          });
        }

        if (data?.informacion) {
          setRestaurantInfo({
            nombre: data.informacion.nombre || restaurant.nombre,
            direccion: data.informacion.direccion || "",
            telefono: data.informacion.telefono || "",
            email: data.informacion.email || "",
            horario: data.informacion.horario || "",
            descripcion: data.informacion.descripcion || "",
          });
        }
      }
    } catch (error) {
      console.error("Error checking first time setup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoConfig = async () => {
    setSaving(true);
    try {
      // Debug: mostrar información del restaurante
      console.log("🔍 Debug - Restaurant:", restaurant);
      console.log("🔍 Debug - Restaurant ID:", restaurant?.id);
      console.log("🔍 Debug - Restaurant Loading:", restaurantLoading);

      // Validar que el restaurante esté disponible
      if (!restaurant || !restaurant.id) {
        alert(
          "Error: No se pudo identificar el restaurante. Por favor, recarga la página."
        );
        return;
      }

      // Validar que los campos no estén vacíos
      if (!mercadopagoConfig.accessToken || !mercadopagoConfig.publicKey) {
        alert("Por favor completa todos los campos de Mercado Pago");
        return;
      }

      // Actualizar la configuración en Firestore
      await updateDoc(doc(db, "restaurantes", restaurant.id), {
        mercadopago: {
          accessToken: mercadopagoConfig.accessToken,
          publicKey: mercadopagoConfig.publicKey,
          configuredAt: new Date(),
          isActive: true,
        },
        configuracionCompleta: true,
        updatedAt: new Date(),
      });

      setMercadopagoConfig((prev) => ({ ...prev, isConfigured: true }));
      setConfigComplete(true);

      alert("¡Configuración de Mercado Pago guardada exitosamente!");
      
      // Redirigir al dashboard después de configurar Mercado Pago
      setTimeout(() => {
        router.push("/home-comandas/home");
      }, 1500);
    } catch (error) {
      console.error("Error saving Mercado Pago config:", error);
      alert("Error al guardar la configuración. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurantInfoSave = async () => {
    setSaving(true);
    try {
      // Validar que el restaurante esté disponible
      if (!restaurant || !restaurant.id) {
        alert(
          "Error: No se pudo identificar el restaurante. Por favor, recarga la página."
        );
        return;
      }

      await updateDoc(doc(db, "restaurantes", restaurant.id), {
        informacion: restaurantInfo,
        updatedAt: new Date(),
      });

      alert("Información del restaurante guardada exitosamente!");
    } catch (error) {
      console.error("Error saving restaurant info:", error);
      alert("Error al guardar la información. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSetup = async () => {
    setSaving(true);
    try {
      // Validar que el restaurante esté disponible
      if (!restaurant || !restaurant.id) {
        alert(
          "Error: No se pudo identificar el restaurante. Por favor, recarga la página."
        );
        return;
      }

      await updateDoc(doc(db, "restaurantes", restaurant.id), {
        configuracionCompleta: true,
        setupCompletedAt: new Date(),
        updatedAt: new Date(),
      });

      setConfigComplete(true);
      alert("¡Configuración completada! Ya puedes usar la aplicación.");
    } catch (error) {
      console.error("Error completing setup:", error);
      alert("Error al completar la configuración. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || restaurantLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-400 mt-4">Cargando configuración...</p>
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
              {isFirstTime ? "Configuración Inicial" : "Configuración"}
            </h1>
            <p className="text-slate-400 mt-1 text-base">
              {isFirstTime
                ? "Completa la configuración para comenzar a usar la aplicación"
                : "Gestiona la configuración de tu restaurante"}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {isFirstTime && (
              <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-blue-400 text-2xl mr-3">🎯</div>
                  <div>
                    <h3 className="text-blue-300 font-semibold">
                      Configuración Inicial
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Completa estos pasos para configurar tu restaurante y
                      comenzar a usar la aplicación.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración de Mercado Pago */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="text-green-400 mr-2">💳</span>
                    Mercado Pago
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Conecta tu cuenta de Mercado Pago para recibir pagos
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {mercadopagoConfig.isConfigured ? (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-green-400 text-xl mr-2">✅</div>
                        <div>
                          <h4 className="text-green-300 font-medium">
                            Mercado Pago Configurado
                          </h4>
                          <p className="text-green-200 text-sm">
                            Tu cuenta está conectada y lista para recibir pagos.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Access Token
                        </label>
                        <input
                          type="password"
                          value={mercadopagoConfig.accessToken}
                          onChange={(e) =>
                            setMercadopagoConfig((prev) => ({
                              ...prev,
                              accessToken: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Encuentra esto en tu panel de desarrolladores de
                          Mercado Pago
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={mercadopagoConfig.publicKey}
                          onChange={(e) =>
                            setMercadopagoConfig((prev) => ({
                              ...prev,
                              publicKey: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Clave pública para el frontend
                        </p>
                      </div>

                      <button
                        onClick={handleMercadoPagoConfig}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        {saving ? "Guardando..." : "Configurar Mercado Pago"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Información del Restaurante */}
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <span className="text-blue-400 mr-2">🏪</span>
                    Información del Restaurante
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Actualiza la información de tu restaurante
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre del Restaurante
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.nombre}
                      onChange={(e) =>
                        setRestaurantInfo((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del restaurante"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={restaurantInfo.direccion}
                      onChange={(e) =>
                        setRestaurantInfo((prev) => ({
                          ...prev,
                          direccion: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dirección del restaurante"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={restaurantInfo.telefono}
                      onChange={(e) =>
                        setRestaurantInfo((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+54 11 1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={restaurantInfo.email}
                      onChange={(e) =>
                        setRestaurantInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="restaurante@email.com"
                    />
                  </div>

                  <button
                    onClick={handleRestaurantInfoSave}
                    disabled={saving}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    {saving ? "Guardando..." : "Guardar Información"}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de completar configuración */}
            {isFirstTime && mercadopagoConfig.isConfigured && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleCompleteSetup}
                  disabled={saving || configComplete}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {configComplete
                    ? "¡Configuración Completada!"
                    : "Completar Configuración"}
                </button>
                {configComplete && (
                  <p className="text-green-400 text-sm mt-2">
                    ✅ Ya puedes comenzar a usar la aplicación
                  </p>
                )}
              </div>
            )}

            {/* Guía de configuración */}
            {isFirstTime && !mercadopagoConfig.isConfigured && (
              <div className="mt-8 bg-slate-800 rounded-lg border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  📋 Guía de Configuración de Mercado Pago
                </h3>
                <div className="space-y-3 text-slate-300">
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">1.</span>
                    <p>
                      Ve a{" "}
                      <a
                        href="https://www.mercadopago.com.ar/developers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Mercado Pago Developers
                      </a>
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">2.</span>
                    <p>
                      Crea una cuenta o inicia sesión en tu cuenta existente
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">3.</span>
                    <p>Ve a "Mis aplicaciones" y crea una nueva aplicación</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">4.</span>
                    <p>
                      Copia el "Access Token" y "Public Key" de tu aplicación
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">5.</span>
                    <p>
                      Pega las credenciales en los campos de arriba y guarda
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ConfiguracionPage = () => {
  return (
    <RestaurantGuard>
      <RoleGuard
        requiredPermission="canAccessPagos"
        fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Acceso Denegado
              </h1>
              <p className="text-slate-400 mb-4">
                No tienes permisos para acceder a la configuración.
              </p>
              <p className="text-slate-500 text-sm">
                Solo los administradores pueden gestionar la configuración.
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen bg-slate-900 text-white">
          <SidebarProvider>
            <ConfiguracionContent />
          </SidebarProvider>
        </div>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default ConfiguracionPage;
