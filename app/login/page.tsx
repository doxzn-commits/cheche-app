// SCR-003 로그인 — Suspense 래퍼 (useSearchParams prerender 요구사항 충족)
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
