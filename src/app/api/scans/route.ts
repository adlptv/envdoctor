import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const scans = await prisma.scan.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { project: true },
    });

    return NextResponse.json({ success: true, data: scans });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scans' },
      { status: 500 },
    );
  }
}
