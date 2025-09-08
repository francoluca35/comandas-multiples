import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../providers/AppProvider";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineIndicator from "../components/OfflineIndicator";
import { AutoRedirect } from "../components/AutoRedirect";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Comandas App v2.0 - Sistema de Gestión Ultra Rápido",
  description:
    "Sistema de gestión de restaurantes con PWA offline-first, cache inteligente y performance optimizada",
  keywords: "restaurante, comandas, gestión, PWA, offline, cache",
  authors: [{ name: "Comandas Team" }],
  creator: "Comandas App",
  publisher: "Comandas App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Comandas App v2.0",
    description: "Sistema de gestión de restaurantes ultra rápido",
    url: "/",
    siteName: "Comandas App",
    images: [
      {
        url: "/Assets/logo-d.png",
        width: 1200,
        height: 630,
        alt: "Comandas App v2.0",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comandas App v2.0",
    description: "Sistema de gestión de restaurantes ultra rápido",
    images: ["/Assets/LogoApp.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

// Registrar Service Worker
if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("🚀 Service Worker registrado:", registration);

          // Verificar actualizaciones
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("🔄 Nueva versión disponible");
                // Mostrar notificación de actualización
                if (
                  confirm(
                    "Hay una nueva versión disponible. ¿Quieres actualizar?"
                  )
                ) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error("❌ Error registrando Service Worker:", error);
        });
    });
  }

  // Solicitar permisos de notificación
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Comandas App" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/Assets/LogoApp.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/Assets/LogoApp.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/Assets/LogoApp.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload críticos */}
        <link rel="preload" href="/Assets/LogoApp.png" as="image" />
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />
        <link rel="dns-prefetch" href="//firebase.googleapis.com" />
      </head>
      <body className={`${inter.className} h-full bg-slate-900`}>
        <AppProvider>
          <div className="relative min-h-full">
            {children}

            {/* Componentes PWA */}
            <PWAInstallPrompt />
            <OfflineIndicator />
            <AutoRedirect />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
