"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import useKitchenNotifications from "../../../hooks/useKitchenNotifications";
import { useAuth } from "../../context/AuthContext";
import { useRestaurant } from "../../context/RestaurantContext";
import { db } from "../../../../lib/firebase"; 
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { FaVolumeUp, FaVolumeMute, FaCog, FaBell, FaMusic, FaPlay, FaStop, FaCreditCard, FaStore } from "react-icons/fa";

// Componente para la configuración de sonidos
const SoundConfiguration = () => {
  const {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    soundType,
    setSoundType,
    isLoading,
    testSound,
    testSpecificSound,
  } = useKitchenNotifications();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState(soundType);
  const [saving, setSaving] = useState(false);

  // Sincronizar selectedSound con soundType cuando cambie
  useEffect(() => {
    setSelectedSound(soundType);
  }, [soundType]);

  // Lista de sonidos disponibles
  const soundOptions = [
    {
      id: "simple",
      name: "Simple",
      description: "Sonido básico y suave para ambientes tranquilos",
      icon: "🔔",
      color: "from-blue-500 to-indigo-500",
      duration: "0.3s"
    },
    {
      id: "kitchen",
      name: "Cocina Tradicional",
      description: "Sonido cálido y suave para ambientes acogedores",
      icon: "🍳",
      color: "from-green-500 to-emerald-500",
      duration: "0.7s"
    },
    {
      id: "sonido1",
      name: "Sonido 1",
      description: "Primer archivo de audio personalizado",
      icon: "🎵",
      color: "from-purple-500 to-pink-500",
      duration: "Variable"
    },
    {
      id: "sonido2",
      name: "Sonido 2",
      description: "Segundo archivo de audio personalizado",
      icon: "🎵",
      color: "from-orange-500 to-red-500",
      duration: "Variable"
    }
  ];

  // Función para probar un sonido específico
  const handleTestSound = async (soundId) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setSelectedSound(soundId);
    
    try {
      await testSpecificSound(soundId);
    } catch (error) {
      console.error("Error probando sonido:", error);
    }
    
    // Resetear estado después de un tiempo
    setTimeout(() => {
      setIsPlaying(false);
    }, 1000);
  };

  // Función para aplicar el sonido seleccionado
  const handleApplySound = async () => {
    if (selectedSound === soundType) return;
    
    setSaving(true);
    try {
      await setSoundType(selectedSound);
      
      // Mostrar confirmación
      const soundName = soundOptions.find(s => s.id === selectedSound)?.name;
      alert(`✅ Sonido aplicado y guardado: ${soundName}`);
    } catch (error) {
      console.error("Error aplicando sonido:", error);
      alert("❌ Error al aplicar el sonido. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading mientras se carga la configuración
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuración de sonidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
          <FaMusic className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configuración de Sonidos</h2>
          <p className="text-gray-600">Personaliza las notificaciones de cocina</p>
        </div>
      </div>

      {/* Estado general */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium text-gray-700">
              Notificaciones: {isEnabled ? 'Activadas' : 'Desactivadas'}
            </span>
          </div>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            disabled={saving}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isEnabled 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando...' : (isEnabled ? 'Desactivar' : 'Activar')}
          </button>
        </div>
      </div>

      {/* Control de volumen */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Volumen General</h3>
          <span className="text-sm font-medium text-gray-600">{Math.round(volume * 100)}%</span>
        </div>
        <div className="flex items-center space-x-3">
          <FaVolumeMute className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            disabled={saving}
            className={`flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${saving ? 'opacity-50' : ''}`}
          />
          <FaVolumeUp className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Selección de sonidos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tipos de Sonido Disponibles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soundOptions.map((sound) => (
            <div
              key={sound.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedSound === sound.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !saving && setSelectedSound(sound.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${sound.icon}`}></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{sound.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{sound.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Duración: {sound.duration}
                      </span>
                      {soundType === sound.id && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Activo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!saving) handleTestSound(sound.id);
                  }}
                  disabled={isPlaying || saving}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isPlaying && selectedSound === sound.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isPlaying && selectedSound === sound.id ? (
                    <FaStop className="w-4 h-4" />
                  ) : (
                    <FaPlay className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de aplicar */}
      <div className="flex justify-center">
        <button
          onClick={handleApplySound}
          disabled={selectedSound === soundType || saving}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
            selectedSound === soundType || saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {saving ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </span>
          ) : selectedSound === soundType ? (
            'Sonido ya aplicado'
          ) : (
            'Aplicar Sonido Seleccionado'
          )}
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FaCog className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Información</h4>
            <p className="text-sm text-blue-700">
              Los cambios se guardan automáticamente en la base de datos y se sincronizan entre dispositivos.
              Puedes probar cada sonido haciendo clic en el botón de reproducción.
              El sonido seleccionado se usará para todas las notificaciones de nuevos pedidos en la cocina.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

// Componente para configuración de Mercado Pago
const MercadoPagoConfiguration = ({ mercadopagoConfig, setMercadopagoConfig, onSave }) => {
  return (
    <div className="bg-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full mr-4">
          <FaCreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Mercado Pago</h2>
          <p className="text-gray-600">Conecta tu cuenta de Mercado Pago para recibir pagos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-gray-500 mt-1">
            Encuentra esto en tu panel de desarrolladores de Mercado Pago
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-gray-500 mt-1">
            Clave pública para el frontend
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Webhook Secret
          </label>
          <input
            type="password"
            value={mercadopagoConfig.webhookSecret || ""}
            onChange={(e) =>
              setMercadopagoConfig((prev) => ({
                ...prev,
                webhookSecret: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu webhook secret de MercadoPago"
          />
          <p className="text-xs text-gray-500 mt-1">
            Clave secreta para verificar webhooks. Encuéntrala en tu panel de desarrolladores de MercadoPago → Webhooks
          </p>
        </div>

        <button
          onClick={onSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Configurar Mercado Pago
        </button>
      </div>
    </div>
  );
};

// Componente para información del restaurante
const RestaurantInfoConfiguration = ({ restaurantInfo, setRestaurantInfo, onSave }) => {
  return (
    <div className="bg-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full mr-4">
          <FaStore className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Información del Restaurante</h2>
          <p className="text-gray-600">Actualiza la información de tu restaurante</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del restaurante"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dirección del restaurante"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="restaurante@email.com"
          />
        </div>

        <button
          onClick={onSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Guardar Información
        </button>
      </div>
    </div>
  );
};

// Componente principal de configuración
function ConfiguracionContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { restauranteActual: restaurant, loading: restaurantLoading } = useRestaurant();
  const [activeSection, setActiveSection] = useState("mercadopago");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para Mercado Pago
  const [mercadopagoConfig, setMercadopagoConfig] = useState({
    accessToken: "",
    publicKey: "",
    webhookSecret: "",
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

  const sections = [
    {
      id: "mercadopago",
      name: "Mercado Pago",
      icon: FaCreditCard,
      description: "Configuración de pagos"
    },
    {
      id: "restaurant",
      name: "Restaurante",
      icon: FaStore,
      description: "Información del restaurante"
    },
    {
      id: "sonidos",
      name: "Sonidos",
      icon: FaMusic,
      description: "Configuración de notificaciones"
    },
  ];

  useEffect(() => {
    if (!restaurantLoading) {
      checkFirstTimeSetup();
    }
  }, [user, restaurant, restaurantLoading]);

  const checkFirstTimeSetup = async () => {
    try {
      if (user && restaurant) {
        const restaurantDoc = await getDoc(doc(db, "restaurantes", restaurant.id));
        const data = restaurantDoc.data();

        // Cargar configuración existente si existe
        if (data?.mercadopago) {
          setMercadopagoConfig({
            accessToken: data.mercadopago.accessToken || "",
            publicKey: data.mercadopago.publicKey || "",
            webhookSecret: data.mercadopago.webhookSecret || "",
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
      // Validar que el restaurante esté disponible
      if (!restaurant || !restaurant.id) {
        alert("Error: No se pudo identificar el restaurante. Por favor, recarga la página.");
        return;
      }

      // Validar que los campos no estén vacíos
      if (!mercadopagoConfig.accessToken || !mercadopagoConfig.publicKey) {
        alert("Por favor completa todos los campos de Mercado Pago (Access Token y Public Key)");
        return;
      }

      // Actualizar la configuración en Firestore
      await updateDoc(doc(db, "restaurantes", restaurant.id), {
        mercadopago: {
          accessToken: mercadopagoConfig.accessToken,
          publicKey: mercadopagoConfig.publicKey,
          webhookSecret: mercadopagoConfig.webhookSecret,
          configuredAt: new Date(),
          isActive: true,
        },
        configuracionCompleta: true,
        updatedAt: new Date(),
      });

      setMercadopagoConfig((prev) => ({ ...prev, isConfigured: true }));
      alert("¡Configuración de Mercado Pago guardada exitosamente!");
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
        alert("Error: No se pudo identificar el restaurante. Por favor, recarga la página.");
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

  if (loading || restaurantLoading) {
    return (
      <div className="flex h-screen bg-slate-900 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Cargando configuración...</div>
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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isExpanded
            ? "ml-56 sm:ml-64 md:ml-72 lg:ml-80 xl:ml-96 2xl:ml-[420px]"
            : "ml-16 sm:ml-20"
        }`}
      >
        <div className="min-h-screen bg-slate-800">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  ⚙️ Configuración
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                  Gestiona la configuración de tu restaurante
                </p>
              </div>

              {/* Navegación de secciones */}
              <div className="flex justify-center mb-8">
                <div className="bg-slate-700 rounded-xl p-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-white text-slate-800 shadow-lg'
                          : 'text-slate-300 hover:text-white hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <section.icon className="w-4 h-4" />
                        <span>{section.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de la sección */}
              <div className="mb-8">
                {activeSection === "mercadopago" && (
                  <MercadoPagoConfiguration
                    mercadopagoConfig={mercadopagoConfig}
                    setMercadopagoConfig={setMercadopagoConfig}
                    onSave={handleMercadoPagoConfig}
                  />
                )}
                {activeSection === "restaurant" && (
                  <RestaurantInfoConfiguration
                    restaurantInfo={restaurantInfo}
                    setRestaurantInfo={setRestaurantInfo}
                    onSave={handleRestaurantInfoSave}
                  />
                )}
                {activeSection === "sonidos" && <SoundConfiguration />}
              </div>

              {/* Información adicional */}
              <div className="text-center bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <FaCog className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Configuración del Sistema</h3>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  Aquí puedes gestionar la configuración de Mercado Pago, la información de tu restaurante y las notificaciones de cocina.
                </p>
                <div className="bg-slate-600/30 rounded-xl p-3 inline-block">
                  <p className="text-base font-medium text-blue-300">
                    Los cambios se aplican inmediatamente y se guardan automáticamente
                  </p>
                </div>
              </div>
            </div>
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
        <SidebarProvider>
          <ConfiguracionContent />
        </SidebarProvider>
      </RoleGuard>
    </RestaurantGuard>
  );
};

export default ConfiguracionPage;
