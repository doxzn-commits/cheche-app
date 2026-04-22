import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// 한 캠페인에 묶인 여러 event(id)의 done 플래그를 한 번에 토글 — 이름이 같은 리뷰 마감·체험 기간 일괄 처리용.
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || typeof body.done !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const ids = body.ids.map(String).filter(Boolean).slice(0, 50);
  await prisma.event.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { done: body.done },
  });
  return NextResponse.json({ ok: true });
}
