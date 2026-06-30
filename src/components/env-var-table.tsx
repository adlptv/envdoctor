'use client';

import { useState } from 'react';
import { Lock, Unlock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { cn, copyToClipboard } from '@/lib/utils';
import { DetectedEnvVar } from '@/types';

interface EnvVarTableProps {
  variables: DetectedEnvVar[];
}

export function EnvVarTable({ variables }: EnvVarTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'secret' | 'required'>('all');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = variables.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'secret' && !v.isSecret) return false;
    if (filter === 'required' && !v.required) return false;
    return true;
  });

  const handleCopy = async (name: string) => {
    await copyToClipboard(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search variables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          {(['all', 'secret', 'required'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'secret' ? '🔒 Secrets' : '✅ Required'}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Secret</TableHead>
              <TableHead>Files</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No variables found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.name}>
                  <TableCell className="font-mono font-medium">{v.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {v.required ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {v.defaultValue || '—'}
                  </TableCell>
                  <TableCell>
                    {v.isSecret ? (
                      <span className="inline-flex items-center gap-1 text-rose-500">
                        <Lock className="h-3 w-3" />
                        <span className="text-xs font-medium">Yes</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Unlock className="h-3 w-3" />
                        <span className="text-xs">No</span>
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.files.length} file{v.files.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleCopy(v.name)}
                    >
                      {copied === v.name ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
