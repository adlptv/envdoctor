'use client';

import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetectedEnvVar } from '@/types';

interface SecretWarningsProps {
  variables: DetectedEnvVar[];
}

export function SecretWarnings({ variables }: SecretWarningsProps) {
  const secrets = variables.filter((v) => v.isSecret);

  if (secrets.length === 0) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            No Secrets Detected
          </CardTitle>
          <CardDescription>No variables match secret naming patterns or known secret formats.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-rose-500/30 bg-rose-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-5 w-5" />
          {secrets.length} Secret Variable{secrets.length !== 1 ? 's' : ''} Detected
        </CardTitle>
        <CardDescription>
          These variables likely contain sensitive data. Ensure they are not committed to version control.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {secrets.map((v) => (
            <div
              key={v.name}
              className="flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/5 p-3"
            >
              <div className="flex items-center gap-3">
                <ShieldX className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="font-mono text-sm font-medium">{v.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Used in {v.files.length} file{v.files.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs">
                {v.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
