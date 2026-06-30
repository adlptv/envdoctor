import Link from 'next/link';
import { prisma } from '@/lib/db';
import { StatsOverview } from '@/components/stats-overview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Plus, FileSearch, AlertTriangle, Clock } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { ScanStats } from '@/types';

async function getDashboardData() {
  const [projects, recentScans] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.scan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { project: true },
    }),
  ]);

  const totalFiles = recentScans.reduce((sum, s) => {
    const files = JSON.parse(s.files);
    return sum + (Array.isArray(files) ? files.length : 0);
  }, 0);

  const totalVars = recentScans.reduce((sum, s) => {
    const vars = JSON.parse(s.variables);
    return sum + (Array.isArray(vars) ? vars.length : 0);
  }, 0);

  const totalSecrets = recentScans.reduce((sum, s) => {
    const stats = JSON.parse(s.stats);
    return sum + (stats.secretsDetected || 0);
  }, 0);

  const totalMissing = recentScans.reduce((sum, s) => {
    const stats = JSON.parse(s.stats);
    return sum + (stats.missingFromEnvExample || 0);
  }, 0);

  return {
    projects,
    recentScans,
    aggregateStats: {
      totalFiles,
      totalVariables: totalVars,
      secretsDetected: totalSecrets,
      missingFromEnvExample: totalMissing,
      byLanguage: {},
      byType: {},
    } as ScanStats,
  };
}

export default async function DashboardPage() {
  const { projects, recentScans, aggregateStats } = await getDashboardData();

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your environment variable audits</p>
        </div>
        <Button asChild>
          <Link href="/projects/new"><Plus className="mr-2 h-4 w-4" /> New Scan</Link>
        </Button>
      </div>

      <div className="mb-8">
        <StatsOverview stats={aggregateStats} />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No projects yet"
          description="Create your first project and scan files to see results here."
          action={<Button asChild><Link href="/projects/new">Create Project</Link></Button>}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recently updated projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.description || 'No description'}</p>
                    </div>
                    <Badge variant="outline">{p.language}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent scans */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Latest audit results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentScans.map((s) => {
                  const stats = JSON.parse(s.stats);
                  const vars = JSON.parse(s.variables);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{s.project.name}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(s.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{vars.length} vars</Badge>
                        {stats.secretsDetected > 0 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {stats.secretsDetected}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
