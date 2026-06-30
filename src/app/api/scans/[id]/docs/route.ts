import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { docGenerator } from '@/lib/doc-generator';
import { DetectedEnvVar, ScanResult, ScanStats } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const format = new URL(req.url).searchParams.get('format') || 'markdown';

    const scan = await prisma.scan.findUnique({
      where: { id: params.id },
      include: { envVars: true, project: true },
    });

    if (!scan) {
      return NextResponse.json(
        { success: false, error: 'Scan not found' },
        { status: 404 },
      );
    }

    const variables: DetectedEnvVar[] = scan.envVars.map((v) => ({
      name: v.name,
      type: v.type as DetectedEnvVar['type'],
      required: v.required,
      defaultValue: v.defaultValue || undefined,
      description: v.description || undefined,
      isSecret: v.isSecret,
      usageCount: v.usageCount,
      files: JSON.parse(v.files),
      usagePatterns: [],
    }));

    const stats = JSON.parse(scan.stats) as ScanStats;

    const scanResult: ScanResult = {
      id: scan.id,
      projectId: scan.projectId,
      files: [],
      variables,
      stats,
      createdAt: scan.createdAt.toISOString(),
    };

    if (format === 'json') {
      const json = docGenerator.generateJSON(scanResult);
      return new NextResponse(json, {
        headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="env-report.json"' },
      });
    }

    if (format === 'env') {
      const env = docGenerator.generateEnvExample(variables);
      return new NextResponse(env, {
        headers: { 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename=".env.example"' },
      });
    }

    // Default: markdown
    const md = docGenerator.generateMarkdown(scanResult);
    return new NextResponse(md, {
      headers: { 'Content-Type': 'text/markdown', 'Content-Disposition': 'attachment; filename="ENVIRONMENT.md"' },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to generate documentation' },
      { status: 500 },
    );
  }
}
