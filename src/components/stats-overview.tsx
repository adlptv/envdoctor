'use client';

import { FileText, KeyRound, AlertTriangle, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanStats } from '@/types';

interface StatsOverviewProps {
  stats: ScanStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const items = [
    {
      label: 'Files Scanned',
      value: stats.totalFiles,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Variables Found',
      value: stats.totalVariables,
      icon: GitBranch,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Secrets Detected',
      value: stats.secretsDetected,
      icon: KeyRound,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Missing from .env',
      value: stats.missingFromEnvExample,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
