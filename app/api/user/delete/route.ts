import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // 카카오 연결 해제용 access_token — DB 삭제 전에 조회해야 함.
  const kakaoAccount = await prisma.account.findFirst({
    where: { userId, provider: 'kakao' },
    select: { access_token: true },
  });

  // 명시적 삭제 트랜잭션 (onDelete: Cascade 로도 cascade 되지만 순서를 보장하기 위해 명시).
  await prisma.$transaction([
    prisma.revenue.deleteMany({ where: { userId } }),
    prisma.event.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  // 카카오 연결 해제 — DB 삭제가 이미 완료됐으므로 실패해도 응답에 영향 없음.
  if (kakaoAccount?.access_token) {
    fetch('https://kapi.kakao.com/v1/user/unlink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${kakaoAccount.access_token}` },
    }).catch((e: unknown) => console.error('[kakao unlink]', e));
  }

  return NextResponse.json({ ok: true });
}
