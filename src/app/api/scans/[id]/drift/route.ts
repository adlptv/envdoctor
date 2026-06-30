import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { driftDetector } from '@/lib/drift-detector';
import { DriftResult } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: params.id },
      include: { driftReports: true },
    });

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found' },
        { status: 404 },
      );
    }

    const driftReport = scan.driftReports[0];
    if (!driftReport) {
      return NextResponse.json({
        success: true,
        data: { missingVars: [], extraVars: [], matchedVars: [] } as DriftResult,
      });
    }

    const result: DriftResult = {
      missingVars: JSON.parse(driftReport.missingVars),
      extraVars: JSON.parse(driftReport.extraVars),
      matchedVars: [],
    };

    // Generate summary
    const summary = driftDetector.generateSummary(result);

    return NextResponse.json({ success: true, data: { ...result, summary } });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drift report' },
      { status: 500 },
    );
  }
}
