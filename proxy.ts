import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Next.js 16 — middleware.ts 가 deprecated 되어 proxy.ts 로 통일.
// 공개 경로: 매처에서 제외한 경로들 (/login, /onboarding, /splash, /api/auth/*)
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // 로그인 상태로 /login* 접근 → 캘린더로
  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/calendar', nextUrl));
  }

  // 미인증 상태 → /login?callbackUrl=...
  // 매처가 이미 공개 경로를 제외하므로 이 지점까지 오면 전부 보호 대상.
  if (!isLoggedIn) {
    const url = new URL('/login', nextUrl);
    url.searchParams.set('callbackUrl', pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// 매처: api/auth, 로그인·온보딩·스플래시, Next 정적 리소스, favicon, 확장자 붙은 모든 파일 제외.
// 결과적으로 /, /calendar, /mypage, /explore 등 앱 화면 전체가 보호됨.
export const config = {
  matcher: [
    '/((?!api/auth|login|onboarding|splash|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
