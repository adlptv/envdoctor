'use client';

import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DriftResult } from '@/types';

interface DriftAlertsProps {
  drift: DriftResult | null;
}

export function DriftAlerts({ drift }: DriftAlertsProps) {
  if (!drift) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            No Drift
          </CardTitle>
          <CardDescription>.env.example is in sync with code usage.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasIssues = drift.missingVars.length > 0 || drift.extraVars.length > 0;

  return (
    <div className="space-y-4">
      {drift.missingVars.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Missing from .env.example
            </CardTitle>
            <CardDescription>
              These variables are used in code but not declared in .env.example
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {drift.missingVars.map((v) => (
                <Badge key={v} variant="warning" className="font-mono">
                  {v}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {drift.extraVars.length > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400">
              <AlertCircle className="h-5 w-5" />
              Unused in .env.example
            </CardTitle>
            <CardDescription>
              These variables are in .env.example but not used in code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {drift.extraVars.map((v) => (
                <Badge key={v} variant="outline" className="font-mono">
                  {v}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasIssues && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Perfect Sync
            </CardTitle>
            <CardDescription>All variables are properly declared and used.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {drift.matchedVars.length > 0 && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-sm">Matched Variables ({drift.matchedVars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {drift.matchedVars.map((v) => (
                <Badge key={v} variant="success" className="font-mono">
                  ✓ {v}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
