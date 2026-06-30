import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: params.id },
      include: { project: true, envVars: true, driftReports: true },
    });

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: scan });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scan' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    await prisma.scan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete scan' },
      { status: 500 },
    );
  }
}
