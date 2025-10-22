"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase'; 
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const TabletNetworkManager = ({ isOpen, onClose }) => {
  const [tablets, setTablets] = useState([]);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    wifiConnected: false,
    internalNetwork: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTablet, setEditingTablet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    macAddress: '',
    location: '',
    department: '',
    status: 'offline',
    lastSeen: null,
    assignedTo: '',
    wifiNetwork: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTablets();
      checkNetworkStatus();
      setupRealtimeListener();
    }
  }, [isOpen]);

  const loadTablets = async () => {
    setLoading(true);
    try {
      const restaurantId = localStorage.getItem('restauranteId');
      if (!restaurantId) {
        throw new Error('No se encontró el ID del restaurante');
      }

      const tabletsRef = collection(db, 'restaurantes', restaurantId, 'tablets');
      const snapshot = await getDocs(tabletsRef);
      const tabletsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTablets(tabletsData);
    } catch (err) {
      console.error('Error cargando tablets:', err);
      setError('Error al cargar las tablets: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    const restaurantId = localStorage.getItem('restauranteId');
    if (!restaurantId) return;

    const tabletsRef = collection(db, 'restaurantes', restaurantId, 'tablets');
    const q = query(tabletsRef, orderBy('name'));
    
    return onSnapshot(q, (snapshot) => {
      const tabletsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTablets(tabletsData);
    }, (error) => {
      console.error('Error en listener de tablets:', error);
    });
  };

  const checkNetworkStatus = () => {
    const isOnline = navigator.onLine;
    
    // Simular detección de red Wi-Fi interna
    // En un entorno real, esto se haría con APIs del navegador o servicios de red
    const wifiConnected = isOnline;
    const internalNetwork = wifiConnected; // Asumiendo que si hay internet, hay red interna

    setNetworkStatus({
      isOnline,
      wifiConnected,
      internalNetwork
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const restaurantId = localStorage.getItem('restauranteId');
      if (!restaurantId) {
        throw new Error('No se encontró el ID del restaurante');
      }

      const tabletData = {
        ...formData,
        createdAt: editingTablet ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTablet) {
        const tabletRef = doc(db, 'restaurantes', restaurantId, 'tablets', editingTablet.id);
        await updateDoc(tabletRef, tabletData);
      } else {
        await addDoc(collection(db, 'restaurantes', restaurantId, 'tablets'), tabletData);
      }

      setSuccess(editingTablet ? 'Tablet actualizada exitosamente' : 'Tablet registrada exitosamente');
      resetForm();
    } catch (err) {
      console.error('Error guardando tablet:', err);
      setError('Error al guardar la tablet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tablet) => {
    setEditingTablet(tablet);
    setFormData({
      name: tablet.name || '',
      ipAddress: tablet.ipAddress || '',
      macAddress: tablet.macAddress || '',
      location: tablet.location || '',
      department: tablet.department || '',
      status: tablet.status || 'offline',
      lastSeen: tablet.lastSeen || null,
      assignedTo: tablet.assignedTo || '',
      wifiNetwork: tablet.wifiNetwork || '',
      notes: tablet.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (tablet) => {
    if (window.confirm(`¿Estás seguro de eliminar la tablet "${tablet.name}"?`)) {
      try {
        setLoading(true);
        const restaurantId = localStorage.getItem('restauranteId');
        await deleteDoc(doc(db, 'restaurantes', restaurantId, 'tablets', tablet.id));
        setSuccess('Tablet eliminada exitosamente');
      } catch (err) {
        console.error('Error eliminando tablet:', err);
        setError('Error al eliminar la tablet: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusUpdate = async (tabletId, newStatus) => {
    try {
      setLoading(true);
      const restaurantId = localStorage.getItem('restauranteId');
      const tabletRef = doc(db, 'restaurantes', restaurantId, 'tablets', tabletId);
      await updateDoc(tabletRef, {
        status: newStatus,
        lastSeen: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSuccess(`Tablet ${newStatus === 'online' ? 'conectada' : 'desconectada'} exitosamente`);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError('Error al actualizar el estado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ipAddress: '',
      macAddress: '',
      location: '',
      department: '',
      status: 'offline',
      lastSeen: null,
      assignedTo: '',
      wifiNetwork: '',
      notes: ''
    });
    setEditingTablet(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'offline': return 'Desconectada';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const getNetworkStatusColor = () => {
    if (networkStatus.internalNetwork && networkStatus.isOnline) {
      return 'bg-green-100 text-green-800';
    } else if (networkStatus.isOnline) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getNetworkStatusText = () => {
    if (networkStatus.internalNetwork && networkStatus.isOnline) {
      return 'Red Interna Activa';
    } else if (networkStatus.isOnline) {
      return 'Solo Internet';
    } else {
      return 'Sin Conexión';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-800 font-bold text-xl">Gestión de Tablets en Red</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Network Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800">Estado de la Red</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getNetworkStatusColor()}`}>
                {getNetworkStatusText()}
              </span>
            </div>
            <button
              onClick={checkNetworkStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Verificar Red</span>
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Internet: {networkStatus.isOnline ? 'Conectado' : 'Desconectado'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${networkStatus.wifiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Wi-Fi: {networkStatus.wifiConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${networkStatus.internalNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Red Interna: {networkStatus.internalNetwork ? 'Activa' : 'Inactiva'}</span>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Tablets Registradas ({tablets.length})
          </h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Registrar Tablet</span>
          </button>
        </div>

        {/* Tablets List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tablet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Conexión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tablets.map((tablet) => (
                  <tr key={tablet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tablet.name}</div>
                          <div className="text-sm text-gray-500">{tablet.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tablet.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tablet.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tablet.assignedTo || 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tablet.status)}`}>
                        {getStatusText(tablet.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tablet.lastSeen ? new Date(tablet.lastSeen).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(tablet)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(tablet.id, tablet.status === 'online' ? 'offline' : 'online')}
                        className={`${tablet.status === 'online' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {tablet.status === 'online' ? 'Desconectar' : 'Conectar'}
                      </button>
                      <button
                        onClick={() => handleDelete(tablet)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tablets.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">No hay tablets registradas</p>
            <p className="text-sm mt-2">Registra la primera tablet para comenzar</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingTablet ? 'Editar Tablet' : 'Registrar Nueva Tablet'}
                </h3>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tablet *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Tablet Mesa 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección IP *</label>
                    <input
                      type="text"
                      name="ipAddress"
                      value={formData.ipAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 192.168.1.100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección MAC</label>
                    <input
                      type="text"
                      name="macAddress"
                      value={formData.macAddress}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: AA:BB:CC:DD:EE:FF"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Salón Principal, Mesa 5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option value="ventas">Ventas</option>
                      <option value="cocina">Cocina</option>
                      <option value="administracion">Administración</option>
                      <option value="almacen">Almacén</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del empleado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Red Wi-Fi</label>
                    <input
                      type="text"
                      name="wifiNetwork"
                      value={formData.wifiNetwork}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre de la red Wi-Fi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="offline">Desconectada</option>
                      <option value="online">En línea</option>
                      <option value="maintenance">Mantenimiento</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notas adicionales sobre la tablet"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabletNetworkManager;
