import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fileScanner } from '@/lib/scanner';
import { driftDetector } from '@/lib/drift-detector';
import { scanFilesSchema } from '@/lib/validation';
import { ApiResponse, ScanResult } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ScanResult & { projectId?: string }>>> {
  try {
    const body = await req.json();
    const { files, envExample, config, projectName, projectDesc, repoPath } = body;

    // Validate
    const parsed = scanFilesSchema.parse({ files, envExample, config });

    // Scan files
    const scanResult = fileScanner.scanFiles(
      parsed.files,
      parsed.config || {
        languages: ['typescript', 'javascript'],
        detectSecrets: true,
        inferTypes: true,
        checkDrift: true,
        customSecretPatterns: [],
      },
    );

    // Check drift if env example provided
    let drift = null;
    if (parsed.envExample && parsed.config?.checkDrift !== false) {
      const expectedVars = driftDetector.parseEnvExample(parsed.envExample);
      const detectedVars = scanResult.variables.map((v) => v.name);
      drift = driftDetector.detect(expectedVars, detectedVars);
      scanResult.stats.missingFromEnvExample = drift.missingVars.length;
    }

    // Save to database
    let projectId: string | undefined;

    if (projectName) {
      const project = await prisma.project.create({
        data: {
          name: projectName,
          description: projectDesc || null,
          repoPath: repoPath || null,
          language: 'typescript',
        },
      });
      projectId = project.id;

      const scan = await prisma.scan.create({
        data: {
          projectId: project.id,
          files: JSON.stringify(scanResult.files.map((f) => f.path)),
          variables: JSON.stringify(scanResult.variables.map((v) => v.name)),
          stats: JSON.stringify(scanResult.stats),
        },
      });

      // Save env vars
      await prisma.envVar.createMany({
        data: scanResult.variables.map((v) => ({
          scanId: scan.id,
          name: v.name,
          type: v.type,
          required: v.required,
          defaultValue: v.defaultValue || null,
          description: v.description || null,
          isSecret: v.isSecret,
          usageCount: v.usageCount,
          files: JSON.stringify(v.files),
        })),
      });

      // Save drift report
      if (drift) {
        await prisma.driftReport.create({
          data: {
            scanId: scan.id,
            missingVars: JSON.stringify(drift.missingVars),
            extraVars: JSON.stringify(drift.extraVars),
          },
        });
      }

      scanResult.id = scan.id;
      scanResult.projectId = project.id;
    }

    return NextResponse.json({
      success: true,
      data: { ...scanResult, projectId },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input: ' + error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Scan failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}
