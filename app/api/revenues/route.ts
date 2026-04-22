import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

function toInt(v: unknown, max = 1_000_000_000): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

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
  const revenues = await prisma.revenue.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(revenues);
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

  const name = sanitizeString(body.name, 200);
  const plat = sanitizeString(body.plat, 50);
  const channel = sanitizeString(body.channel, 30);
  const date = sanitizeString(body.date, 10);
  if (!name || !plat || !channel || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const created = await prisma.revenue.create({
    data: {
      userId: session.user.id,
      linkId: sanitizeString(body.linkId, 50),
      name,
      plat,
      channel,
      date,
      goods: toInt(body.goods),
      ad: toInt(body.ad),
      emoji: sanitizeString(body.emoji, 8),
    },
  });
  return NextResponse.json(created, { status: 201 });
}
