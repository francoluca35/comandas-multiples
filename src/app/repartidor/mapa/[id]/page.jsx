"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDeliveryOrders } from "../../../../hooks/useDeliveryOrders";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

// Importar Leaflet CSS
import "leaflet/dist/leaflet.css";

// Importar dinámicamente el mapa para evitar errores de SSR
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function MapaPedido() {
  const router = useRouter();
  const params = useParams();
  const pedidoId = params.id;
  
  const { marcarEnCamino, marcarEntregado } = useDeliveryOrders();
  
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recorridoIniciado, setRecorridoIniciado] = useState(false);
  const [puedeEntregar, setPuedeEntregar] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [coordenadasDestino, setCoordenadasDestino] = useState(null);
  const [coordenadasRestaurante, setCoordenadasRestaurante] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [rutaEnTiempoReal, setRutaEnTiempoReal] = useState(null);
  const [distanciaEstimada, setDistanciaEstimada] = useState(0);
  const [tiempoEstimado, setTiempoEstimado] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const [direccionRestaurante, setDireccionRestaurante] = useState("");
  const ultimaActualizacionRuta = useRef(Date.now());
  const [panelAbierto, setPanelAbierto] = useState(true); // Inicialmente abierto
  const [autoAbierto, setAutoAbierto] = useState(false); // Para saber si se abrió automáticamente
  const [estadoTrafico, setEstadoTrafico] = useState("fluido"); // fluido, moderado, pesado, muy_pesado
  const [velocidadActual, setVelocidadActual] = useState(0); // km/h
  const [velocidadPromedioEsperada, setVelocidadPromedioEsperada] = useState(0); // km/h
  const ubicacionAnterior = useRef(null);
  const tiempoAnterior = useRef(Date.now());
  const [datosTraficoWaze, setDatosTraficoWaze] = useState(null); // Datos de tráfico de Waze
  const [cargandoTrafico, setCargandoTrafico] = useState(false);
  const entregadoAutomaticamente = useRef(false); // Para evitar entregas múltiples
  
  // Cerrar panel automáticamente cuando se inicia el recorrido
  useEffect(() => {
    if (recorridoIniciado) {
      setPanelAbierto(false);
      setAutoAbierto(false);
    }
  }, [recorridoIniciado]);

  useEffect(() => {
    // Verificar autenticación (case-insensitive)
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    if (rol !== "repartidor") {
      router.push("/repartidor/login");
      return;
    }

    // Cargar pedido y datos del restaurante
    cargarDatos();

    // Limpiar watch cuando se desmonte el componente
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const cargarDatos = async () => {
    try {
      const restaurantId = localStorage.getItem("restauranteId");
      
      // Cargar pedido
      const pedidoRef = doc(db, "restaurantes", restaurantId, "delivery", pedidoId);
      const pedidoDoc = await getDoc(pedidoRef);
      
      if (pedidoDoc.exists()) {
        const pedidoData = {
          id: pedidoDoc.id,
          ...pedidoDoc.data(),
        };
        setPedido(pedidoData);

        // Cargar datos del restaurante
        const restauranteRef = doc(db, "restaurantes", restaurantId);
        const restauranteDoc = await getDoc(restauranteRef);
        
        if (restauranteDoc.exists()) {
          const restauranteData = restauranteDoc.data();
          const direccion = restauranteData.informacion?.direccion || 
                          restauranteData.direccion || 
                          "Dirección no configurada";
          setDireccionRestaurante(direccion);
          
          // Geocodificar dirección del restaurante
          geocodificarDireccion(direccion, "restaurante");
        }

        // Geocodificar dirección del destino
        const direccionDestino = pedidoData.direccion || "";
        if (direccionDestino) {
          geocodificarDireccion(direccionDestino, "destino");
        }
      } else {
        Swal.fire("Error", "Pedido no encontrado", "error");
        router.push("/repartidor/dashboard");
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire("Error", "Error al cargar los datos", "error");
      router.push("/repartidor/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const geocodificarDireccion = async (direccion, tipo) => {
    try {
      // Usar Nominatim (OpenStreetMap) para geocoding - 100% gratis
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ComandasMultiples/1.0' // Requerido por Nominatim
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const coordenadas = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        
        if (tipo === "restaurante") {
          setCoordenadasRestaurante(coordenadas);
        } else if (tipo === "destino") {
          setCoordenadasDestino(coordenadas);
          
          // Si tenemos ambas coordenadas, calcular la ruta
          if (coordenadasRestaurante) {
            calcularRuta(coordenadasRestaurante, coordenadas);
          }
        }
      } else {
        console.warn(`No se pudo geocodificar la dirección: ${direccion}`);
      }
    } catch (error) {
      console.error("Error en geocoding:", error);
    }
  };

  // Calcular ruta cuando ambas coordenadas estén disponibles
  useEffect(() => {
    if (coordenadasRestaurante && coordenadasDestino) {
      calcularRuta(coordenadasRestaurante, coordenadasDestino);
    }
  }, [coordenadasRestaurante, coordenadasDestino]);

  const calcularRuta = async (origen, destino) => {
    try {
      // Usar OSRM (Open Source Routing Machine) - 100% gratis
      // Formato: [longitud, latitud] para OSRM
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&steps=true`
      );
      
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convertir geometría de GeoJSON a formato para Leaflet
        const coordenadasRuta = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRuta(coordenadasRuta);
        setDistanciaEstimada((route.distance / 1000).toFixed(1)); // Convertir a km
        setTiempoEstimado(Math.round(route.duration / 60)); // Convertir a minutos
      }
    } catch (error) {
      console.error("Error calculando ruta:", error);
    }
  };

  const iniciarRecorrido = async () => {
    try {
      await marcarEnCamino(pedidoId);
      setRecorridoIniciado(true);
      setPanelAbierto(false); // Cerrar panel automáticamente al iniciar recorrido
      setAutoAbierto(false); // Resetear flag de auto-apertura
      
      // Obtener ubicación actual
      obtenerUbicacionActual();
      
      // Esperar a tener ubicación y luego calcular ruta desde ahí
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const ubicacionInicial = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUbicacionActual(ubicacionInicial);
            
            // Calcular ruta inicial desde ubicación actual al destino
            if (coordenadasDestino) {
              await calcularRutaEnTiempoReal(ubicacionInicial, coordenadasDestino);
            }
            
            // Iniciar seguimiento continuo
            iniciarSeguimientoUbicacion();
          },
          (error) => {
            console.error("Error obteniendo ubicación inicial:", error);
            // Iniciar seguimiento de todas formas
            iniciarSeguimientoUbicacion();
          }
        );
      } else {
        iniciarSeguimientoUbicacion();
      }
      
      Swal.fire("¡Recorrido iniciado!", "El pedido ha sido marcado como en camino", "success");
    } catch (error) {
      console.error("Error iniciando recorrido:", error);
      Swal.fire("Error", "Error al iniciar el recorrido", "error");
    }
  };

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacionActual({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          Swal.fire("Error", "No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación.", "warning");
        }
      );
    }
  };

  const iniciarSeguimientoUbicacion = () => {
    if (navigator.geolocation && coordenadasDestino) {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const ahora = Date.now();
          const nuevaUbicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Calcular velocidad si tenemos ubicación anterior
          if (ubicacionAnterior.current && tiempoAnterior.current) {
            const distancia = calcularDistancia(
              ubicacionAnterior.current.lat,
              ubicacionAnterior.current.lng,
              nuevaUbicacion.lat,
              nuevaUbicacion.lng
            ); // en km
            
            const tiempoTranscurrido = (ahora - tiempoAnterior.current) / 1000 / 3600; // en horas
            
            if (tiempoTranscurrido > 0) {
              const velocidadCalculada = distancia / tiempoTranscurrido; // km/h
              setVelocidadActual(velocidadCalculada);
              
              // Obtener datos de tráfico de Waze cada 2 minutos (Waze se actualiza cada 2 minutos)
              const ultimaConsultaTrafico = localStorage.getItem("ultimaConsultaTraficoWaze");
              const tiempoDesdeUltimaConsulta = ultimaConsultaTrafico ? ahora - parseInt(ultimaConsultaTrafico) : Infinity;
              
              if (tiempoDesdeUltimaConsulta > 120000) { // Cada 2 minutos (120000ms) - Waze se actualiza cada 2 min
                obtenerDatosTraficoWaze(nuevaUbicacion.lat, nuevaUbicacion.lng, 5).then((datosWaze) => {
                  if (datosWaze) {
                    const estado = calcularEstadoTrafico(velocidadCalculada, velocidadPromedioEsperada, datosWaze);
                    setEstadoTrafico(estado);
                    console.log("🚗 Velocidad:", velocidadCalculada.toFixed(1), "km/h | Estado tráfico:", estado, "| Fuente: Waze Data Feed");
                  } else {
                    // Fallback sin datos de Waze
                    const estado = calcularEstadoTrafico(velocidadCalculada, velocidadPromedioEsperada);
                    setEstadoTrafico(estado);
                    console.log("🚗 Velocidad:", velocidadCalculada.toFixed(1), "km/h | Estado tráfico:", estado, "| Fuente: Velocidad estimada");
                  }
                });
                localStorage.setItem("ultimaConsultaTraficoWaze", ahora.toString());
              } else {
                // Calcular estado de tráfico con datos existentes o fallback
                const estado = calcularEstadoTrafico(velocidadCalculada, velocidadPromedioEsperada, datosTraficoWaze);
                setEstadoTrafico(estado);
                console.log("🚗 Velocidad:", velocidadCalculada.toFixed(1), "km/h | Estado tráfico:", estado, datosTraficoWaze ? "| Fuente: Waze Data Feed (caché)" : "| Fuente: Velocidad estimada");
              }
            }
          }
          
          // Guardar ubicación y tiempo actual para el próximo cálculo
          ubicacionAnterior.current = nuevaUbicacion;
          tiempoAnterior.current = ahora;
          
          setUbicacionActual(nuevaUbicacion);
          
          // Recalcular ruta en tiempo real desde la ubicación actual al destino
          // Solo actualizar cada 5 segundos para no saturar el servicio
          if (coordenadasDestino && (ahora - ultimaActualizacionRuta.current > 5000)) {
            ultimaActualizacionRuta.current = ahora;
            calcularRutaEnTiempoReal(nuevaUbicacion, coordenadasDestino);
          }
          
          // Calcular distancia al destino
          const distancia = calcularDistancia(
            nuevaUbicacion.lat,
            nuevaUbicacion.lng,
            coordenadasDestino.lat,
            coordenadasDestino.lng
          );
          
          // Entregar automáticamente si está a menos de 20 metros del destino
          if (distancia < 0.02 && !entregadoAutomaticamente.current && recorridoIniciado) { // 20 metros
            entregadoAutomaticamente.current = true;
            console.log("📍 Entrega automática: El repartidor está a menos de 20 metros del destino");
            
            // Marcar como entregado automáticamente
            marcarEntregado(pedidoId)
              .then(() => {
                Swal.fire({
                  title: "✅ Pedido Entregado Automáticamente",
                  text: "Has llegado al destino. El pedido ha sido marcado como entregado.",
                  icon: "success",
                  confirmButtonText: "Entendido",
                  confirmButtonColor: "#10b981",
                  timer: 4000,
                  timerProgressBar: true,
                }).then(() => {
                  router.push("/repartidor/dashboard");
                });
              })
              .catch((error) => {
                console.error("Error entregando pedido automáticamente:", error);
                entregadoAutomaticamente.current = false; // Permitir reintentar si falla
                Swal.fire("Error", "Error al marcar el pedido como entregado automáticamente", "error");
              });
          }
          
          // Habilitar botón entregar si está a menos de 50 metros
          if (distancia < 0.05) { // 50 metros
            setPuedeEntregar(true);
            // Abrir panel automáticamente si está cerrado y no se abrió manualmente
            if (!panelAbierto && !autoAbierto) {
              setPanelAbierto(true);
              setAutoAbierto(true);
            }
          }
        },
        (error) => {
          console.error("Error en seguimiento de ubicación:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      
      setWatchId(id);
    }
  };

  const calcularRutaEnTiempoReal = async (origen, destino) => {
    try {
      // Usar OSRM para calcular nueva ruta desde ubicación actual
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`
      );
      
      const data = await response.json();
      
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Convertir geometría de GeoJSON a formato para Leaflet
        const coordenadasRuta = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRutaEnTiempoReal(coordenadasRuta);
        
        // Actualizar tiempo y distancia estimados
        const distanciaKm = route.distance / 1000;
        const tiempoMinutos = Math.round(route.duration / 60);
        
        setDistanciaEstimada(distanciaKm.toFixed(1)); // Convertir a km
        setTiempoEstimado(tiempoMinutos); // Convertir a minutos
        
        // Calcular velocidad promedio esperada (distancia en km / tiempo en horas)
        const tiempoHoras = route.duration / 3600; // Convertir segundos a horas
        const velocidadEsperada = distanciaKm / tiempoHoras;
        setVelocidadPromedioEsperada(velocidadEsperada);
        
        console.log("📊 Velocidad promedio esperada:", velocidadEsperada.toFixed(1), "km/h");
      }
    } catch (error) {
      console.error("Error calculando ruta en tiempo real:", error);
    }
  };
  
  // Obtener datos de tráfico de Waze Data Feed
  const obtenerDatosTraficoWaze = async (lat, lng, radio = 5) => {
    try {
      // Waze Data Feed - formato GeoRSS/JSON
      // Para producción, necesitarás registrarte en Waze Partners para obtener tu feed personalizado
      // URL pública alternativa (puede requerir backend proxy debido a CORS)
      const radioGrados = radio / 111; // Aproximadamente 111 km por grado
      const minLat = lat - radioGrados;
      const maxLat = lat + radioGrados;
      const minLng = lng - radioGrados;
      const maxLng = lng + radioGrados;
      
      setCargandoTrafico(true);
      
      // Intentar obtener desde endpoint público de Waze (puede requerir proxy backend)
      // En producción, usa tu feed personalizado de Waze Partners
      const wazeFeedUrl = `https://www.waze.com/rtserver/web/TGeoRSS?ma=600&mj=100&mu=100&left=${minLng}&right=${maxLng}&bottom=${minLat}&top=${maxLat}&types=alerts,traffic`;
      
      try {
        const response = await fetch(wazeFeedUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/xml, application/xml',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Waze API error: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type') || '';
        
        // Waze puede devolver XML (GeoRSS) - necesitamos parsearlo
        if (contentType.includes('xml') || contentType.includes('text')) {
          const xmlText = await response.text();
          
          // Parsear XML básico para extraer alertas
          // Nota: Para una implementación completa, usa una librería como xml2js
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          // Extraer alertas de tráfico
          const alerts = [];
          const items = xmlDoc.getElementsByTagName('item');
          
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const title = item.getElementsByTagName('title')[0]?.textContent || '';
            const description = item.getElementsByTagName('description')[0]?.textContent || '';
            const point = item.getElementsByTagName('point')[0]?.textContent || '';
            
            // Extraer coordenadas si están disponibles
            const coords = point.split(' ');
            
            alerts.push({
              type: title.toLowerCase(),
              description: description,
              lat: coords[0] ? parseFloat(coords[0]) : null,
              lng: coords[1] ? parseFloat(coords[1]) : null,
            });
          }
          
          const data = { alerts, timestamp: Date.now() };
          setDatosTraficoWaze(data);
          setCargandoTrafico(false);
          
          console.log("✅ Datos de tráfico Waze obtenidos:", data);
          return data;
        } else {
          // Si es JSON
          const data = await response.json();
          setDatosTraficoWaze(data);
          setCargandoTrafico(false);
          console.log("✅ Datos de tráfico Waze obtenidos (JSON):", data);
          return data;
        }
      } catch (corsError) {
        // Si hay error CORS, usar método alternativo o datos estimados
        console.warn("⚠️ Error CORS con Waze. Para producción, configura un backend proxy o usa tu feed personalizado de Waze Partners.");
        console.warn("💡 Registro en Waze Partners: https://www.waze.com/partners");
        setCargandoTrafico(false);
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo datos de tráfico Waze:", error);
      setCargandoTrafico(false);
      return null;
    }
  };
  
  // Calcular estado de tráfico basado en datos de Waze y velocidad actual
  const calcularEstadoTrafico = (velocidadActual, velocidadEsperada, datosWaze = null) => {
    // Si tenemos datos de Waze, analizarlos
    if (datosWaze) {
      let nivelCongestion = 0;
      let totalIncidentes = 0;
      
      // Waze proporciona alertas de tráfico: accidentes, peligros, construcciones, embotellamientos
      if (datosWaze.alerts && Array.isArray(datosWaze.alerts)) {
        // Contar incidentes en el área
        totalIncidentes = datosWaze.alerts.length;
        
        // Analizar tipos de alertas (cada tipo afecta el tráfico de manera diferente)
        datosWaze.alerts.forEach((alert) => {
          const tipo = alert.type?.toLowerCase() || '';
          
          // Ponderar por tipo de incidente
          if (tipo.includes('accident') || tipo.includes('accidente')) {
            nivelCongestion += 3; // Accidente = tráfico pesado
          } else if (tipo.includes('jam') || tipo.includes('congestion')) {
            nivelCongestion += 2.5; // Embotellamiento = tráfico pesado
          } else if (tipo.includes('hazard') || tipo.includes('peligro')) {
            nivelCongestion += 1.5; // Peligro = tráfico moderado
          } else if (tipo.includes('construction') || tipo.includes('construccion')) {
            nivelCongestion += 2; // Construcción = tráfico pesado
          } else {
            nivelCongestion += 1; // Otro tipo = tráfico leve
          }
        });
        
        // Calcular nivel promedio de congestión
        if (totalIncidentes > 0) {
          const nivelPromedio = nivelCongestion / totalIncidentes;
          
          // Convertir a estado de tráfico
          if (nivelPromedio >= 2.5 || totalIncidentes >= 5) {
            return "muy_pesado";
          } else if (nivelPromedio >= 2 || totalIncidentes >= 3) {
            return "pesado";
          } else if (nivelPromedio >= 1.5 || totalIncidentes >= 2) {
            return "moderado";
          } else {
            return "fluido";
          }
        }
      }
      
      // Si hay datos de tráfico pero no alertas específicas, verificar otros campos
      if (datosWaze.traffic && datosWaze.traffic.length > 0) {
        // Analizar datos de tráfico si están disponibles
        const congestionLevel = datosWaze.traffic.reduce((acc, item) => {
          return acc + (item.congestionLevel || 0);
        }, 0) / datosWaze.traffic.length;
        
        if (congestionLevel >= 0.8) {
          return "muy_pesado";
        } else if (congestionLevel >= 0.6) {
          return "pesado";
        } else if (congestionLevel >= 0.4) {
          return "moderado";
        }
      }
    }
    
    // Fallback: usar velocidad actual vs esperada si no hay datos de Waze
    if (!velocidadEsperada || velocidadEsperada === 0) {
      return "fluido";
    }
    
    const porcentajeVelocidad = (velocidadActual / velocidadEsperada) * 100;
    
    if (porcentajeVelocidad >= 80) {
      return "fluido"; // Verde
    } else if (porcentajeVelocidad >= 50) {
      return "moderado"; // Amarillo
    } else if (porcentajeVelocidad >= 30) {
      return "pesado"; // Naranja
    } else {
      return "muy_pesado"; // Rojo
    }
  };

  // Calcular distancia entre dos puntos usando fórmula de Haversine
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const entregarPedido = async () => {
    try {
      const result = await Swal.fire({
        title: "¿Confirmar entrega?",
        text: "¿Estás seguro de que el pedido ha sido entregado?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, entregado",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        await marcarEntregado(pedidoId);
        Swal.fire("¡Entregado!", "El pedido ha sido marcado como entregado", "success");
        router.push("/repartidor/dashboard");
      }
    } catch (error) {
      console.error("Error entregando pedido:", error);
      Swal.fire("Error", "Error al marcar el pedido como entregado", "error");
    }
  };

  const handleCerrar = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    router.push("/repartidor/dashboard");
  };

  if (loading || !pedido) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-lg">Cargando mapa...</div>
        </div>
      </div>
    );
  }

  // Obtener datos del pedido
  const cliente = pedido.cliente || pedido.clientData?.name || "Sin nombre";
  const direccion = pedido.direccion || pedido.clientData?.address || "Sin dirección";
  const total = pedido.total || pedido.monto || 0;
  const productos = pedido.productos || [];

  return (
    <div className="h-screen bg-gray-900 relative flex flex-col overflow-hidden">
      {/* Botón cerrar */}
      <button
        onClick={handleCerrar}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
      >
        <span className="text-gray-900 text-xl font-bold">×</span>
      </button>

      {/* Botón para abrir navegación completa en Waze App - solo cuando está en recorrido */}
      {recorridoIniciado && coordenadasDestino && (
        <a
          href={`https://waze.com/ul?ll=${coordenadasDestino.lat},${coordenadasDestino.lng}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-20 z-[1001] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
          title="Abrir navegación completa en Waze App"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-sm font-semibold">Abrir Waze</span>
        </a>
      )}

      {/* Mapa - debe tener altura definida - más grande cuando está en recorrido y panel cerrado */}
      <div 
        className="relative w-full transition-all duration-500 ease-in-out" 
        style={{ 
          height: recorridoIniciado && !panelAbierto ? '100vh' : '50vh',
          minHeight: recorridoIniciado && !panelAbierto ? '100vh' : '50vh'
        }}
      >
        {/* Mapa Waze siempre visible cuando está en recorrido con ruta superpuesta */}
        {recorridoIniciado && coordenadasDestino ? (
          // Mapa Waze con tráfico en tiempo real - con ruta superpuesta
          <div className="relative w-full h-full">
            <iframe
              src={`https://embed.waze.com/fr/iframe?zoom=13&lat=${ubicacionActual?.lat || coordenadasDestino.lat}&lon=${ubicacionActual?.lng || coordenadasDestino.lng}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allow="geolocation"
              loading="lazy"
              title="Mapa Waze con tráfico en tiempo real - Ruta desde restaurante hacia destino del cliente"
              key={`waze-${ubicacionActual?.lat?.toFixed(3)}-${ubicacionActual?.lng?.toFixed(3)}`} // Forzar actualización cuando cambia ubicación
            />
            
            {/* Overlay SVG para dibujar la ruta sobre Waze */}
            {ruta && ruta.length > 0 && coordenadasRestaurante && coordenadasDestino && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1001]"
                style={{ overlay: 'none' }}
              >
                {/* Convertir coordenadas de la ruta a coordenadas de pantalla */}
                {(() => {
                  // Calcular el centro y zoom del mapa para proyectar coordenadas
                  const centerLat = ubicacionActual?.lat || coordenadasDestino.lat;
                  const centerLng = ubicacionActual?.lng || coordenadasDestino.lng;
                  const zoom = 13;
                  
                  // Función para convertir lat/lng a coordenadas de pantalla
                  const latLngToScreen = (lat, lng) => {
                    const scale = Math.pow(2, zoom) * 256;
                    const worldX = (lng + 180) / 360 * scale;
                    const worldY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * scale;
                    const centerWorldX = (centerLng + 180) / 360 * scale;
                    const centerWorldY = (1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * scale;
                    const screenX = worldX - centerWorldX + (window.innerWidth || 800) / 2;
                    const screenY = worldY - centerWorldY + (window.innerHeight || 600) / 2;
                    return { x: screenX, y: screenY };
                  };
                  
                  // Dibujar la ruta
                  const routePoints = ruta.map(coord => latLngToScreen(coord[0], coord[1]));
                  const pathData = routePoints.map((point, i) => 
                    `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                  ).join(' ');
                  
                  return (
                    <>
                      {/* Línea de la ruta */}
                      <path
                        d={pathData}
                        stroke="#9333ea"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.9"
                        strokeDasharray="10, 5"
                      />
                      {/* Marcador de origen (restaurante) */}
                      {coordenadasRestaurante && (() => {
                        const originScreen = latLngToScreen(coordenadasRestaurante.lat, coordenadasRestaurante.lng);
                        return (
                          <g>
                            <circle
                              cx={originScreen.x}
                              cy={originScreen.y}
                              r="12"
                              fill="#10b981"
                              stroke="white"
                              strokeWidth="3"
                            />
                            <text
                              x={originScreen.x}
                              y={originScreen.y + 5}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              O
                            </text>
                          </g>
                        );
                      })()}
                      {/* Marcador de destino */}
                      {coordenadasDestino && (() => {
                        const destScreen = latLngToScreen(coordenadasDestino.lat, coordenadasDestino.lng);
                        return (
                          <g>
                            <circle
                              cx={destScreen.x}
                              cy={destScreen.y}
                              r="12"
                              fill="#ef4444"
                              stroke="white"
                              strokeWidth="3"
                            />
                            <text
                              x={destScreen.x}
                              y={destScreen.y + 5}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              D
                            </text>
                          </g>
                        );
                      })()}
                      {/* Marcador de ubicación actual */}
                      {ubicacionActual && recorridoIniciado && (() => {
                        const currentScreen = latLngToScreen(ubicacionActual.lat, ubicacionActual.lng);
                        return (
                          <g>
                            <circle
                              cx={currentScreen.x}
                              cy={currentScreen.y}
                              r="10"
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="3"
                              opacity="0.9"
                            >
                              <animate
                                attributeName="r"
                                values="10;14;10"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </g>
                        );
                      })()}
                    </>
                  );
                })()}
              </svg>
            )}
            {/* Panel informativo flotante con ruta completa */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 z-[1002] max-w-sm border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <span>🗺️</span>
                <span>Ruta de Entrega</span>
              </h3>
              
              {/* Visualización de ruta: Restaurante → Destino */}
              <div className="mb-3 pb-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-red-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">O</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">Origen</p>
                    <p className="text-xs text-gray-500 truncate">{direccionRestaurante || "El cielito 1478, Marcos Paz, Buenos aires"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center my-2">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-red-500"></div>
                  <div className="mx-2 text-xs text-gray-500 font-semibold">{distanciaEstimada > 0 ? `${distanciaEstimada} km` : "..."}</div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-red-500 via-blue-500 to-green-500"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">D</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700">Destino: {cliente}</p>
                    <p className="text-xs text-gray-500 truncate">{direccion || "Cargando dirección..."}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación del restaurante (origen) */}
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg"></div>
                  <span className="text-sm font-semibold text-gray-700">Origen: Restaurante</span>
                </div>
                <p className="text-xs text-gray-600 font-medium ml-5">{direccionRestaurante || "El cielito 1478, Marcos Paz, Buenos aires"}</p>
                {coordenadasRestaurante && (
                  <p className="text-xs text-gray-400 ml-5 mt-1">
                    {coordenadasRestaurante.lat.toFixed(5)}, {coordenadasRestaurante.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Tiempo estimado y distancia */}
              {tiempoEstimado > 0 && distanciaEstimada > 0 && (
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>Tiempo estimado:</span>
                    </span>
                    <span className="text-xl font-bold text-blue-600">{tiempoEstimado} min</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 flex items-center space-x-1">
                      <span>📏</span>
                      <span>Distancia:</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{distanciaEstimada} km</span>
                  </div>
                  {velocidadActual > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>🚗</span>
                        <span>Velocidad actual:</span>
                      </span>
                      <span className="text-xs font-semibold text-gray-600">{velocidadActual.toFixed(1)} km/h</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón para abrir en app Waze con navegación */}
              <a
                href={`https://waze.com/ul?ll=${coordenadasDestino.lat},${coordenadasDestino.lng}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
              >
                📱 Abrir navegación en Waze App
              </a>
              <p className="text-xs text-gray-500 text-center mt-2">
                La app calculará la ruta completa con tiempo de viaje
              </p>
            </div>
          </div>
        ) : coordenadasRestaurante || coordenadasDestino ? (
          <MapComponent
            coordenadasRestaurante={coordenadasRestaurante}
            coordenadasDestino={coordenadasDestino}
            ubicacionActual={ubicacionActual}
            ruta={recorridoIniciado ? rutaEnTiempoReal : ruta}
            rutaOriginal={ruta}
            recorridoIniciado={recorridoIniciado}
            direccionRestaurante={direccionRestaurante}
            direccionDestino={direccion}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Cargando mapa...</p>
              <p className="text-sm mt-2">Geocodificando direcciones...</p>
            </div>
          </div>
        )}
      </div>

      {/* Botón para abrir/cerrar panel cuando está en recorrido */}
      {recorridoIniciado && (
        <button
          onClick={() => {
            setPanelAbierto(!panelAbierto);
            setAutoAbierto(false); // Si lo abre manualmente, no se abre automáticamente
          }}
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60] bg-white rounded-full p-4 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            panelAbierto ? 'rotate-180' : ''
          }`}
          style={{ marginBottom: panelAbierto ? '0' : '20px' }}
        >
          <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Panel de información */}
      <div 
        className={`bg-white rounded-t-3xl absolute bottom-0 left-0 right-0 overflow-y-auto z-50 transition-all duration-500 ease-in-out ${
          recorridoIniciado && !panelAbierto 
            ? 'transform translate-y-full opacity-0 pointer-events-none' 
            : 'transform translate-y-0 opacity-100'
        }`}
        style={{ 
          maxHeight: '50%',
          height: panelAbierto ? '50%' : '0%'
        }}
      >
        <div className="p-6">
          {/* Botón Delivery/Iniciar Recorrido */}
          <button
            onClick={recorridoIniciado ? undefined : iniciarRecorrido}
            disabled={recorridoIniciado}
            className={`w-full py-3 px-4 rounded-full font-semibold mb-4 flex items-center justify-center space-x-2 ${
              recorridoIniciado
                ? "bg-green-600 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            } transition-colors`}
          >
            {recorridoIniciado ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Delivery en curso</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Iniciar recorrido</span>
              </>
            )}
          </button>

          {/* Total */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-black mb-1">
              ${total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total del pedido</p>
          </div>

          {/* Tiempo y distancia */}
          {tiempoEstimado > 0 && (
            <div className="mb-4 flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-black font-semibold">
                {tiempoEstimado} min ({distanciaEstimada} km) total
              </span>
            </div>
          )}

          {/* Estado de tráfico en tiempo real - solo cuando está en recorrido */}
          {recorridoIniciado && velocidadActual > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 font-medium">Estado de tráfico en tiempo real</span>
                  {cargandoTrafico && (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {mostrarMapaWaze && (
                    <span className="text-xs text-green-600 font-semibold" title="Visualizando mapa Waze con tráfico">
                      🗺️ Waze Activo
                    </span>
                  )}
                  {datosTraficoWaze && !cargandoTrafico && !mostrarMapaWaze && (
                    <span className="text-xs text-green-600 font-semibold" title="Datos de Waze Data Feed">
                      ✓ Waze
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-700 font-semibold">
                  {velocidadActual.toFixed(1)} km/h
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Indicador visual de tráfico */}
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      estadoTrafico === "fluido"
                        ? "bg-green-500"
                        : estadoTrafico === "moderado"
                        ? "bg-yellow-500"
                        : estadoTrafico === "pesado"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${
                        estadoTrafico === "fluido"
                          ? "100%"
                          : estadoTrafico === "moderado"
                          ? "70%"
                          : estadoTrafico === "pesado"
                          ? "40%"
                          : "20%"
                      }`,
                    }}
                  />
                </div>
                {/* Etiqueta de estado */}
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    estadoTrafico === "fluido"
                      ? "bg-green-100 text-green-700"
                      : estadoTrafico === "moderado"
                      ? "bg-yellow-100 text-yellow-700"
                      : estadoTrafico === "pesado"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {estadoTrafico === "fluido"
                    ? "Fluido"
                    : estadoTrafico === "moderado"
                    ? "Moderado"
                    : estadoTrafico === "pesado"
                    ? "Pesado"
                    : "Muy Pesado"}
                </span>
              </div>
            </div>
          )}

          {/* Origen y destino */}
          <div className="space-y-4 mb-6">
            {/* Origen (restaurante) */}
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div className="w-0.5 h-full bg-gray-300 mt-1 mb-1"></div>
              </div>
              <div className="flex-1">
                <p className="text-black font-semibold">Restaurante</p>
                <p className="text-sm text-gray-500">{direccionRestaurante || "Cargando..."}</p>
              </div>
            </div>

            {/* Destino (cliente) */}
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-black font-semibold">{cliente}</p>
                <p className="text-sm text-gray-500">{direccion}</p>
              </div>
            </div>
          </div>

          {/* Botón entregar manual */}
          {recorridoIniciado && (
            <button
              onClick={entregarPedido}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-colors ${
                puedeEntregar
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              }`}
              title={puedeEntregar ? "Entregar pedido" : "Marcar como entregado manualmente"}
            >
              {puedeEntregar ? (
                <>
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Entregar Pedido
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Marcar como Entregado Manualmente
                </>
              )}
            </button>
          )}

          {/* Información adicional */}
          {productos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Productos:</p>
              <ul className="space-y-1">
                {productos.slice(0, 5).map((producto, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {producto.nombre || producto.name} x{producto.cantidad || 1}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}