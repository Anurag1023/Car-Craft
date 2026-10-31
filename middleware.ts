import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const userRole = token?.role as Role | undefined;

    if (!userRole) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role checks
    if (pathname.startsWith("/admin") && userRole !== Role.ADMIN) {
      return NextResponse.redirect(new URL(getHomeForRole(userRole), req.url));
    }

    if (pathname.startsWith("/dealer") && userRole !== Role.DEALER && userRole !== Role.ADMIN) {
      return NextResponse.redirect(new URL(getHomeForRole(userRole), req.url));
    }

    if (pathname.startsWith("/service-manager") && userRole !== Role.SERVICE_MANAGER && userRole !== Role.ADMIN) {
      return NextResponse.redirect(new URL(getHomeForRole(userRole), req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Public routes require no token
        const isProtected =
          pathname.startsWith("/admin") ||
          pathname.startsWith("/dealer") ||
          pathname.startsWith("/customer") ||
          pathname.startsWith("/service-manager") ||
          pathname.startsWith("/checkout");

        if (!isProtected) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

function getHomeForRole(role?: Role): string {
  switch (role) {
    case Role.ADMIN:
      return "/admin";
    case Role.DEALER:
      return "/dealer";
    case Role.SERVICE_MANAGER:
      return "/service-manager";
    case Role.CUSTOMER:
    default:
      return "/customer";
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dealer/:path*",
    "/service-manager/:path*",
    "/customer/:path*",
    "/checkout/:path*",
  ],
};
