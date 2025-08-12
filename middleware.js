import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Evitar redirecciones infinitas en las APIs
  if (pathname.startsWith("/api/")) {
    // Permitir que las APIs funcionen normalmente
    return NextResponse.next();
  }

  // Manejar redirecciones para rutas protegidas
  if (pathname.startsWith("/home-comandas/")) {
    // Verificar si el usuario está autenticado para el sistema de restaurantes
    const restauranteId = request.cookies.get("restauranteId")?.value;
    const usuario = request.cookies.get("usuario")?.value;

    if (!restauranteId || !usuario) {
      // Redirigir al login si no hay datos de autenticación
      return NextResponse.redirect(
        new URL("/home-comandas/login", request.url)
      );
    }
  }

  if (pathname.startsWith("/home-master/")) {
    // Para el sistema master, verificar Firebase Auth
    // Esto se maneja en el cliente
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home-comandas/:path*", "/home-master/:path*", "/api/:path*"],
};
