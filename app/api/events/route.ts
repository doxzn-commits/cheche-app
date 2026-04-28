import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// CalEvent type 필드 매핑 테이블 — 'r' 은 리뷰 마감, 'g' 는 체험 기간.
const LABEL_MAP: Record<string, string> = { r: '리뷰 마감', g: '체험 기간' };

function sanitizeString(v: unknown, max: number): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s.slice(0, max);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
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

  const type = typeof body.type === 'string' ? body.type : '';
  if (type !== 'r' && type !== 'g') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const date = sanitizeString(body.date, 10);
  const name = sanitizeString(body.name, 200);
  const plat = sanitizeString(body.plat, 50);
  if (!date || !name || !plat) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const channels = Array.isArray(body.channels)
    ? body.channels.map((c) => String(c).slice(0, 30)).slice(0, 10)
    : [];

  const created = await prisma.event.create({
    data: {
      userId: session.user.id,
      date,
      type,
      label: typeof body.label === 'string' && body.label ? body.label.slice(0, 30) : (LABEL_MAP[type] ?? ''),
      name,
      plat,
      location: sanitizeString(body.location, 100) ?? '—',
      amount: sanitizeString(body.amount, 30),
      guideline: sanitizeString(body.guideline, 2000),
      benefit: sanitizeString(body.benefit, 200),
      campaignType: sanitizeString(body.campaignType, 50),
      pointAmount: typeof body.pointAmount === 'number' && body.pointAmount > 0 ? Math.floor(body.pointAmount) : null,
      channels,
      done: Boolean(body.done),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
