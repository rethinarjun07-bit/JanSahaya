import { NextResponse, type NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "jansamadhan-super-secret-jwt-key-sih-2024-gov-jharkhand-change-in-prod";

// ---------------------------------------------------------------------------
// Edge-compatible HMAC-SHA256 JWT verification
// ---------------------------------------------------------------------------
async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Import the secret key for HMAC-SHA256
    const keyData = new TextEncoder().encode(JWT_SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Reconstruct the signed data
    const signedData = new TextEncoder().encode(`${header}.${payload}`);
    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, signedData);
    if (!valid) return null;

    // Decode and validate expiry
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route access rules: path prefix → required roles
// ---------------------------------------------------------------------------
const PROTECTED_PAGE_ROUTES: Array<{ prefix: string; roles: string[]; label: string }> = [
  { prefix: "/admin",            roles: ["ADMIN"],                          label: "ADMIN" },
  { prefix: "/solver/dashboard", roles: ["SOLVER", "ADMIN"],                label: "SOLVER" },
  { prefix: "/solver/profile",   roles: ["SOLVER", "ADMIN"],                label: "SOLVER" },
  { prefix: "/industry",         roles: ["INDUSTRY", "ADMIN"],              label: "INDUSTRY" },
];

// Routes that require any authenticated session (any role)
const AUTH_REQUIRED_ROUTES = ["/challenges/new"];

// ---------------------------------------------------------------------------
// Helper: extract token from cookie or Authorization header
// ---------------------------------------------------------------------------
function extractToken(request: NextRequest): string | null {
  return (
    request.cookies.get("jansahaya_token")?.value ||
    request.cookies.get("jansamadhan_token")?.value ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    null
  );
}

// ---------------------------------------------------------------------------
// Main Middleware
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Redirect /analytics/report to /analytics ─────────────────────────
  if (pathname.startsWith("/analytics/report")) {
    return NextResponse.redirect(new URL("/analytics", request.url));
  }

  // ── 2. Protect Admin API routes (/api/admin/*) ───────────────────────────
  if (pathname.startsWith("/api/admin")) {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized: Government Authority authentication token required.",
          code: "AUTH_TOKEN_MISSING",
        },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired authentication token.", code: "TOKEN_INVALID" },
        { status: 401 }
      );
    }

    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Authorized Government Authority (ADMIN) role required.",
          code: "INSUFFICIENT_PRIVILEGES",
          currentRole: payload.role,
          requiredRole: "ADMIN",
        },
        { status: 403 }
      );
    }
  }

  // ── 3. Protect page routes based on role ─────────────────────────────────
  const matchedRoute = PROTECTED_PAGE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (matchedRoute) {
    const token = extractToken(request);

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("required", matchedRoute.label);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      // Token is invalid/expired — clear cookies and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("required", matchedRoute.label);
      loginUrl.searchParams.set("expired", "1");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("jansahaya_token");
      res.cookies.delete("jansamadhan_token");
      return res;
    }

    const userRole = payload.role as string;
    if (!matchedRoute.roles.includes(userRole)) {
      // User is logged in but doesn't have the required role
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("required", matchedRoute.label);
      loginUrl.searchParams.set("unauthorized", "1");
      loginUrl.searchParams.set("currentRole", userRole);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 4. Auth-required routes (any authenticated user) ─────────────────────
  const needsAuth = AUTH_REQUIRED_ROUTES.some((r) => pathname.startsWith(r));
  if (needsAuth) {
    const token = extractToken(request);
    if (!token || !(await verifyJWT(token))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 5. Apply rigorous security headers to all responses ──────────────────
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=(self)"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
