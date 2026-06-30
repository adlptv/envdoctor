'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FolderGit2, Settings2, ScanLine, FileCheck2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { scanFilesSchema } from '@/lib/validation';

const STEPS = ['Project', 'Files', 'Configure', 'Review'] as const;

export function ScanWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [files, setFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [envExample, setEnvExample] = useState('');
  const [detectSecrets, setDetectSecrets] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);
  const [checkDrift, setCheckDrift] = useState(true);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;

    Array.from(uploaded).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setFiles((prev) => [...prev, { path: file.name, content }]);
      };
      reader.readAsText(file);
    });
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setProgress(10);

    try {
      setProgress(30);
      const payload = {
        files,
        envExample: envExample || undefined,
        config: {
          languages: ['typescript', 'javascript'] as const,
          detectSecrets,
          inferTypes,
          checkDrift,
          customSecretPatterns: [],
        },
      };

      const parsed = scanFilesSchema.parse(payload);
      setProgress(50);

      const res = await fetch('/api/scan-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, projectName, projectDesc, repoPath }),
      });

      setProgress(80);

      if (!res.ok) throw new Error('Scan failed');

      const data = await res.json();
      setProgress(100);

      toast({
        title: 'Scan complete!',
        description: `Found ${data.data?.stats?.totalVariables || 0} variables across ${data.data?.stats?.totalFiles || 0} files.`,
      });

      setTimeout(() => {
        if (data.data?.projectId) {
          router.push(`/projects/${data.data.projectId}`);
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    } catch (err) {
      toast({
        title: 'Scan failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Step indicator */}
      <div className="mb-8 flex justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                i <= step
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              {i < step ? <FileCheck2 className="h-5 w-5" /> : i + 1}
            </div>
            <span className={`text-xs ${i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Project Info */}
            {step === 0 && (
              <motion.div
                key="project"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FolderGit2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Project Setup</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="my-awesome-app" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (optional)</Label>
                  <Input id="desc" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="A brief description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo">Repository Path (optional)</Label>
                  <Input id="repo" value={repoPath} onChange={(e) => setRepoPath(e.target.value)} placeholder="/path/to/repo or https://github.com/user/repo" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(1)} disabled={!projectName}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: File Upload */}
            {step === 1 && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Upload Files</h2>
                </div>
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop or click to upload source files
                  </p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" asChild>
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </Label>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{files.length} file(s) uploaded</p>
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border p-2 text-sm">
                        <span className="font-mono">{f.path}</span>
                        <span className="text-muted-foreground">{f.content.length} bytes</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="env">.env.example content (optional)</Label>
                  <textarea
                    id="env"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    value={envExample}
                    onChange={(e) => setEnvExample(e.target.value)}
                    placeholder="DATABASE_URL=&#10;PORT=3000&#10;"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button onClick={() => setStep(2)} disabled={files.length === 0}>Next</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Configuration */}
            {step === 2 && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Scan Configuration</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Detect Secrets</p>
                      <p className="text-sm text-muted-foreground">Flag variables matching secret patterns</p>
                    </div>
                    <Switch checked={detectSecrets} onCheckedChange={setDetectSecrets} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Infer Types</p>
                      <p className="text-sm text-muted-foreground">Automatically detect variable types</p>
                    </div>
                    <Switch checked={inferTypes} onCheckedChange={setInferTypes} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Check Drift</p>
                      <p className="text-sm text-muted-foreground">Compare .env.example with actual usage</p>
                    </div>
                    <Switch checked={checkDrift} onCheckedChange={setCheckDrift} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Review</Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review & Scan */}
            {step === 3 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ScanLine className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-semibold">Review & Scan</h2>
                </div>
                <div className="space-y-2 rounded-lg border p-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Project:</span><span className="font-medium">{projectName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Files:</span><span className="font-medium">{files.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Secret detection:</span><span>{detectSecrets ? '✅' : '❌'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type inference:</span><span>{inferTypes ? '✅' : '❌'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Drift check:</span><span>{checkDrift ? '✅' : '❌'}</span></div>
                </div>
                {scanning && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-center text-sm text-muted-foreground">
                      {progress < 50 ? 'Scanning files...' : progress < 80 ? 'Analyzing...' : 'Saving results...'}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={scanning}>Back</Button>
                  <Button onClick={handleScan} disabled={scanning}>
                    {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : 'Start Scan'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
