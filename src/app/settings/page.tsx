'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Save, RotateCcw } from 'lucide-react';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  defaultLanguage: string;
  autoScan: boolean;
  secretPatterns: string[];
  excludePatterns: string[];
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    defaultLanguage: 'typescript',
    autoScan: false,
    secretPatterns: [],
    excludePatterns: ['node_modules', '.git', 'dist', 'build'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [newExclude, setNewExclude] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setSettings(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    } catch {
      toast({ title: 'Save failed', description: 'Could not save settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      theme: 'system',
      defaultLanguage: 'typescript',
      autoScan: false,
      secretPatterns: [],
      excludePatterns: ['node_modules', '.git', 'dist', 'build'],
    });
    toast({ title: 'Settings reset', description: 'Reverted to defaults.' });
  };

  if (loading) {
    return <div className="container py-8"><p className="text-muted-foreground">Loading settings...</p></div>;
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure EnvDoctor preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Language</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              >
                {['typescript', 'javascript', 'python', 'go', 'rust', 'java'].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-scan on upload</p>
                <p className="text-sm text-muted-foreground">Automatically scan files when uploaded</p>
              </div>
              <Switch
                checked={settings.autoScan}
                onCheckedChange={(v) => setSettings({ ...settings, autoScan: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Secret Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Secret Patterns</CardTitle>
            <CardDescription>Add regex patterns for secret detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. MY_API_[A-Z_]+"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newPattern) {
                    setSettings({ ...settings, secretPatterns: [...settings.secretPatterns, newPattern] });
                    setNewPattern('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {settings.secretPatterns.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2">
                  <code className="text-sm">{p}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setSettings({ ...settings, secretPatterns: settings.secretPatterns.filter((_, idx) => idx !== i) })}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              {settings.secretPatterns.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom patterns. Built-in patterns are active.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exclude Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Exclude Patterns</CardTitle>
            <CardDescription>Directories and files to skip during scanning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. vendor"
                value={newExclude}
                onChange={(e) => setNewExclude(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newExclude) {
                    setSettings({ ...settings, excludePatterns: [...settings.excludePatterns, newExclude] });
                    setNewExclude('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {settings.excludePatterns.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2">
                  <code className="text-sm">{p}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setSettings({ ...settings, excludePatterns: settings.excludePatterns.filter((_, idx) => idx !== i) })}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      <p className="text-center text-xs text-muted-foreground">
        EnvDoctor v1.0.0 — Built with Next.js, Prisma, and Zod
      </p>
    </div>
  );
}
