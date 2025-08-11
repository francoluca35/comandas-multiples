import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "../providers/AppProvider";
import { RestaurantProvider } from "./context/RestaurantContext";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

export const metadata = {
  title: "Comandas Múltiples",
  description: "Sistema de gestión de comandas y restaurantes",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="application-name" content="Comandas Múltiples" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Comandas Múltiples" />
        <meta name="description" content="Sistema de gestión de comandas y restaurantes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#10b981" />

        <link rel="apple-touch-icon" href="/Assets/LogoApp.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Assets/LogoApp.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Assets/LogoApp.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/Assets/LogoApp.png" color="#10b981" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <AppProvider>
            <RestaurantProvider>
              {children}
              <PWAInstallPrompt />
            </RestaurantProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
