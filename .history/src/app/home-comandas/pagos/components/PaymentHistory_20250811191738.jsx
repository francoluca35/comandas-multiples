import React, { useState, useEffect } from "react";
import { usePaymentProcessor } from "../../../../hooks/usePaymentProcessor";
import { useRestaurant } from "../../../context/RestaurantContext";
import { useAuth } from "../../../context/AuthContext";

const PaymentHistory = ({ onToggle, isExpanded }) => {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const { getPaymentHistory } = usePaymentProcessor();
  const { restaurant } = useRestaurant();
  const { user } = useAuth();

  const restaurantId = restaurant?.id || user?.restaurantId;

  useEffect(() => {
    if (restaurantId) {
      loadPaymentHistory();
    }
  }, [restaurantId, selectedPeriod]);

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const historyData = await getPaymentHistory(restaurantId);
      if (historyData && historyData.payments) {
        setPayments(historyData.payments);
        setStatistics(historyData.statistics);
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div>
          <h2 className="text-xl font-semibold text-white">Historial de Pagos</h2>
          <p className="text-slate-400 text-sm mt-1">
            Registro de transacciones con tarjeta de crédito
          </p>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total de Pagos
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.totalPayments}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Pagos Aprobados
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {statistics.approvedPayments}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Monto Total</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(statistics.totalAmount)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Tasa de Aprobación
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {statistics.approvalRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de Pagos
        </h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">Todos los pagos</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payments.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No hay pagos registrados
            </li>
          ) : (
            payments.map((payment) => (
              <li key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {payment.paymentMethod?.charAt(0)?.toUpperCase() ||
                            "P"}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Pago #{payment.paymentId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payment.date)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Ref: {payment.externalReference}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {payment.platformFee && (
                        <div className="text-xs text-gray-500">
                          Comisión: {formatCurrency(payment.platformFee)}
                        </div>
                      )}
                      {payment.restaurantAmount && (
                        <div className="text-xs text-green-600">
                          Neto: {formatCurrency(payment.restaurantAmount)}
                        </div>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Información adicional */}
      {statistics && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Resumen Financiero
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total de comisiones:</span>
              <span className="ml-2 font-medium text-red-600">
                {formatCurrency(statistics.totalPlatformFees)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">
                Total recibido por restaurante:
              </span>
              <span className="ml-2 font-medium text-green-600">
                {formatCurrency(statistics.totalRestaurantAmount)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Comisión promedio:</span>
              <span className="ml-2 font-medium text-gray-900">
                {statistics.totalAmount > 0
                  ? (
                      (statistics.totalPlatformFees / statistics.totalAmount) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
