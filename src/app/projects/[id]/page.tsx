import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnvVarTable } from '@/components/env-var-table';
import { DriftAlerts } from '@/components/drift-alerts';
import { SecretWarnings } from '@/components/secret-warnings';
import { StatsOverview } from '@/components/stats-overview';
import { CodeBlock } from '@/components/code-block';
import { docGenerator } from '@/lib/doc-generator';
import { accessorGenerator } from '@/lib/accessor-generator';
import { driftDetector } from '@/lib/drift-detector';
import { ArrowLeft, Download, FileCode, FileText } from 'lucide-react';
import { DetectedEnvVar, ScanStats, DriftResult } from '@/types';
import { timeAgo } from '@/lib/utils';

async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
        include: {
          envVars: true,
          driftReports: true,
        },
      },
    },
  });
  return project;
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();

  const latestScan = project.scans[0];
  if (!latestScan) {
    return (
      <div className="container py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
        </Button>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">No scans yet</h2>
          <p className="text-muted-foreground mt-2">Upload files to start scanning.</p>
          <Button asChild className="mt-4">
            <Link href="/projects/new">New Scan</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stats = JSON.parse(latestScan.stats) as ScanStats;
  const variables: DetectedEnvVar[] = latestScan.envVars.map((v) => ({
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

  const driftReport = latestScan.driftReports[0];
  const drift: DriftResult | null = driftReport
    ? {
        missingVars: JSON.parse(driftReport.missingVars),
        extraVars: JSON.parse(driftReport.extraVars),
        matchedVars: [],
      }
    : null;

  const markdownDocs = docGenerator.generateMarkdown({
    files: [],
    variables,
    stats,
  });

  const accessorCode = accessorGenerator.generate(variables, project.name);

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects</Link>
      </Button>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.description || 'No description'}
          </p>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">{project.language}</Badge>
            <Badge variant="secondary">Last scan: {timeAgo(latestScan.createdAt)}</Badge>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/projects/new">New Scan</Link>
        </Button>
      </div>

      <div className="mb-8">
        <StatsOverview stats={stats} />
      </div>

      <Tabs defaultValue="variables" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="drift">Drift</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="accessor">Accessor</TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="mt-6">
          <EnvVarTable variables={variables} />
        </TabsContent>

        <TabsContent value="drift" className="mt-6">
          <DriftAlerts drift={drift} />
        </TabsContent>

        <TabsContent value="secrets" className="mt-6">
          <SecretWarnings variables={variables} />
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Generated Documentation</h3>
              </div>
              <a
                href={`/api/scans/${latestScan.id}/docs`}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Download className="h-4 w-4" /> Download .md
              </a>
            </div>
            <CodeBlock code={markdownDocs} language="markdown" filename="ENVIRONMENT.md" />
          </div>
        </TabsContent>

        <TabsContent value="accessor" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Typed Accessor (env.ts)</h3>
              </div>
              <a
                href={`/api/scans/${latestScan.id}/accessor`}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Download className="h-4 w-4" /> Download .ts
              </a>
            </div>
            <CodeBlock code={accessorCode} language="typescript" filename="env.ts" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
