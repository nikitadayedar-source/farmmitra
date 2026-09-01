import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/admin/login";

  // 1. Get the token from the user's cookies
  const token = request.cookies.get("auth_token")?.value || "";

  // 2. If the user is trying to access a protected route without a token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }

  try {
    // 3. Verify the token
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
      await jwtVerify(token, secret);
    }
  } catch (error) {
    // 4. If token verification fails, redirect to login and delete the invalid token
    const response = NextResponse.redirect(
      new URL("/admin/login", request.nextUrl)
    );
    response.cookies.delete("auth_token");
    console.log(error);

    return response;
  }

  // 5. If the user is logged in and tries to access the login page, redirect to the dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
  }

  // 6. If everything is fine, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"], // This middleware will run on all routes under /admin/
};
