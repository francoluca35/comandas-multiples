"use client";
import React, { useEffect, useState } from "react";
import { useRestaurantUsers } from "@/hooks/useRestaurantUsers";

const UserManagement = () => {
  const {
    usuarios,
    loading,
    error,
    obtenerUsuarios,
    actualizarUsuario,
    eliminarUsuario,
  } = useRestaurantUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ usuario: "", password: "", rol: "usuario", activo: true, online: false, imagen: "" });

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      usuario: user.usuario || "",
      password: user.password || "",
      rol: user.rol || "usuario",
      activo: user.activo !== false,
      online: user.online === true,
      imagen: user.imagen || "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    await actualizarUsuario(editingUser.id, formData);
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDelete = async (user) => {
    if (confirm(`¿Eliminar usuario "${user.usuario}"?`)) {
      await eliminarUsuario(user.id);
    }
  };

  return (
    <div className="text-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <button
          onClick={() => {
            setEditingUser({ id: formData.usuario });
            setFormData({ usuario: "", password: "", rol: "usuario", activo: true, online: false, imagen: "" });
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
        >
          Crear Usuario
        </button>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Usuario</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Rol</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Conexión</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(usuarios || []).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-sm font-medium">{u.usuario}</td>
                <td className="px-4 py-2 text-sm capitalize">{u.rol || "usuario"}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${u.activo !== false ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {u.activo !== false ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${u.online ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {u.online ? "Conectado" : "Desconectado"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm space-x-3">
                  <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-800">Editar</button>
                  <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
            {(!usuarios || usuarios.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500 text-sm" colSpan={5}>No hay usuarios registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">{editingUser && editingUser.id ? "Editar Usuario" : "Nuevo Usuario"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                <input name="usuario" value={formData.usuario} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select name="rol" value={formData.rol} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                    <option value="admin">admin</option>
                    <option value="usuario">usuario</option>
                    <option value="mesero">mesero</option>
                    <option value="cocina">cocina</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3 mt-6">
                  <label className="text-sm text-slate-700">Activo</label>
                  <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
                  <label className="text-sm text-slate-700 ml-4">Conectado</label>
                  <input type="checkbox" name="online" checked={formData.online} onChange={handleChange} />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-lg py-2">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
