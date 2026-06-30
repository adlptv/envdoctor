import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { Plus, FolderGit2, ChevronRight } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { scans: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your scanned projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new"><Plus className="mr-2 h-4 w-4" /> New Project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create a project and upload files to start auditing environment variables."
          action={<Button asChild><Link href="/projects/new">Create Your First Project</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const lastScan = p.scans[0];
            const stats = lastScan ? JSON.parse(lastScan.stats) : null;
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <Badge variant="outline">{p.language}</Badge>
                    </div>
                    <CardDescription>{p.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-3 text-muted-foreground">
                        {stats && (
                          <>
                            <span>{stats.totalVariables || 0} vars</span>
                            {stats.secretsDetected > 0 && (
                              <span className="text-rose-500">{stats.secretsDetected} secrets</span>
                            )}
                          </>
                        )}
                        <span>Updated {timeAgo(p.updatedAt)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
