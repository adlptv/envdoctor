import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { accessorGenerator } from '@/lib/accessor-generator';
import { DetectedEnvVar } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
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

    const code = accessorGenerator.generate(variables, scan.project.name);

    return new NextResponse(code, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="env.ts"',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to generate accessor' },
      { status: 500 },
    );
  }
}
