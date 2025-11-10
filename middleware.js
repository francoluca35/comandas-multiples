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
    // Permitir acceso a login y register sin verificación
    if (pathname === "/home-comandas/login" || pathname === "/home-comandas/register") {
      return NextResponse.next();
    }

    // Verificar si el usuario está autenticado para el sistema de restaurantes
    // O si está en modo prueba (verificado por TrialGuard en el cliente)
    const restauranteId = request.cookies.get("restauranteId")?.value;
    const usuario = request.cookies.get("usuario")?.value;
    const isTrialMode = request.cookies.get("isTrialMode")?.value === "true";

    // Permitir acceso si está en modo prueba o si tiene credenciales
    if (isTrialMode || (restauranteId && usuario)) {
      return NextResponse.next();
    }

    // Redirigir al login si no hay datos de autenticación ni modo prueba
    return NextResponse.redirect(
      new URL("/home-comandas/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home-comandas/:path*", "/api/:path*"],
};
