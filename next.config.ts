import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma · NextAuth Adapter 는 Node-only 네이티브 의존성 — Turbopack 이 매 라우트마다 재번들하면
  // 워커 메모리 압박으로 "Jest worker exceeded retry limit" 크래시가 발생.
  // 서버 외부 패키지로 지정하면 require() 로 직접 로드하여 컴파일 비용·OOM 위험 모두 제거.
  serverExternalPackages: ['@prisma/client', '@auth/prisma-adapter'],
};

export default nextConfig;
