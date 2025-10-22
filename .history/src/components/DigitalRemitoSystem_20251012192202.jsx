"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const DigitalRemitoSystem = ({ isOpen, onClose }) => {
  const [remitos, setRemitos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showForm, setShowForm] = useState(false);
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [formData, setFormData] = useState({
    fromBranch: '',
    toBranch: '',
    products: [],
    notes: '',
    priority: 'normal',
    requestedBy: '',
    approvedBy: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setupRealtimeListener();
    }
  }, [isOpen, activeTab]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadBranches(),
        loadProducts(),
        loadRemitos()
      ]);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
      setError('Error al cargar los datos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    const remitosRef = collection(db, 'remitos');
    const q = query(remitosRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const remitosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRemitos(remitosData);
    }, (error) => {
      console.error('Error en listener de remitos:', error);
    });
  };

  const loadBranches = async () => {
    const branchesRef = collection(db, 'branches');
    const snapshot = await getDocs(branchesRef);
    const branchesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBranches(branchesData);
  };

  const loadProducts = async () => {
    const restaurantId = localStorage.getItem('restauranteId');
    if (!restaurantId) return;

    const productsRef = collection(db, 'restaurantes', restaurantId, 'productos');
    const snapshot = await getDocs(productsRef);
    const productsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(productsData);
  };

  const loadRemitos = async () => {
    const remitosRef = collection(db, 'remitos');
    const q = query(remitosRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const remitosData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRemitos(remitosData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductAdd = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', quantity: 1, notes: '' }]
    }));
  };

  const handleProductChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const handleProductRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const remitoData = {
        fromBranch: formData.fromBranch,
        toBranch: formData.toBranch,
        products: formData.products.filter(p => p.productId && p.quantity > 0),
        notes: formData.notes,
        priority: formData.priority,
        requestedBy: formData.requestedBy,
        approvedBy: formData.approvedBy,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'remitos'), remitoData);
      
      setSuccess('Remito creado exitosamente');
      resetForm();
      await loadRemitos();
    } catch (err) {
      console.error('Error creando remito:', err);
      setError('Error al crear el remito: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (remitoId, newStatus) => {
    try {
      setIsLoading(true);
      const remitoRef = doc(db, 'remitos', remitoId);
      await updateDoc(remitoRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'approved' && { approvedAt: new Date().toISOString() }),
        ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() })
      });
      
      setSuccess(`Remito ${newStatus === 'approved' ? 'aprobado' : newStatus === 'delivered' ? 'entregado' : 'actualizado'} exitosamente`);
    } catch (err) {
      console.error('Error actualizando remito:', err);
      setError('Error al actualizar el remito: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fromBranch: '',
      toBranch: '',
      products: [],
      notes: '',
      priority: 'normal',
      requestedBy: '',
      approvedBy: ''
    });
    setSelectedRemito(null);
    setShowForm(false);
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Sucursal desconocida';
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.nombre : 'Producto desconocido';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'delivered': return 'Entregado';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'normal': return 'Normal';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const filteredRemitos = remitos.filter(remito => {
    if (activeTab === 'pending') return remito.status === 'pending';
    if (activeTab === 'approved') return remito.status === 'approved';
    if (activeTab === 'delivered') return remito.status === 'delivered';
    if (activeTab === 'all') return true;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-800 font-bold text-xl">Sistema de Remitos Digitales</span>
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {['pending', 'approved', 'delivered', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'pending' && 'Pendientes'}
              {tab === 'approved' && 'Aprobados'}
              {tab === 'delivered' && 'Entregados'}
              {tab === 'all' && 'Todos'}
            </button>
          ))}
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
            Remitos de Reposición
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
            <span>Nuevo Remito</span>
          </button>
        </div>

        {/* Remitos List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRemitos.map(remito => (
              <div key={remito.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Remito #{remito.id.slice(-8)}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(remito.status)}`}>
                        {getStatusText(remito.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(remito.priority)}`}>
                        {getPriorityText(remito.priority)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Desde:</span> {getBranchName(remito.fromBranch)}
                      </div>
                      <div>
                        <span className="font-medium">Hacia:</span> {getBranchName(remito.toBranch)}
                      </div>
                      <div>
                        <span className="font-medium">Solicitado por:</span> {remito.requestedBy}
                      </div>
                      <div>
                        <span className="font-medium">Creado:</span> {new Date(remito.createdAt).toLocaleDateString()}
                      </div>
                      {remito.approvedBy && (
                        <div>
                          <span className="font-medium">Aprobado por:</span> {remito.approvedBy}
                        </div>
                      )}
                      {remito.approvedAt && (
                        <div>
                          <span className="font-medium">Aprobado:</span> {new Date(remito.approvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {remito.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(remito.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(remito.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {remito.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(remito.id, 'delivered')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Marcar Entregado
                      </button>
                    )}
                  </div>
                </div>

                {/* Products List */}
                <div className="mt-3">
                  <h4 className="font-medium text-gray-800 mb-2">Productos solicitados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {remito.products.map((product, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm">
                        <div className="font-medium">{getProductName(product.productId)}</div>
                        <div className="text-gray-600">Cantidad: {product.quantity}</div>
                        {product.notes && (
                          <div className="text-gray-500 text-xs">Notas: {product.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {remito.notes && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Notas:</span> {remito.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredRemitos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No hay remitos en esta categoría</p>
                <p className="text-sm mt-2">Crea un nuevo remito para comenzar</p>
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Nuevo Remito de Reposición</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal Origen *</label>
                    <select
                      name="fromBranch"
                      value={formData.fromBranch}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar sucursal</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal Destino *</label>
                    <select
                      name="toBranch"
                      value={formData.toBranch}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar sucursal</option>
                      {branches.filter(branch => branch.id !== formData.fromBranch).map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Solicitado por *</label>
                    <input
                      type="text"
                      name="requestedBy"
                      value={formData.requestedBy}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del solicitante"
                    />
                  </div>
                </div>

                {/* Products Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Productos *</label>
                    <button
                      type="button"
                      onClick={handleProductAdd}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Agregar Producto</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.products.map((product, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
                            <select
                              value={product.productId}
                              onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Seleccionar producto</option>
                              {products.map(prod => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.nombre}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                              required
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleProductRemove(index)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Notas (opcional)</label>
                          <input
                            type="text"
                            value={product.notes}
                            onChange={(e) => handleProductChange(index, 'notes', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notas específicas del producto"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas generales</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Notas adicionales sobre el remito"
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
                    disabled={isLoading || formData.products.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Crear Remito</span>
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

export default DigitalRemitoSystem;
