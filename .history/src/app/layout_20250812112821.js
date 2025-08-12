import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "../providers/AppProvider";
import { RestaurantProvider } from "./context/RestaurantContext";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import OfflineIndicator from "../components/OfflineIndicator";
import FirestoreIndexWarning from "../components/FirestoreIndexWarning";

export const metadata = {
  title: "Comandas Múltiples",
  description: "Sistema de gestión de comandas y restaurantes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Comandas Múltiples",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/Assets/LogoApp.png", sizes: "192x192", type: "image/png" },
      { url: "/Assets/LogoApp.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/Assets/LogoApp.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Comandas Múltiples" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Comandas Múltiples" />
        <meta
          name="description"
          content="Sistema de gestión de comandas y restaurantes"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#10b981" />

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
        <link rel="mask-icon" href="/Assets/LogoApp.png" color="#10b981" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Desinstalar Service Worker anterior
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    if (registration.active && registration.active.scriptURL.includes('workbox')) {
                      registration.unregister();
                      console.log('SW anterior desinstalado');
                    }
                  }
                });
                
                // Registrar nuevo Service Worker
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw-custom.js')
                    .then(function(registration) {
                      console.log('SW registrado: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registro falló: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AppProvider>
            <RestaurantProvider>
              <OfflineIndicator />
              {children}
              <PWAInstallPrompt />
              <FirestoreIndexWarning />
            </RestaurantProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
