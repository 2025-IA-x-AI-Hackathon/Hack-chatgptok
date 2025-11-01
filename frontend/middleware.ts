import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요없는 공개 경로
const publicPaths = ["/login", "/signup"];

// 인증된 사용자가 접근하면 안되는 경로 (이미 로그인한 경우)
const authPaths = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일과 API 라우트는 미들웨어를 건너뜀
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const accessToken = request.cookies.get("accessToken")?.value;

  // 로그인/회원가입 페이지인 경우
  if (authPaths.includes(pathname)) {
    // 이미 로그인된 사용자는 홈으로 리다이렉트
    if (accessToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }
  
  // 공개 경로가 아닌 경우 토큰 확인
  if (!publicPaths.includes(pathname)) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
