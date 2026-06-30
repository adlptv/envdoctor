import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { docGenerator } from '@/lib/doc-generator';
import { accessorGenerator } from '@/lib/accessor-generator';
import { driftDetector } from '@/lib/drift-detector';
import { DetectedEnvVar, ScanStats } from '@/types';
import { exportFormatSchema } from '@/lib/validation';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const format = exportFormatSchema.parse(
      new URL(req.url).searchParams.get('format') || 'markdown'
    );

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

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'markdown':
        content = docGenerator.generateMarkdown({
          files: [],
          variables,
          stats,
        });
        contentType = 'text/markdown';
        filename = 'ENVIRONMENT.md';
        break;
      case 'json':
        content = docGenerator.generateJSON({
          files: [],
          variables,
          stats,
        });
        contentType = 'application/json';
        filename = 'env-report.json';
        break;
      case 'env':
        content = docGenerator.generateEnvExample(variables);
        contentType = 'text/plain';
        filename = '.env.example';
        break;
      case 'typescript':
        content = accessorGenerator.generate(variables, scan.project.name);
        contentType = 'text/plain';
        filename = 'env.ts';
        break;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 },
    );
  }
}
