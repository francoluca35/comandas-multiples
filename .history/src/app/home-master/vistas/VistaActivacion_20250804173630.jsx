"use client";
import React, { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRestaurant } from "../../../hooks/useMasterAPI";
import { schemas } from "../../../schemas/validation";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { useUI } from "../../../store";

// Componente de input optimizado
const FormInput = React.memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    error,
    register,
    required = false,
    min,
    max,
    step,
    ...props
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`
        w-full px-3 py-2 bg-slate-800/50 border rounded-lg
        text-slate-100 placeholder-slate-400 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        transition-all duration-200
        ${
          error
            ? "border-red-500/50 focus:ring-red-500/50"
            : "border-slate-600/50 hover:border-slate-500/50"
        }
      `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error.message}</span>
        </p>
      )}
    </div>
  )
);

// Componente de checkbox optimizado
const FormCheckbox = React.memo(
  ({ label, name, checked, onChange, description }) => (
    <div className="flex items-start space-x-2">
      <input
        type="checkbox"
        id={name}
        checked={checked}
        onChange={onChange}
        className="
        w-4 h-4 mt-0.5 rounded border-slate-600/50
        bg-slate-800/50 text-blue-500
        focus:ring-2 focus:ring-blue-500/50
        transition-all duration-200
      "
      />
      <div className="flex-1">
        <label
          htmlFor={name}
          className="text-sm font-semibold text-slate-200 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
);

// Componente de botón optimizado
const Button = React.memo(
  ({
    children,
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    onClick,
    className = "",
    ...props
  }) => {
    const baseClasses = `
      inline-flex items-center justify-center px-3 py-2
      text-sm font-semibold rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-700
        text-white hover:from-blue-700 hover:to-blue-800
        focus:ring-blue-500 shadow-lg shadow-blue-500/25
      `,
      secondary: `
        bg-slate-700/50 text-slate-200
        hover:bg-slate-600/50 border border-slate-600/50
        focus:ring-slate-500
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-red-700
        text-white hover:from-red-700 hover:to-red-800
        focus:ring-red-500 shadow-lg shadow-red-500/25
      `,
    };

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Procesando...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

export default function VistaActivacion() {
  const { closeModal } = useUI();
  const { handleError, clearError } = useErrorHandler();
  const createRestaurantMutation = useCreateRestaurant();

  // Configuración del formulario con React Hook Form y Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schemas.restaurant),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      codigoActivacion: "",
      cantidadUsuarios: 1,
      conFinanzas: false,
      password: "",
      logo: "",
    },
  });

  // Observar cambios en el formulario para validación en tiempo real
  const watchedValues = watch();

  // Validar formulario en tiempo real
  const isFormValid = useMemo(() => {
    return isValid && Object.keys(errors).length === 0;
  }, [isValid, errors]);

  // Manejar envío del formulario
  const onSubmit = useCallback(
    async (data) => {
      try {
        clearError("restaurant-form");

        await createRestaurantMutation.mutateAsync(data);

        // Resetear formulario después del éxito
        reset();

        // Cerrar modal si está abierto
        closeModal();
      } catch (error) {
        handleError(error, "restaurant-form", {
          showToast: true,
          duration: 8000,
        });
      }
    },
    [createRestaurantMutation, reset, closeModal, clearError, handleError]
  );

  // Manejar cancelar
  const handleCancel = useCallback(() => {
    reset();
    closeModal();
  }, [reset, closeModal]);

  // Generar código de activación automático
  const generateActivationCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setValue("codigoActivacion", code);
  }, [setValue]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Activar Restaurante
        </h2>
        <p className="text-slate-400 mt-1 text-sm">
          Registra un nuevo restaurante en el sistema
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
          {/* Información básica */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Información del Restaurante</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="Nombre del Restaurante"
                name="nombre"
                placeholder="Ej: La Parrilla del Sur"
                error={errors.nombre}
                register={register}
                required
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                placeholder="restaurante@ejemplo.com"
                error={errors.email}
                register={register}
                required
              />

              <FormInput
                label="Teléfono"
                name="telefono"
                type="tel"
                placeholder="+54 11 1234-5678"
                error={errors.telefono}
                register={register}
                required
              />

              <FormInput
                label="Dirección"
                name="direccion"
                placeholder="Av. Corrientes 1234, CABA"
                error={errors.direccion}
                register={register}
                required
              />
            </div>
          </div>

          {/* Configuración */}
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-200 mb-3 flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-green-400"
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
              <span>Configuración</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  Cantidad de Usuarios
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  {...register("cantidadUsuarios", { valueAsNumber: true })}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-sm"
                />
                {errors.cantidadUsuarios && (
                  <p className="text-xs text-red-400">
                    {errors.cantidadUsuarios.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  Código de Activación
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    {...register("codigoActivacion")}
                    placeholder="ABC123"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateActivationCode}
                    className="px-3"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </Button>
                </div>
                {errors.codigoActivacion && (
                  <p className="text-xs text-red-400">
                    {errors.codigoActivacion.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <FormInput
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Ingresa la contraseña"
                error={errors.password}
                register={register}
                required
              />

              <FormInput
                label="Logo (URL)"
                name="logo"
                type="url"
                placeholder="https://ejemplo.com/logo.png"
                error={errors.logo}
                register={register}
              />
            </div>

            <div className="mt-4">
              <FormCheckbox
                label="Con Finanzas"
                name="conFinanzas"
                checked={watchedValues.conFinanzas}
                onChange={(e) => setValue("conFinanzas", e.target.checked)}
                description="Habilita el módulo de finanzas para este restaurante"
              />
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-xs font-semibold text-blue-400 mb-1">
                Información Importante
              </h4>
              <ul className="text-xs text-slate-400 space-y-0.5">
                <li>• El código de activación debe ser único</li>
                <li>• Se enviará un email de confirmación al restaurante</li>
                <li>• El módulo de finanzas se puede habilitar después</li>
                <li>
                  • Los usuarios podrán registrarse usando el código de
                  activación
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end ">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!isFormValid || isSubmitting}
            className="w-full sm:w-auto"
          >
            Registrar Restaurante
          </Button>
        </div>
      </form>
    </div>
  );
}
