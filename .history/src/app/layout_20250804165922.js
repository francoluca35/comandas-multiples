import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "../providers/AppProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
