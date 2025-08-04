import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "../providers/AppProvider";
import { RestaurantProvider } from "./context/RestaurantContext";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AppProvider>
            <RestaurantProvider>
              {children}
            </RestaurantProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
