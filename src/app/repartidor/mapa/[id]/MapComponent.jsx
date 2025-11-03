"use client";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

// Componente para ajustar el mapa cuando cambian las coordenadas
function MapController({ coordenadasRestaurante, coordenadasDestino, ubicacionActual, recorridoIniciado, ruta, rutaOriginal }) {
  const map = useMap();

  useEffect(() => {
    // Si el recorrido está iniciado, mostrar toda la ruta original completa (desde restaurante hasta destino)
    if (recorridoIniciado && rutaOriginal && rutaOriginal.length > 0) {
      // Crear bounds que incluyan TODOS los puntos de la ruta ORIGINAL completa
      const bounds = rutaOriginal.map(coord => [coord[0], coord[1]]);
      
      // Agregar ubicación actual si está disponible (por si está fuera de la ruta)
      if (ubicacionActual && ubicacionActual.lat && ubicacionActual.lng) {
        bounds.push([ubicacionActual.lat, ubicacionActual.lng]);
      }
      
      // Agregar destino si está disponible
      if (coordenadasDestino && coordenadasDestino.lat && coordenadasDestino.lng) {
        bounds.push([coordenadasDestino.lat, coordenadasDestino.lng]);
      }
      
      // Agregar restaurante si está disponible para mostrar ruta completa
      if (coordenadasRestaurante && coordenadasRestaurante.lat && coordenadasRestaurante.lng) {
        bounds.push([coordenadasRestaurante.lat, coordenadasRestaurante.lng]);
      }
      
      // Calcular los límites mínimos y máximos de lat y lng
      const lats = bounds.map(b => b[0]);
      const lngs = bounds.map(b => b[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Crear bounds que incluyan toda la ruta completa
      const routeBounds = [
        [minLat, minLng],
        [maxLat, maxLng]
      ];
      
      // Mostrar toda la ruta con padding generoso para ver la ruta completa
      map.fitBounds(routeBounds, {
        padding: [100, 100],
        maxZoom: 12, // Zoom más alejado para ver toda la ruta completa
      });
    } else if (recorridoIniciado && ubicacionActual && coordenadasDestino) {
      // Si no hay ruta pero está en recorrido, mostrar ubicación y destino
      const bounds = [
        [ubicacionActual.lat, ubicacionActual.lng],
        [coordenadasDestino.lat, coordenadasDestino.lng]
      ];
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    } else {
      // Si no está en recorrido, mostrar restaurante y destino
      const bounds = [];
      
      if (coordenadasRestaurante && coordenadasRestaurante.lat && coordenadasRestaurante.lng) {
        bounds.push([coordenadasRestaurante.lat, coordenadasRestaurante.lng]);
      }
      
      if (coordenadasDestino && coordenadasDestino.lat && coordenadasDestino.lng) {
        bounds.push([coordenadasDestino.lat, coordenadasDestino.lng]);
      }
      
      if (ubicacionActual && ubicacionActual.lat && ubicacionActual.lng) {
        bounds.push([ubicacionActual.lat, ubicacionActual.lng]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        });
      }
    }
  }, [coordenadasRestaurante, coordenadasDestino, ubicacionActual, recorridoIniciado, ruta, rutaOriginal, map]);

  return null;
}

export default function MapComponent({
  coordenadasRestaurante,
  coordenadasDestino,
  ubicacionActual,
  ruta,
  rutaOriginal,
  recorridoIniciado,
  direccionRestaurante,
  direccionDestino,
}) {
  // Determinar qué ruta mostrar: si está en recorrido y hay ruta en tiempo real, usar esa, sino usar original
  const rutaAMostrar = recorridoIniciado && ruta ? ruta : rutaOriginal;
  // Centro por defecto (Argentina) - Buenos Aires
  const centroPorDefecto = [-34.6037, -58.3816];

  // Determinar el centro inicial del mapa - siempre debe tener un valor válido
  let centroInicial = centroPorDefecto;
  
  if (coordenadasDestino && coordenadasDestino.lat && coordenadasDestino.lng) {
    centroInicial = [coordenadasDestino.lat, coordenadasDestino.lng];
  } else if (coordenadasRestaurante && coordenadasRestaurante.lat && coordenadasRestaurante.lng) {
    centroInicial = [coordenadasRestaurante.lat, coordenadasRestaurante.lng];
  }

  // Asegurar que centroInicial siempre sea válido
  if (!Array.isArray(centroInicial) || centroInicial.length !== 2 || isNaN(centroInicial[0]) || isNaN(centroInicial[1])) {
    centroInicial = centroPorDefecto;
  }

  // Icono personalizado para el restaurante (verde)
  const iconoRestaurante = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Icono personalizado para el destino (rojo)
  const iconoDestino = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Icono personalizado para ubicación actual (azul con pulso)
  const iconoUbicacion = L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <MapContainer
      center={centroInicial}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0, minHeight: "400px" }}
      scrollWheelZoom={true}
      whenReady={(map) => {
        // Forzar actualización del tamaño del mapa cuando esté listo
        setTimeout(() => {
          map.target.invalidateSize();
        }, 100);
      }}
    >
      {/* Tile Layer - OpenStreetMap (100% gratis) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Controlador del mapa */}
      <MapController
        coordenadasRestaurante={coordenadasRestaurante}
        coordenadasDestino={coordenadasDestino}
        ubicacionActual={ubicacionActual}
        recorridoIniciado={recorridoIniciado}
        ruta={ruta}
        rutaOriginal={rutaOriginal}
      />

      {/* Marcador del restaurante */}
      {coordenadasRestaurante && coordenadasRestaurante.lat && coordenadasRestaurante.lng && (
        <Marker
          position={[coordenadasRestaurante.lat, coordenadasRestaurante.lng]}
          icon={iconoRestaurante}
        >
          <Popup>
            <div>
              <strong>📍 Restaurante</strong>
              <br />
              {direccionRestaurante || "Origen"}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marcador del destino */}
      {coordenadasDestino && coordenadasDestino.lat && coordenadasDestino.lng && (
        <Marker
          position={[coordenadasDestino.lat, coordenadasDestino.lng]}
          icon={iconoDestino}
        >
          <Popup>
            <div>
              <strong>🎯 Destino</strong>
              <br />
              {direccionDestino || "Destino"}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marcador de ubicación actual */}
      {ubicacionActual && ubicacionActual.lat && ubicacionActual.lng && (
        <Marker
          position={[ubicacionActual.lat, ubicacionActual.lng]}
          icon={iconoUbicacion}
        >
          <Popup>
            <div>
              <strong>👤 Tu ubicación</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Ruta original (azul) - solo si no está en recorrido */}
      {!recorridoIniciado && rutaOriginal && rutaOriginal.length > 0 && (
        <Polyline
          positions={rutaOriginal}
          color="#3b82f6"
          weight={5}
          opacity={0.7}
          smoothFactor={1}
        />
      )}

      {/* Ruta en tiempo real (violeta) - cuando está en recorrido */}
      {recorridoIniciado && ruta && ruta.length > 0 && (
        <Polyline
          positions={ruta}
          color="#9333ea"
          weight={6}
          opacity={0.9}
          smoothFactor={1}
          dashArray="10, 5"
        />
      )}
    </MapContainer>
  );
}
