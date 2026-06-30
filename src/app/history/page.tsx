import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { History, AlertTriangle, ChevronRight } from 'lucide-react';
import { timeAgo, formatDate } from '@/lib/utils';

export default async function HistoryPage() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { project: true },
  });

  if (scans.length === 0) {
    return (
      <div className="container py-8">
        <EmptyState
          icon={History}
          title="No scan history"
          description="Run your first scan to see results here."
          action={<Button asChild><Link href="/projects/new">Start Scanning</Link></Button>}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Scan History</h1>
      <p className="text-muted-foreground mb-8">All past environment variable audits</p>

      <div className="space-y-3">
        {scans.map((scan) => {
          const stats = JSON.parse(scan.stats);
          const vars = JSON.parse(scan.variables);
          const hasSecrets = stats.secretsDetected > 0;
          const hasDrift = stats.missingFromEnvExample > 0;

          return (
            <Link key={scan.id} href={`/projects/${scan.projectId}`}>
              <Card className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <History className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{scan.project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(scan.createdAt)} · {timeAgo(scan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{vars.length} vars</Badge>
                    <Badge variant="outline">{stats.totalFiles} files</Badge>
                    {hasSecrets && (
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {stats.secretsDetected} secrets
                      </Badge>
                    )}
                    {hasDrift && (
                      <Badge variant="warning">{stats.missingFromEnvExample} drift</Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
