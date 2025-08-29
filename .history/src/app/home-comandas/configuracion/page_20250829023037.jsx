"use client";
import React, { useState, useEffect } from "react";
import Sidebar, {
  useSidebar,
  SidebarProvider,
} from "../home/components/Sidebar";
import { RestaurantGuard } from "../../../components/RestaurantGuard";
import RoleGuard from "../../../components/RoleGuard";
import useKitchenNotifications from "../../../hooks/useKitchenNotifications";
import { FaVolumeUp, FaVolumeMute, FaCog, FaBell, FaMusic, FaPlay, FaStop } from "react-icons/fa";

// Componente para la configuración de sonidos
const SoundConfiguration = () => {
  const {
    isEnabled,
    setIsEnabled,
    volume,
    setVolume,
    soundType,
    setSoundType,
    testSound,
    testSpecificSound,
  } = useKitchenNotifications();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState(soundType);

  // Lista de sonidos disponibles
  const soundOptions = [
    {
      id: "powerful",
      name: "Potente (Alarma de Cocina)",
      description: "Sonido fuerte y llamativo para cocinas ruidosas",
      icon: "🔊",
      color: "from-red-500 to-orange-500",
      duration: "0.8s"
    },
    {
      id: "simple",
      name: "Simple",
      description: "Sonido básico y suave para ambientes tranquilos",
      icon: "🔔",
      color: "from-blue-500 to-indigo-500",
      duration: "0.3s"
    },
    {
      id: "alarm",
      name: "Alarma Industrial",
      description: "Efecto de sirena alternada para máxima atención",
      icon: "🚨",
      color: "from-yellow-500 to-red-500",
      duration: "0.6s"
    },
    {
      id: "kitchen",
      name: "Cocina Tradicional",
      description: "Sonido cálido y suave para ambientes acogedores",
      icon: "🍳",
      color: "from-green-500 to-emerald-500",
      duration: "0.7s"
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
  const handleApplySound = () => {
    setSoundType(selectedSound);
    // Mostrar confirmación
    alert(`Sonido aplicado: ${soundOptions.find(s => s.id === selectedSound)?.name}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
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
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isEnabled 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isEnabled ? 'Desactivar' : 'Activar'}
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
            className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedSound(sound.id)}
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
                    handleTestSound(sound.id);
                  }}
                  disabled={isPlaying}
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
          disabled={selectedSound === soundType}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
            selectedSound === soundType
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {selectedSound === soundType ? 'Sonido ya aplicado' : 'Aplicar Sonido Seleccionado'}
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FaCog className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Información</h4>
            <p className="text-sm text-blue-700">
              Los cambios se aplican inmediatamente. Puedes probar cada sonido haciendo clic en el botón de reproducción.
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

// Componente principal de configuración
function ConfiguracionContent() {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [activeSection, setActiveSection] = useState("sonidos");

  const sections = [
    {
      id: "sonidos",
      name: "Sonidos",
      icon: FaMusic,
      description: "Configuración de notificaciones"
    },
    // Aquí puedes agregar más secciones en el futuro
  ];

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
                  Personaliza la configuración del sistema
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
                {activeSection === "sonidos" && <SoundConfiguration />}
              </div>

              {/* Información adicional */}
              <div className="text-center bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/50 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <FaBell className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Notificaciones de Cocina</h3>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  Esta configuración afecta a las notificaciones de nuevos pedidos en la vista de cocina.
                  Los cambios se aplican inmediatamente y se mantienen durante la sesión.
                </p>
                <div className="bg-slate-600/30 rounded-xl p-3 inline-block">
                  <p className="text-base font-medium text-blue-300">
                    Para probar las notificaciones, ve a la vista de cocina y usa el botón "Probar Sonido"
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
        requiredPermission="canAccessCocina"
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
                Solo los administradores y personal de cocina pueden ver esta vista.
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
