"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

function HistorialPedidos({ onClose }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos"); // "todos", "salon", "takeaway"

  useEffect(() => {
    fetchHistorialPedidos();
  }, []);

  const fetchHistorialPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      const restauranteId = localStorage.getItem("restauranteId");
      if (!restauranteId) {
        throw new Error("No se encontró el ID del restaurante");
      }

      // Obtener pedidos de cocina que están en estado "realizado"
      const pedidosRef = collection(db, `restaurantes/${restauranteId}/pedidosCocina`);
      const q = query(
        pedidosRef,
        where("estado", "==", "realizado"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const pedidosData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pedidosData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        });
      });

      setPedidos(pedidosData);
    } catch (err) {
      console.error("Error al obtener historial de pedidos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    if (filtroTipo === "todos") {
      return pedidos;
    } else if (filtroTipo === "salon") {
      return pedidos.filter(pedido => pedido.mesa !== "TAKEAWAY" && pedido.tipo !== "takeaway");
    } else if (filtroTipo === "takeaway") {
      return pedidos.filter(pedido => pedido.mesa === "TAKEAWAY" || pedido.tipo === "takeaway");
    }
    return pedidos;
  };

  const pedidosFiltrados = filtrarPedidos();

  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-white text-xl font-bold mb-2">Error</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">Historial de Pedidos</h2>
                <p className="text-slate-300 text-sm">Todos los pedidos entregados por cocina</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-700 p-4 border-b border-slate-600">
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">Filtrar por tipo:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltroTipo("todos")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroTipo === "todos"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                onClick={() => setFiltroTipo("salon")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroTipo === "salon"
                    ? "bg-yellow-600 text-white"
                    : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                }`}
              >
                Salón ({pedidos.filter(p => p.mesa !== "TAKEAWAY" && p.tipo !== "takeaway").length})
              </button>
              <button
                onClick={() => setFiltroTipo("takeaway")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroTipo === "takeaway"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                }`}
              >
                Takeaway ({pedidos.filter(p => p.mesa === "TAKEAWAY" || p.tipo === "takeaway").length})
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {pedidosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-slate-400 text-6xl mb-4">📋</div>
              <h3 className="text-white text-xl font-bold mb-2">No hay pedidos en el historial</h3>
              <p className="text-slate-400">
                {filtroTipo === "todos" 
                  ? "Aún no se han completado pedidos" 
                  : `No hay pedidos de ${filtroTipo === "salon" ? "salón" : "takeaway"} en el historial`
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {pedidosFiltrados.map((pedido) => {
                const isTakeaway = pedido.mesa === "TAKEAWAY" || pedido.tipo === "takeaway";
                
                return (
                  <div
                    key={pedido.id}
                    className={`bg-slate-700 rounded-xl p-6 border-l-4 ${
                      isTakeaway 
                        ? "border-orange-500" 
                        : "border-yellow-500"
                    }`}
                  >
                    {/* Header del pedido */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isTakeaway 
                            ? "bg-orange-500/20 text-orange-400" 
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {isTakeaway ? `TAKEAWAY - ${pedido.cliente}` : `Mesa ${pedido.mesa}`}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {formatDate(pedido.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Etiqueta de tipo */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isTakeaway 
                            ? "bg-orange-500 text-white" 
                            : "bg-yellow-500 text-white"
                        }`}>
                          {isTakeaway ? "TAKEAWAY" : "SALÓN"}
                        </span>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">
                            {formatCurrency(pedido.total)}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {pedido.productos?.length || 0} items
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Productos */}
                    <div className="bg-slate-600 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Productos:</h4>
                      <div className="space-y-2">
                        {pedido.productos?.map((producto, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-500 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                isTakeaway 
                                  ? "bg-orange-400 text-orange-900" 
                                  : "bg-yellow-400 text-yellow-900"
                              }`}>
                                {producto.cantidad}
                              </span>
                              <span className="text-white font-medium">{producto.nombre}</span>
                            </div>
                            <span className="text-slate-300 font-medium">
                              {formatCurrency(producto.precio * producto.cantidad)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información adicional */}
                    {pedido.notas && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          <strong>Notas:</strong> {pedido.notas}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistorialPedidos;
