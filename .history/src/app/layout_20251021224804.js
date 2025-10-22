import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../providers/AppProvider";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineIndicator from "../components/OfflineIndicator";
import { AutoRedirect } from "../components/AutoRedirect";
import DOMErrorBoundary from "../components/DOMErrorBoundary";
import { configureDOMErrorHandler } from "../utils/domErrorHandler";
import { initializeAggressiveProtection } from "../utils/aggressiveDOMProtection";

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
    images: ["/Assets/logo-d.png"],
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

// Registrar Service Worker y configurar handlers
if (typeof window !== "undefined") {
  // Configurar el handler de errores DOM
  configureDOMErrorHandler();
  
  // Configurar protección agresiva contra errores DOM
  initializeAggressiveProtection();

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

        <link rel="apple-touch-icon" href="/Assets/logo-d.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/Assets/logo-d.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/Assets/logo-d.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload críticos */}
        <link rel="preload" href="/Assets/logo-d.png" as="image" />
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />
        <link rel="dns-prefetch" href="//firebase.googleapis.com" />
        
        {/* Protección inmediata contra errores DOM */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              'use strict';
              if (typeof window === 'undefined') return;
              
              console.log('🛡️ Initializing Immediate DOM Protection...');
              
              const originalRemoveChild = Node.prototype.removeChild;
              Node.prototype.removeChild = function(child) {
                try {
                  if (!child) {
                    console.warn('🛡️ DOM Protection: removeChild called with null/undefined child');
                    return child;
                  }
                  if (child.parentNode !== this) {
                    console.warn('🛡️ DOM Protection: removeChild prevented - child is not a child of this node');
                    return child;
                  }
                  return originalRemoveChild.call(this, child);
                } catch (error) {
                  console.warn('🛡️ DOM Protection: removeChild error caught and handled:', error.message);
                  return child;
                }
              };
              
              const originalAppendChild = Node.prototype.appendChild;
              Node.prototype.appendChild = function(child) {
                try {
                  if (!child) {
                    console.warn('🛡️ DOM Protection: appendChild called with null/undefined child');
                    return child;
                  }
                  return originalAppendChild.call(this, child);
                } catch (error) {
                  console.warn('🛡️ DOM Protection: appendChild error caught and handled:', error.message);
                  return child;
                }
              };
              
              const originalInsertBefore = Node.prototype.insertBefore;
              Node.prototype.insertBefore = function(newNode, referenceNode) {
                try {
                  if (!newNode) {
                    console.warn('🛡️ DOM Protection: insertBefore called with null/undefined newNode');
                    return newNode;
                  }
                  return originalInsertBefore.call(this, newNode, referenceNode);
                } catch (error) {
                  console.warn('🛡️ DOM Protection: insertBefore error caught and handled:', error.message);
                  return newNode;
                }
              };
              
              const originalReplaceChild = Node.prototype.replaceChild;
              Node.prototype.replaceChild = function(newChild, oldChild) {
                try {
                  if (!newChild || !oldChild) {
                    console.warn('🛡️ DOM Protection: replaceChild called with null/undefined child');
                    return oldChild;
                  }
                  if (oldChild.parentNode !== this) {
                    console.warn('🛡️ DOM Protection: replaceChild prevented - oldChild is not a child of this node');
                    return oldChild;
                  }
                  return originalReplaceChild.call(this, newChild, oldChild);
                } catch (error) {
                  console.warn('🛡️ DOM Protection: replaceChild error caught and handled:', error.message);
                  return oldChild;
                }
              };
              
              window.onerror = function(message, source, lineno, colno, error) {
                if (typeof message === 'string' && 
                    (message.includes('removeChild') || 
                     message.includes('NotFoundError') ||
                     message.includes('Failed to execute') ||
                     message.includes('The node to be removed is not a child'))) {
                  console.warn('🛡️ Global Error intercepted and prevented:', message);
                  return true;
                }
                return false;
              };
              
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && 
                    (event.reason.message.includes('removeChild') ||
                     event.reason.message.includes('NotFoundError'))) {
                  console.warn('🛡️ Promise Rejection intercepted and prevented:', event.reason);
                  event.preventDefault();
                }
              });
              
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args[0];
                if (typeof message === 'string' && 
                    (message.includes('removeChild') || 
                     message.includes('NotFoundError') ||
                     message.includes('Failed to execute') ||
                     message.includes('The node to be removed is not a child'))) {
                  console.warn('🛡️ Console Error intercepted and prevented:', ...args);
                  return;
                }
                originalConsoleError.apply(console, args);
              };
              
              console.log('🛡️ Immediate DOM Protection activated successfully');
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} h-full bg-slate-900`}>
        <DOMErrorBoundary>
          <AppProvider>
            <div className="relative min-h-full">
              {children}

              {/* Componentes PWA */}
              <PWAInstallPrompt />
              <OfflineIndicator />
              <AutoRedirect />
            </div>
          </AppProvider>
        </DOMErrorBoundary>
      </body>
    </html>
  );
}
