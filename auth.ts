import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import { prisma } from '@/lib/prisma';

// 네이버 OIDC provider — next-auth 내장이 없어 커스텀으로 구성.
// 공식 문서: https://developers.naver.com/docs/login/api/api.md
type NaverProfile = {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    profile_image?: string;
  };
};

const naverProvider = {
  id: 'naver',
  name: 'Naver',
  type: 'oauth' as const,
  authorization: {
    url: 'https://nid.naver.com/oauth2.0/authorize',
    params: { response_type: 'code' },
  },
  token: 'https://nid.naver.com/oauth2.0/token',
  userinfo: 'https://openapi.naver.com/v1/nid/me',
  clientId: process.env.NAVER_CLIENT_ID?.trim(),
  clientSecret: process.env.NAVER_CLIENT_SECRET?.trim(),
  profile(profile: NaverProfile) {
    const r = profile.response;
    return {
      id: r.id,
      name: r.name ?? r.nickname ?? null,
      email: r.email ?? null,
      image: r.profile_image ?? null,
    };
  },
};

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  // JWT strategy — Edge 런타임 미들웨어에서 Prisma 없이 세션 검증 가능.
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    naverProvider,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // 신규 유저라면 provider 필드를 최초 기록. 기존 유저는 마지막 로그인 경로로 갱신.
      if (!user?.id || !account?.provider) return true;
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { provider: account.provider },
        });
      } catch {
        // adapter가 user 레코드를 이제 막 생성하는 중일 수 있음 — 무시.
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
