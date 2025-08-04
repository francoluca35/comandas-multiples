"use client";
import React, { useState } from "react";

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`${
        isExpanded ? "w-64" : "w-16"
      } bg-gray-800 flex flex-col items-center py-4 space-y-6 transition-all duration-300 ease-in-out`}
    >
      {/* Hamburger Menu */}
      <div className="text-white cursor-pointer" onClick={toggleSidebar}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>

      {/* Logo and Name - Only visible when expanded */}
      {isExpanded && (
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">Comandas</span>
        </div>
      )}

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-6">
        {/* Home - Active */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } bg-gray-700 rounded-lg flex items-center justify-center ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          {isExpanded && (
            <span className="text-white ml-3 font-medium">Inicio</span>
          )}
        </div>
        {/* Mesas */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Mesa */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 8h12M6 8v8M18 8v8"
            />
            {/* Pata central de la mesa */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v8"
            />
            {/* Silla izquierda */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
            />
            {/* Silla derecha */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 10c0-1.1.9-2 2-2s2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4z"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Mesas
            </span>
          )}
        </div>
        {/* Shopping Cart */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Ventas
            </span>
          )}
        </div>

        {/* Dollar Sign */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Pagos
            </span>
          )}
        </div>

        {/* Stock/Inventory */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Stock
            </span>
          )}
        </div>

        {/* Bar Chart */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Reportes
            </span>
          )}
        </div>

        {/* Price Tag */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Productos
            </span>
          )}
        </div>

        {/* Settings */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Configuración
            </span>
          )}
        </div>

        {/* Filters */}
        <div
          className={`${
            isExpanded ? "w-full px-4" : "w-10 h-10"
          } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
            isExpanded ? "justify-start" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          {isExpanded && (
            <span className="text-gray-400 hover:text-white ml-3 font-medium">
              Filtros
            </span>
          )}
        </div>
      </div>

      {/* Logout */}
      <div
        className={`mt-auto ${
          isExpanded ? "w-full px-4" : "w-10 h-10"
        } flex items-center justify-center text-gray-400 hover:text-white cursor-pointer ${
          isExpanded ? "justify-start" : ""
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {isExpanded && (
          <span className="text-gray-400 hover:text-white ml-3 font-medium">
            Cerrar Sesión
          </span>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
