"use client";
import {
  FaEdit,
  FaTrash,
  FaStar,
  FaWineBottle,
  FaCarrot,
} from "react-icons/fa";
import CloudinaryImage from "../../../../components/CloudinaryImage";

export default function ProductoCard({
  producto,
  onEdit,
  onDelete,
  onToggleFavorite,
  tipoProducto, // "bebida" o "materiaPrima"
}) {
  const getStockColor = (stock) => {
    if (stock === 0) return "text-red-500";
    if (stock >= 1 && stock <= 4) return "text-orange-500";
    return "text-green-500";
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "Sin stock";
    if (stock >= 1 && stock <= 4) return "Stock bajo";
    return "En stock";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const getTipoIcon = () => {
    if (tipoProducto === "bebida") {
      return <FaWineBottle className="w-4 h-4 text-blue-400" />;
    } else {
      return <FaCarrot className="w-4 h-4 text-green-400" />;
    }
  };

  const getTipoLabel = () => {
    if (tipoProducto === "bebida") {
      return "🥤 Bebida";
    } else {
      return "🥕 Materia Prima";
    }
  };

  const getTipoColor = () => {
    if (tipoProducto === "bebida") {
      return "bg-blue-500/20 text-blue-400";
    } else {
      return "bg-green-500/20 text-green-400";
    }
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
            <div className="flex items-center gap-2">
              {getTipoIcon()}
              <h3 className="font-semibold text-white text-sm truncate">
                {producto.nombre}
              </h3>
            </div>
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
            onClick={() => onDelete(producto)}
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
                  : producto.stock >= 1 && producto.stock <= 4
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {getStockStatus(producto.stock)}
            </span>
          </div>
        </div>

        {/* Precio de Compra */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Precio de Compra:</span>
          <span className="font-semibold text-orange-400 text-sm">
            {formatPrice(producto.costo)}
          </span>
        </div>

        {/* Precio de Venta */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Precio de Venta:</span>
          <span className="font-semibold text-green-400 text-sm">
            {formatPrice(producto.precio)}
          </span>
        </div>

        {/* Valor en Stock */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Valor en Stock:</span>
          <span className="font-semibold text-blue-400 text-sm">
            {formatPrice(producto.stock * producto.precio)}
          </span>
        </div>

        {/* Costo Total */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Costo Total:</span>
          <span className="font-semibold text-orange-400 text-sm">
            {formatPrice(producto.stock * producto.costo)}
          </span>
        </div>

        {/* Ganancia Total */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <span className="text-slate-400 text-xs">Ganancia Total:</span>
          <span
            className={`font-semibold text-sm ${
              producto.stock * producto.precio > producto.stock * producto.costo
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {formatPrice(
              producto.stock * producto.precio - producto.stock * producto.costo
            )}
          </span>
        </div>
      </div>

      {/* Tags de tipo y categoría */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full ${getTipoColor()}`}
        >
          {getTipoLabel()}
        </span>

        {/* Subcategoría para bebidas */}
        {tipoProducto === "bebida" && producto.subcategoria && (
          <span
            className={`inline-block px-2 py-1 text-xs rounded-full ${
              producto.subcategoria === "con alcohol"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {producto.subcategoria === "con alcohol"
              ? "🍺 Con Alcohol"
              : "🥤 Sin Alcohol"}
          </span>
        )}

        {/* Categoría */}
        <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
          {producto.categoria}
        </span>
      </div>
    </div>
  );
}
