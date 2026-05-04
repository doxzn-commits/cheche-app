import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

function sanitizeString(v: unknown, max: number): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s.slice(0, max);
}

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.date === 'string') data.date = body.date.slice(0, 10);
  if (typeof body.name === 'string') data.name = body.name.slice(0, 200);
  if (typeof body.plat === 'string') data.plat = body.plat.slice(0, 50);
  if (typeof body.label === 'string') data.label = body.label.slice(0, 30);
  if (typeof body.location === 'string') data.location = body.location.slice(0, 100) || '—';
  if ('amount' in body) data.amount = sanitizeString(body.amount, 30);
  if ('guideline' in body) data.guideline = sanitizeString(body.guideline, 2000);
  if ('benefit' in body) data.benefit = sanitizeString(body.benefit, 200);
  if ('campaignType' in body) data.campaignType = sanitizeString(body.campaignType, 50);
  if ('pointAmount' in body) {
    data.pointAmount =
      typeof body.pointAmount === 'number' && body.pointAmount > 0
        ? Math.floor(body.pointAmount)
        : null;
  }
  if (Array.isArray(body.channels)) {
    data.channels = body.channels.map((c) => String(c).slice(0, 30)).slice(0, 10);
  }
  if ('done' in body) data.done = Boolean(body.done);

  // updateMany 로 userId 조건을 where 에 강제 → 다른 유저 데이터 차단.
  const result = await prisma.event.updateMany({
    where: { id, userId: session.user.id },
    data,
  });
  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const updated = await prisma.event.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const result = await prisma.event.deleteMany({
    where: { id, userId: session.user.id },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
