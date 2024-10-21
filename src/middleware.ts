import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { JWT } from "./config/config";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
	if (PUBLIC_FILE.test(req.nextUrl.pathname)) {
		return NextResponse.next();
	}

	const token = await getToken({ req, secret: JWT.secret });

	if (!token && req.nextUrl.pathname !== "/login" && req.nextUrl.pathname !== "/signup") {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|public).*)",
	],
};
