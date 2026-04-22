'use client';
// useSession() 을 트리 전체에서 쓰기 위한 client-only 래퍼.
import { SessionProvider } from 'next-auth/react';

export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
