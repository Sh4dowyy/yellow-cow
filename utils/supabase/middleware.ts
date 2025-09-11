import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();
    const sessionUser = user.data?.user || null;
    const email = sessionUser?.email?.toLowerCase() || null;
    const role = (sessionUser?.user_metadata as any)?.role?.toString()?.toLowerCase?.();
    const isFlag = Boolean((sessionUser?.user_metadata as any)?.is_admin);
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = Boolean(isFlag || role === "admin" || (email && adminEmails.includes(email)));

    // protect account page for unauthenticated users
    if (request.nextUrl.pathname.startsWith("/account") && user.error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // protect admin page for admins only
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (user.error) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // if already logged in and on login/register page, send to account
    if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") && !user.error) {
      return NextResponse.redirect(new URL("/account", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
