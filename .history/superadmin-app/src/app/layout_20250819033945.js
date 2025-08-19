import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { QueryProvider } from "../providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Superadmin Comandas - Panel de Administración",
  description: "Panel de administración para supervisar restaurantes y gestionar el sistema de comandas",
  keywords: "superadmin, comandas, administración, restaurantes, gestión",
  authors: [{ name: "Comandas Team" }],
  creator: "Comandas App",
  publisher: "Comandas App",
};

// Configuración de toast notifications
const toastConfig = {
  duration: 5000,
  position: "top-right",
  style: {
    background: "#1f2937",
    color: "#f9fafb",
    border: "1px solid #374151",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  success: {
    iconTheme: {
      primary: "#10b981",
      secondary: "#f9fafb",
    },
    style: {
      background: "#064e3b",
      color: "#f9fafb",
      border: "1px solid #065f46",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#f9fafb",
    },
    style: {
      background: "#7f1d1d",
      color: "#f9fafb",
      border: "1px solid #991b1b",
    },
  },
  loading: {
    iconTheme: {
      primary: "#3b82f6",
      secondary: "#f9fafb",
    },
    style: {
      background: "#1e3a8a",
      color: "#f9fafb",
      border: "1px solid #1e40af",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster {...toastConfig} />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
