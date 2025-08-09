"use client";
import { FaEdit, FaTrash, FaStar } from "react-icons/fa";
import CloudinaryImage from "../../../../components/CloudinaryImage";

export default function ProductoCard({
  producto,
  onEdit,
  onDelete,
  onToggleFavorite,
}) {
  const getStockColor = (stock) => {
    if (stock === 0) return "text-red-500";
    if (stock < 10) return "text-orange-500";
    return "text-green-500";
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "Sin stock";
    if (stock < 10) return "Stock bajo";
    return "En stock";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all duration-300 group">
      {/* Header con imagen y acciones */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Imagen del producto */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700/50 flex items-center justify-center">
            {producto.imagen ? (
              <CloudinaryImage
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {producto.nombre.charAt(0).toUpperCase()}
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                {producto.nombre.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Información básica */}
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm truncate">
              {producto.nombre}
            </h3>
            <p className="text-slate-400 text-xs">{producto.categoria}</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleFavorite?.(producto.id)}
            className="p-1.5 text-slate-400 hover:text-yellow-500 transition-colors"
            title="Favorito"
          >
            <FaStar className="w-3 h-3" />
          </button>
          <button
            onClick={() => onEdit(producto)}
            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
            title="Editar"
          >
            <FaEdit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(producto.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="space-y-3">
        {/* Stock */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Stock:</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-sm ${getStockColor(
                producto.stock
              )}`}
            >
              {producto.stock}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                producto.stock === 0
                  ? "bg-red-500/20 text-red-400"
                  : producto.stock < 10
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {getStockStatus(producto.stock)}
            </span>
          </div>
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Precio:</span>
          <span className="font-semibold text-green-400 text-sm">
            {formatPrice(producto.precio)}
          </span>
        </div>

        {/* Costo */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Costo:</span>
          <span className="font-semibold text-orange-400 text-sm">
            {formatPrice(producto.costo)}
          </span>
        </div>

        {/* Ganancia */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <span className="text-slate-400 text-xs">Ganancia:</span>
          <span
            className={`font-semibold text-sm ${
              producto.precio > producto.costo
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {formatPrice(producto.precio - producto.costo)}
          </span>
        </div>
      </div>

             {/* Tags de tipo y categoría */}
       <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
         <span className={`inline-block px-2 py-1 text-xs rounded-full ${
           producto.tipo === "bebida" 
             ? "bg-blue-500/20 text-blue-400" 
             : "bg-green-500/20 text-green-400"
         }`}>
           {producto.tipo === "bebida" ? "🥤 Bebida" : "🍽️ Alimento"}
         </span>
         <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
           {producto.categoria}
         </span>
         {producto.tipo === "bebida" && producto.subcategoria && (
           <span className={`inline-block px-2 py-1 text-xs rounded-full ${
             producto.subcategoria === "con alcohol" 
               ? "bg-orange-500/20 text-orange-400" 
               : "bg-green-500/20 text-green-400"
           }`}>
             {producto.subcategoria === "con alcohol" ? "🍺 Con Alcohol" : "🥤 Sin Alcohol"}
           </span>
         )}
       </div>
    </div>
  );
}
